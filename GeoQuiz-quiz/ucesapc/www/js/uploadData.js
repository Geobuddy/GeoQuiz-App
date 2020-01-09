// Code altered from Practical 5, web and mobile GIS course by Claire Ellul, UCL (2018).
// Function to upload answers
var postString;

function startAnswerupload(question_id,correct_answer,answer_select) {
	// get the question title


postString = "question_id="+question_id +"&correct_answer="+correct_answer +"&answer_selected="+answer_select;

	processData(postString); //call processData to run. Always last
}


var client; // the global variable that holds the request

// create AJAX request
function processData(postString) {
client = new XMLHttpRequest();
postString = postString + "&port_id=" + httpPortNumber;
var url = 'http://developer.cege.ucl.ac.uk:'+ httpPortNumber + "/uploadAnswer";
client.open('POST',url,true);
client.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
client.onreadystatechange = dataUploaded;
client.send(postString);
}

// create the code to wait for the response from the data server, and process the response once it is received
function dataUploaded() {
// this function listens out for the server to say that the data is ready - i.e. has state 4
if (client.readyState == 4) {
// change the DIV to show the response
document.getElementById("dataUploadResult").innerHTML = client.responseText;
}
}