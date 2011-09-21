function App($){
	var self = this;
	
	this.init = function(imageEl){
		self.picture = $(imageEl);
		//self.picture.bind("load", self.loadAnnotations);
		self.loadAnnotations();
	};
	
	this.loadAnnotations = function(){
		// TODO: fetch with GET, callback = self.annotationsLoaded
		var annotations = [];
		self.annotationsLoaded({ annotations: annotations })
	};
		
	this.annotationsLoaded = function(data){
		annotations = this.addDetectedFaces(data.annotations);		
		self.picture.annotateImage({ editable: true, useAjax: false, notes: annotations });		
	};
	
	this.addDetectedFaces = function(annotations){
		console.log(self.picture)
		var faces = self.picture.faceDetection();
		$.each(faces, function(i, coords){
			annotations.push({
				top: coords.positionY,
				left: coords.positionX,
				width: coords.width,
				height: coords.height,
				editable: true
			});
		});
		return annotations;
	}
}

//var app = new App(arthack.jQuery);
//arthack.jQuery(app.init);