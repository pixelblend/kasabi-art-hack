function App(){
	var self = this;
	var picture, pictureNode;
	
	this.init = function(){
		$("#picture").bind("load", self.setupAnnotations);
		$("#content").delegate("click", ".face", self.annotationSelected);
	};
	
	this.setupAnnotations = function(event){
		self.pictureNode = this;
		self.picture = $(this);
		self.loadAnnotations();
	};
	
	this.loadAnnotations = function(){
		var annotations = [];
		self.annotationsLoaded({ annotations: annotations })
	};
		
	this.annotationsLoaded = function(data){
		annotations = this.addDetectedFaces(data.annotations);		
		self.picture.annotateImage({ editable: true, useAjax: false, notes: annotations });		
	};
	
	this.addDetectedFaces = function(annotations){
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
	
	this.saveAnnotations = function(){
		
	};
	
	this.annotationSelected = function(e){
		
	};
}

var app = new App;
$(app.init);