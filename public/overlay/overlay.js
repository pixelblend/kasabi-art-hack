var arthack = (function () {
if (typeof console == "undefined") console = { log: function(data){} };

function Overlay(){

	var FREEBASE_TOPICS = ["people/person"];

	var loadedScripts = [];

	var self = this;
	var messageEvent, sourceURL, Zotero = {};

	this.init = function(){
		self.removeLoader();
		self.originalURL = window.location.href;
		//self.originalHTML = document.documentElement.innerHTML;
		self.loadCSS(self.sourceURL + "/overlay.css", "art-hack-css-loader");
		self.loadJQuery(self.jQueryLoaded);
	};

	this.start = function(){
		console.log("Everything's ready");
		//self.removeLoadedScripts();
		//var $ = self.jQuery;
		//var suggestInput = $("body").append('<div id="art-hack"><input type="text" id="art-hack-suggest"/></div>');
		//$("#art-hack-suggest").suggest({type:FREEBASE_TOPICS})
		//					  .bind("fb-select", function(e, data) {
		//					    console.log("fb-select", data);
		//					  });
		//	// App
		self.loadJS(self.sourceURL + "/../js/app.js", "app", function () {
			var app = new App(self.jQuery);
			app.init("#contentMain #zoomImage img");
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
		self.loadJS(self.sourceURL + "/../js/jquery.min.js", "mendeley-jquery", function () {
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

	// wrap the Javascript function (usually an extractor) in a closure, so it can use $ to refer to jQuery
	this.wrapFunction = function(data){
		return "(function($){" + data + "})(self.jQuery);";
	};
/*
	// http://web.archive.org/web/20071103070418/http://mgran.blogspot.com/2006/08/downloading-binary-streams-with.html
	this.getBinaryFile = function(data){
		console.log("Fetching " + data.url);
		var xhr = new XMLHttpRequest();

		xhr.addEventListener("loadstart", function(){ self.setProgress(0, "Fetching file"); }, false);
		xhr.addEventListener("progress", self.updateProgress, false);
		xhr.addEventListener("load", self.transferComplete, false);
		xhr.addEventListener("error", self.transferFailed, false);
		xhr.addEventListener("abort", self.transferCanceled, false);

		xhr.open("GET", data.url, false);
		xhr.overrideMimeType("text/plain; charset=x-user-defined");
		xhr.send(null);

		if (xhr.status != 200) {
			self.sendMessage("message", { status: "error", text: "File not found" });
			return false;
		}

		data.contentType = xhr.getResponseHeader("Content-Type");
		if (data.type == "application/pdf" && !data.contentType.match(/pdf/)) alert('The downloaded file was not a PDF?');

		data.data = xhr.responseText;
		self.sendMessage("received-file", data);
	};
*/
	/**
	* Progress
	**/
/*
	// progress on transfers from the server to the client (downloads)
	this.updateProgress = function(event) {
		if (event.lengthComputable) self.setProgress((event.loaded / event.total) * 100, "downloading");
		else console.log("File size unknown"); // Unable to compute progress information since the total size is unknown
	};

	this.transferComplete = function(event) {
		self.setProgress(100, "Downloaded");
	};

	this.transferFailed = function(event) {
		alert("An error occurred while transferring the file.");
	};

	this.transferCanceled = function(event) {
		alert("The transfer has been canceled by the user.");
	};

	this.setProgress = function(value, html){
		//console.log(value);
		sendMessage("progress", { value: value, html: html });
	};

	this.fileReceived = function(url, itemData, data, xhr){

	};
*/
	/**
	* Messaging
	*/

	this.sendMessage = function(id, value){
		self.messageEvent.source.postMessage(JSON.stringify([id, value]), self.messageEvent.origin);
	};

	this.receiveMessage = function(event){
		self.messageEvent = event;

		//if (event.origin !== "http://local") return; // TODO: will be the real site domain
		var data = JSON.parse(event.data);
		console.log(data[0]);

		switch (data[0]){
			case "eval":
				eval(self.wrapFunction(data[1]));
			break;

			case "html":
				self.sendMessage("html", [self.originalURL, self.originalHTML]);
			break;

			case "extract":
				var extractors = data[1];

				var meta = {
					"url": document.location.href,
					"title": document.title || "Untitled",
					"html": self.originalHTML,
					"type": "web",
					"files": {},
					"creator": [],
					"subject": []
				};

				self.jQuery.each(extractors, function(index, extractor){
					console.log(index);
					eval(self.wrapFunction(extractor));
				});

				console.log(meta);
				self.sendMessage("extracted", [meta]);
			break;

			case "fetch-file":
				self.getBinaryFile(data[1]);
			break;

			case "selection":
				var text;
				if (window.getSelection) text = window.getSelection().toString();
				else if (document.getSelection) text = document.getSelection().toString();
				else if (document.selection && document.selection.createRange) text = document.selection.createRange().text;
				self.sendMessage("selection", text);
			break;
		}
	};

	/**
	* Overlay
	**/

	// create the sidebar overlay
	this.createOverlay = function(){
		var overlay = self.jQuery("<div/>", { id: "mendeley-overlay" });

		self.jQuery("<a/>", { id: "mendeley-close" }).text("close").click(self.closeOverlay).appendTo(overlay);
		var content = self.jQuery("<div/>", { id: "mendeley-content" }).appendTo(overlay);

		self.jQuery("<iframe/>", { id: "mendeley-iframe", src: self.sourceURL + "/../sidebar/?" + Math.random() }).appendTo(content);
		self.jQuery("body").append(overlay);
	};

	// close the sidebar overlay and remove listeners
	this.closeOverlay = function(){
		self.sendMessage("destruct");
		window.removeEventListener("message", self.receiveMessage, true);

		var elements = ["mendeley-overlay", "mendeley-sidebar-css-loader", "mendeley-jquery"];
		self.jQuery.each(elements, function(index, value){
			var node = self.jQuery("#" + value);
			node.attr("src", null).attr("href", null);
			node.remove();
		});
	};

	/**
	* Extractor helper functions
	**/

	// build a normalised (lower-cased) index of meta elements
	this.prepareMeta = function(){
		self.meta = {};
		self.jQuery("meta[name][content]").each(function(){
			var node = self.jQuery(this);
			var name = self.jQuery.trim(node.attr("name")).toLowerCase().replace(":", ".");

			if (typeof self.meta[name] == "string") self.meta[name] = [self.meta[name]]; // convert to an array if there's already one item

			var content = self.jQuery.trim(node.attr("content"));

			if (typeof self.meta[name] == "object") self.meta[name].push(content); // add to an array
			else self.meta[name] = content;
		});
	};


	// extract the content from a named "meta" element(s), and add the results to the data array
	this.getMeta = function(prefix, fields, data){
		if (typeof data != "object") data = {};
		if (typeof self.meta == "undefined") self.prepareMeta();

		self.jQuery.each(fields, function(metaName, field){
			if (prefix) metaName = prefix + metaName;
			if (typeof self.meta[metaName] == "undefined") return true; // continue
			data[field] = self.meta[metaName];
		});
		return data;
	};
}

return new Overlay;
})();

arthack.init();
