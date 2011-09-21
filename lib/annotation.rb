require 'kasabi'
require 'linkeddata'
require 'uuid'

class Annotation
  ATTRIBUTES = %w{top left width height text id}
  API_DOMAIN = 'http://kasabi-art-hack.heroku.com'
  ANNOTATION_NS = RDF::Vocabulary.new("http://www.w3.org/2000/10/annotation-ns#")
  ARTHACK = RDF::Vocabulary.new("http://kasabi-art-hack.heroku.com/schema#")
  ID = UUID.new
  
  def self.dataset(endpoint)
    Kasabi::Dataset.new(endpoint, {:apikey => ENV['KASABI_API_KEY']})
  end
  
  def self.sparql(endpoint="http://data.kasabi.com/dataset/government-art-collection-annotations")
    dataset(endpoint).sparql_endpoint_client
  end
  
  def self.describe(id)
    uri = "#{API_DOMAIN}/annotations/#{id}"
    repository = RDF::Repository.new
    
    repository << sparql.describe_uri(uri).statements
    
    subject = repository.first_object [nil, RDF::DC.subject, nil]
    subject = "#{subject}.rdf" if subject.to_s.include?('kasabi')
    
    subject_graph = RDF::Graph.load subject    
    repository << subject_graph.statements
    
    repository
  end  
  
  def self.save( params )
    store = dataset.store_api_client
    uri = RDF::URI.new("#{API_DOMAIN}/annotations/#{ID.generate}")
    
    
    repository = RDF::Repository.new
    
    repository << [ uri, RDF.type, ANNOTATION_NS.Annotation ]
    repository << [ uri, ANNOTATION_NS.annotates, RDF::URI.new( params[:image] ) ]
    repository << [ uri, ANNOTATION_NS.body, params[:text] ]
    repository << [ uri, ARTHACK.top, params[:top] ]
    repository << [ uri, ARTHACK.width, params[:width] ]
    repository << [ uri, ARTHACK.height, params[:height] ]
    repository << [ uri, ARTHACK.left, params[:left] ]
    repository << [ uri, RDF::DC.subject, RDF::URI.new( params[:subject] ) ] if params[:subject]
    
    store.store_data( repository.dump(:rdfxml) )
    return uri      
  end
  
  def self.list(image)
    query = <<EOF
    prefix a: <http://www.w3.org/2000/10/annotation-ns#>
    prefix arthack: <http://kasabi-art-hack.heroku.com/schema#>
    prefix dcterms: <http://purl.org/dc/terms/>


    SELECT * WHERE {

      ?id a a:Annotation;
      a:body ?text;
      a:annotates <#{image}>;
      arthack:top ?top;
      arthack:left ?left;
      arthack:height ?height;
      arthack:width ?width.

      OPTIONAL {
        ?id dcterms:subject ?subject.
      }

    }
EOF
    result = sparql.select query
    annotations = result['results']['bindings'].collect do |row|
      new_annotation = {}
      ATTRIBUTES.each do |attr|
        new_annotation[attr] = row[attr]['value']
      end
      
      new_annotation
    end
  end
    def self.related(subject)
      related_objects = []
      
      annotate_query = <<EOF
    prefix a: <http://www.w3.org/2000/10/annotation-ns#>
    prefix arthack: <http://kasabi-art-hack.heroku.com/schema#>
    prefix dcterms: <http://purl.org/dc/terms/>


    SELECT DISTINCT ?annotates WHERE {

      ?annotation a a:Annotation;

      a:annotates ?annotates;
      dcterms:subject <#{subject}>;

    }
EOF
      result = sparql.select annotate_query

      result['results']['bindings'].each do |r|
        image_uri = r['annotates']['value']

        related_query = <<EOF
        prefix f: <http://xmlns.com/foaf/0.1/>
        prefix rc: <http://www.w3.org/2000/01/rdf-schema#>
        prefix dp: <http://xmlns.com/foaf/0.1/>

        SELECT * WHERE {
         <#{image_uri}> f:thumbnail ?thumbnail;
         rc:label ?label;
         dp:depicts ?depicts.
        }
EOF

        related_result = sparql('http://data.kasabi.com/dataset/government-art-collection').select related_query
        related_result['results']['bindings'].each do |rel|
          # raise rel.keys.inspect
          related_objects << {
            'thumbnail' => rel['thumbnail']['value'],
            'name' => rel['label']['value'],
            'url' => rel['depicts']['value']
          }
        end
      end
      related_objects
    end
end