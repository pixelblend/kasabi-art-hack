require "rubygems"
require "bundler/setup"

require 'sinatra'


class CultureHack < Sinatra::Base
  get '/' do
    "Hello World! :)"
  end
end