require "rubygems"
require "bundler/setup"

require 'sinatra'
require 'rack/linkeddata'


require File.dirname(__FILE__)+'/lib/annotation'

class CultureHack < Sinatra::Base
  before do 
    headers "Access-Control-Allow-Origin" => "*"
  end

  use Rack::LinkedData::ContentNegotiation
  
  configure do |app|
    set :static, true
    set :public, File.dirname(__FILE__) + "/public"        
  end
  
  get '/status' do
    "Hello World! :)"
  end
  
  get '/annotations/?' do
    content_type 'application/json'
    @image = params[:image] || 'http://www.gac.culture.gov.uk/images/standard/17686.jpg'
    Annotation.list(@image).to_json
  end
  
  post '/annotations/?' do
    uri = Annotation.save( params )
    content_type 'application/json'
    { "annotation_id" => uri.to_s }.to_json
  end
  
  get '/annotations/:id/?' do
    Annotation.describe(params[:id])
  end
  
#  post '/annotations/:id/?' do
#    Annotation.update( params )
#  end
  
  get '/related/?' do
    content_type 'application/json'
    subject = params[:subject] || 'http://data.kasabi.com/dataset/government-art-collection/sitters/130697'
    
    Annotation.related(subject).to_json
  end
end