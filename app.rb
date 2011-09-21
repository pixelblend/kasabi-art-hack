require "rubygems"
require "bundler/setup"

require 'sinatra'


class CultureHack < Sinatra::Base
  get '/' do
    "Hello World! :)"
  end
  
  get '/annotations' do
    content_type 'application/json'
    @image = params[:url]
    %Q* [ { "top": 286, 
               "left": 161, 
               "width": 52, 
               "height": 37, 
               "text": "Small people on the steps", 
               "id": "e69213d0-2eef-40fa-a04b-0ed998f9f1f5", 
               "editable": false },
             { "top": 134, 
               "left": 179, 
               "width": 68, 
               "height": 74, 
               "text": "National Gallery Dome", 
               "id": "e7f44ac5-bcf2-412d-b440-6dbb8b19ffbe", 
               "editable": true } ]   
      *
  end
end