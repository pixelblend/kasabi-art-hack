require 'kasabi'
require 'linkeddata'
require 'uuid'
require 'pho'

class Annotation
  ATTRIBUTES = %w{top left width height text id}
  API_DOMAIN = 'http://kasabi-art-hack.heroku.com'
  ANNOTATION_NS = RDF::Vocabulary.new("http://www.w3.org/2000/10/annotation-ns#")
  ARTHACK = RDF::Vocabulary.new("http://kasabi-art-hack.heroku.com/schema#")
  ID = UUID.new
  
  def self.dataset
    @@dataset ||= Kasabi::Dataset.new("http://data.kasabi.com/dataset/government-art-collection-annotations", 
                                    {:apikey => ENV['KASABI_API_KEY']})
  end
  
  def self.sparql
    dataset.sparql_endpoint_client
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
    repository, uri = create_rdf( params )
    store.store_data( repository.dump(:rdfxml) )
    return uri      
  end

  def self.create_rdf( params, uri=nil)
    if uri == nil      
      uri = RDF::URI.new("#{API_DOMAIN}/annotations/#{ID.generate}")
    end
        
    repository = RDF::Repository.new
    
    repository << [ uri, RDF.type, ANNOTATION_NS.Annotation ]
    repository << [ uri, ANNOTATION_NS.annotates, RDF::URI.new( params[:image] ) ]
    repository << [ uri, ANNOTATION_NS.body, params[:text] ]
    repository << [ uri, ARTHACK.top, params[:top] ]
    repository << [ uri, ARTHACK.width, params[:width] ]
    repository << [ uri, ARTHACK.height, params[:height] ]
    repository << [ uri, ARTHACK.left, params[:left] ]
    repository << [ uri, RDF::DC.subject, RDF::URI.new( params[:subject] ) ] if params[:subject]
        
    return repository, uri          
  end
    
  def self.update( params )
    uri = "#{API_DOMAIN}/annotations/#{params[:id]}"
    sparql = dataset.sparql_endpoint_client
    stored = sparql.describe_uri( uri )
    latest, uri = create_rdf( params, RDF::URI.new( uri ) )
    
    cs = Pho::Update::ChangesetBuilder.build(uri,
        JSON.parse( stored.dump(:json) ), 
        JSON.parse( latest.dump(:json) ), "Update from user")

    dataset.store_api_client.apply_changeset( cs.to_rdf() )
  end
  
  def self.list(image)
    @dataset = Kasabi::Dataset.new("http://data.kasabi.com/dataset/government-art-collection-annotations", {:apikey => ENV['KASABI_API_KEY']})
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
end