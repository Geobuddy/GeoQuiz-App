// Code altered from Practical 5, web and mobile GIS course by Claire Ellul, UCL (2018).

function startDataUpload() {
	// get the question title
	var question_title = document.getElementById("question_title").value;
	if(document.getElementById("question_title").value == "")
        {
            alert("Question title is missing");
            return false;}

	// get the question text
	var question_text = document.getElementById("question_text").value;
	if(document.getElementById("question_text").value == "")
        {
            alert("Question text is missing");
            return false;}

	// get the answer_1
	var answer_1 = document.getElementById("answer_1").value;
	if(document.getElementById("answer_1").value == "")
        {
            alert("Answer 1 is missing");
            return false;}

	var answer_2 = document.getElementById("answer_2").value;
	if(document.getElementById("answer_2").value == "")
        {
            alert("Answer 2 is missing");
            return false;}

	var answer_3 = document.getElementById("answer_3").value;
	if(document.getElementById("answer_3").value == "")
        {
            alert("Answer 3 is missing");
            return false;}

	var answer_4 = document.getElementById("answer_4").value;
	if(document.getElementById("answer_4").value == "")
        {
            alert("Answer 4 is missing");
            return false;}

	var correct_answer = document.getElementById("correct_answer").value;

	var postString = "question_title="+question_title +"&question_text="+question_text+"&answer_1="+answer_1+"&answer_2="+answer_2+"&answer_3="+answer_3+"&answer_4="+answer_4+"&correct_answer="+correct_answer;

	// now get the geometry values (coordinates)
	var latitude = document.getElementById("latitude").value;
	var longitude = document.getElementById("longitude").value;

	postString = postString + "&longitude=" + longitude + "&latitude=" + latitude ;

	processData(postString); //call processData to run. Always last
}

var client; // the global variable that holds the request

// create AJAX request
function processData(postString) {
client = new XMLHttpRequest();
postString = postString + "&port_id=" + httpPortNumber;
var url = 'http://developer.cege.ucl.ac.uk:'+ httpPortNumber + "/uploadQuestion";
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