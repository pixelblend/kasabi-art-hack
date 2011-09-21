var arthack = (function () {
if (typeof console == "undefined") console = { log: function(data){} };

function Overlay(){

	var FREEBASE_TOPICS = ["people/person"];

	var loadedScripts = [];

	var self = this;
	var sourceURL;

	this.init = function(){
		self.removeLoader();
		self.originalURL = window.location.href;
		self.loadCSS(self.sourceURL + "/overlay.css", "art-hack-css-loader");
		self.loadJQuery(self.jQueryLoaded);
	};

	this.start = function(){
		console.log("Everything's ready");
		//self.removeLoadedScripts();
		// App
		self.loadJS(self.sourceURL + "/../js/app.js", "app", function () {
			var app = new App(self.jQuery),
				imgSel;
			if (/(\.dev|local)/.test(document.location.host)) {
				imgSel = "#picture";
			} else {
				imgSel = "#contentMain #zoomImage img";
			}
			app.init(imgSel);
		});
	};

	// determine the base URL; remove the loader script element
	this.removeLoader = function(){
		var loader = document.getElementById("art-hack-loader");
		this.sourceURL = self.getSourceURLFromLoader(loader);
		loader.parentNode.removeChild(loader);
	};

	// determine the base URL
	this.getSourceURLFromLoader = function(loader){
		var src = loader.getAttribute("src").replace(/\?.*/, "");
		return src.substr(0, src.length - "/overlay.js".length);
	};

	// load a CSS file
	this.loadCSS = function(url, id) {
		var s = document.createElement("link");
		s.setAttribute("id", id);
		s.setAttribute("rel", "stylesheet");
		s.setAttribute("type", "text/css");
		s.setAttribute("href", url + '?' + Math.random());
		document.body.appendChild(s);
	};

	// load a Javascript file
	this.loadJS = function(url, id, callback) {
		var s = document.createElement("script");
		s.setAttribute("id", id);
		s.setAttribute("type", "text/javascript");
		s.setAttribute("src", url + '?' + Math.random());

		if (callback) s.addEventListener("load", callback, true);
		document.body.appendChild(s);
		loadedScripts.push(s);
	};

	this.removeLoadedScripts = function() {
		var $ = self.jQuery;
		loadedScripts.forEach(function (item, index) {
			item.parentNode.removeChild(item);
		})
	};

	// load jQuery
	this.loadJQuery = function(callback){
		self.loadJS(self.sourceURL + "/../js/jquery.min.js", "arthack-jquery", function () {
	console.log(jQuery)
			self.jQuery = jQuery.noConflict(true); // refer to jQuery as "self.jQuery"
	console.log(self.jQuery)
			self.loadScripts(callback);
		});
	};

	this.loadScripts = function (callback) {
		var numScriptsLoaded = 0;
		var loaded = function () {
			numScriptsLoaded++;
			if (numScriptsLoaded === 6) {
				callback();
			}
		};
		// Freebase
		self.loadJS(self.sourceURL + "/../js/suggest.min.js", "freebase-suggest", loaded);
		self.loadCSS(self.sourceURL + "/../js/suggest.min.css");

		self.loadJS(self.sourceURL + "/../js/jquery-ui.js", "ui", loaded);
		self.loadJS(self.sourceURL + "/../js/jquery.facedetection/facedetection/ccv.js", "ccv", loaded);
		self.loadJS(self.sourceURL + "/../js/jquery.facedetection/facedetection/face.js", "face", loaded);
		self.loadJS(self.sourceURL + "/../js/jquery.facedetection/jquery.facedetection.js", "facedetection", loaded);

		// Annotate
		self.loadJS(self.sourceURL + "/../js/jquery.annotate/jquery.annotate.js", "annotate", loaded);
		self.loadCSS(self.sourceURL + "/../js/jquery.annotate/annotation.css");
	};

	// called after jQuery is loaded
	this.jQueryLoaded = function(callback){
		window.addEventListener("message", self.receiveMessage, true); // listen for messages
		//self.createOverlay(); // create the sidebar overlay
		self.start();
	};
}

return new Overlay;
})();

arthack.init();
