function App($){
	var self = this;
	
	this.annotationServer = "http://kasabi-art-hack.heroku.com/annotations";
	
	this.init = function(imageEl){
		$.ajaxSetup({ cache: false });
		self.picture = $(imageEl);
		//self.picture.bind("load", self.loadAnnotations);
		self.loadAnnotations();
	};
		
	this.loadAnnotations = function(){
		var faces = self.picture.faceDetection(); // have to do this before the image gets hidden
		
		self.picture.annotateImage({ 
			editable: true, 
			useAjax: true,
			getUrl: self.annotationServer + "?image=" + self.picture.get(0).src,
			saveUrl: self.annotationServer,
			deleteUrl: self.annotationServer + "?image=" + self.picture.get(0).src,
			ready: function(){
				if (!self.picture.notes.length){
					$.each(faces, self.addAnnotation);
				}
			}
		});
	};
	
	this.addAnnotation = function(i, note){
		var note = new $.fn.annotateView(self.picture, {
			top: note.positionY,
			left: note.positionX,
			width: note.width,
			height: note.height,
			text: "",
			editable: true
		});
        self.picture.notes.push(note);
	};
}