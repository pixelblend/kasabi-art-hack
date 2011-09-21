require 'kasabi'

class Annotation
  ATTRIBUTES = %w{top left width height text id}
  
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