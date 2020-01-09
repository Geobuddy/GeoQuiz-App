var client;

function getFormData(){
    client = new XMLHttpRequest();
    var url =  "http://developer.cege.ucl.ac.uk:" + httpPortNumber + '/getQuizPoints/' + httpPortNumber;
    client.open("GET", url, true);
    client.onreadystatechange = processFormData;
    try{
        client.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
    }
    catch (e){
    }
    client.send();
}

function processFormData(){
    //Waiting response from server
    if(client.readyState<4){
        console.log('waiting for form data')
    }
    else if (client.readyState === 4){
        if (client.status > 199 && client.status < 300){
            console.log('form data sent.')
            var FormData = client.responseText;
            loadFormData(FormData);
        }
    }
}


var xhrFormData;

function formDataResponse(){
    if (xhrFormData.readyState == 4) {
// once the data is ready, process the data
        var formData = xhrFormData.responseText;
        loadFormData(formData);
    }
        }


// we can also use this to determine distance for the proximity alert
var formLayer;

function loadFormData(formData) {
// convert the text received from the server to JSON
    var formJSON = JSON.parse(formData);
// load the geoJSON layer
    formLayer = L.geoJson(formJSON,
        {       

// use point to layer to create the points
            pointToLayer: function (feature, latlng)
            {
            // in this case, we build an HTML DIV string
            // using the values in the data
            var htmlString = "<DIV id='popup'"+ feature.properties.id + "><h2>" +
            feature.properties.question_title + "</h2><br>";
            htmlString = htmlString + "<h3>"+feature.properties.question_text +
            "</h3><br>";
            htmlString = htmlString + "<input type='radio' name='answer' id ='"+feature.properties.id+"_1'/>"+feature.properties.answer_1+"<br>";
            htmlString = htmlString + "<input type='radio' name='answer' id ='"+feature.properties.id+"_2'/>"+feature.properties.answer_2+"<br>";
            htmlString = htmlString + "<input type='radio' name='answer' id ='"+feature.properties.id+"_3'/>"+feature.properties.answer_3+"<br>";
            htmlString = htmlString + "<input type='radio' name='answer' id ='"+feature.properties.id+"_4'/>"+feature.properties.answer_4+"<br>";
            htmlString = htmlString + "<button onclick='checkAnswer(" + feature.properties.id + ");return false;'>Submit Answer</button>";
            // now include a hidden element with the answer
            // in this case the answer is alwasy the first choice
            // for the assignment this will of course vary - you can use feature.properties.correct_answer
            htmlString = htmlString + "<div id=answer" + feature.properties.correct_answer + " hidden>1</div>";
            htmlString = htmlString + "</div>";
            return L.marker(latlng).bindPopup(htmlString);
            },
        }).addTo(mymap);
    mymap.fitBounds(formLayer.getBounds());
}


// // method to process the button click in this pop-up
// function checkAnswer(questionID) {
//     // get the answer from the hidden div
//     // NB - do this BEFORE you close the pop-up as when you close the pop-up the DIV is destroyed
//     var answer = document.getElementById("answer"+questionID).innerHTML;
//     // now check the question radio buttons
//     var correctAnswer = false;
//     var answerSelected = 0;
//     for (var i=1; i < 5; i++) {
//         if (document.getElementById(questionID+"_"+i).checked){
//             answerSelected = i;
//         }
//         if ((document.getElementById(questionID+"_"+i).checked) && (i ==
//         answer)) {
//             8 of 9
//             alert ("Well done");
//             correctAnswer = true;
//         }
//     }
//         if (correctAnswer === false) {
//         // they didn't get it right
//             alert("Better luck next time");
//         }
//         // now close the popup
//         mymap.closePopup();
//     // the code to upload the answer to the server would go here
//     // call an AJAX routine using the data
//     // the answerSelected variable holds the number of the answer
//     //that the user picked
// }


// function closestFormPoint() {
//     // take the leaflet formdata layer
//     // go through each point one by one
//     // and measure the distance to Warren Street
//     // for the closest point show the pop up of that point
//     var minDistance = 100000000000;
//     var closestFormPoint = 0;
//     // in your assignment replace this with the user's location
//     var userlat = 51.524048;
//     var userlng = -0.139924;
//     formLayer.eachLayer(function(layer) {
//         var distance = calculateDistance(userlat, userlng,layer.getLatLng().lat, layer.getLatLng().lng, 'K');
//         if (distance < minDistance){
//             minDistance = distance;
//             closestFormPoint = layer.feature.properties.id;
//         }
//     });
//     // for this to be a proximity alert, the minDistance must be
//     // closer than a given distance - you can check that here
//     // using an if statement
//     // show the popup for the closest point
//     formLayer.eachLayer(function(layer) {
//         if (layer.feature.properties.id == closestFormPoint){
//             layer.openPopup();
//         }
//     });
//     }
