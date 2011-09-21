require 'kasabi'
require 'rdf'
require 'uuid'

class Annotation
  ATTRIBUTES = %w{top left width height text id}
  
  ANNOTATION_NS = RDF::Vocabulary.new("http://www.w3.org/2000/10/annotation-ns#")
  ARTHACK = RDF::Vocabulary.new("http://kasabi-art-hack.heroku.com/schema#")
  ID = UUID.new
  
  def self.save( params )
    @dataset = Kasabi::Dataset.new("http://data.kasabi.com/dataset/government-art-collection-annotations", {:apikey => ENV['KASABI_API_KEY']})
    store = @dataset.store_api_client()
    uri = RDF::URI.new("http://kasabi-art-hack.heroku.com/annotations/#{ID.generate}")
    
    
    repository = RDF::Repository.new()
    
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
    @dataset = Kasabi::Dataset.new("http://data.kasabi.com/dataset/government-art-collection-annotations", {:apikey => ENV['KASABI_API_KEY']})
    sparql = @dataset.sparql_endpoint_client()
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