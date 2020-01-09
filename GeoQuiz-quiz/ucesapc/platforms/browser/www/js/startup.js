function startup(){
	document.addEventListener('DOMContentLoaded',function(){
		getPort();
		trackAndCircle ();
	},false);
}

function trackAndCircle(){
	trackLocation();
}