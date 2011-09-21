require "rubygems"
require "bundler/setup"

require 'sinatra'
require File.dirname(__FILE__)+'/lib/annotation'

CONFIG = YAML::load( File.open( 'config.yml' ) )

class CultureHack < Sinatra::Base
  get '/' do
    "Hello World! :)"
  end
  
  get '/annotations' do
    content_type 'application/json'
    @image = params[:url] || 'http://www.gac.culture.gov.uk/images/standard/17686.jpg'
    Annotation.list(@image).to_json
  end
end