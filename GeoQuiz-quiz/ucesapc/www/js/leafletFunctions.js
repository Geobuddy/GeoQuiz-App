var client;
var correct_answer;
var answerSelected;

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
            var htmlString = "<DIV id='popup'"+ feature.properties.id + "><h4>" +
            feature.properties.question_title + "</h4><br>";
            htmlString = htmlString + "<h4>"+feature.properties.question_text +
            "</h4><br>";
            htmlString = htmlString + "<input type='radio' name='answer' id ='"+feature.properties.id+"_1'/>"+feature.properties.answer_1+"<br>";
            htmlString = htmlString + "<input type='radio' name='answer' id ='"+feature.properties.id+"_2'/>"+feature.properties.answer_2+"<br>";
            htmlString = htmlString + "<input type='radio' name='answer' id ='"+feature.properties.id+"_3'/>"+feature.properties.answer_3+"<br>";
            htmlString = htmlString + "<input type='radio' name='answer' id ='"+feature.properties.id+"_4'/>"+feature.properties.answer_4+"<br>";
            htmlString = htmlString + "<button onclick='checkAnswer(" + feature.properties.id + ");return false;'>Submit Answer</button>";
            // now include a hidden element with the answer
            // in this case the answer is alwasy the first choice
            // for the assignment this will of course vary - you can use feature.properties.correct_answer
            htmlString = htmlString + "<div id=answer" + feature.properties.id + " hidden>"+feature.properties.correct_answer+"</div>";
            htmlString = htmlString + "</div>";

            // Code adapted from https://stackoverflow.com/questions/26058896/leaflet-popups-setting-an-on-close-event?fbclid=IwAR0RIGkYX8ao4CQ10Fd6Uhi4C5pEw2JBx6k7mIPiKsFfDuLZHQKrAyfocvs
            var quizMarker = L.marker(latlng, {icon:testMarkerPink}).bindPopup(htmlString);
            quizMarker.getPopup().on('remove',function(){
                
                    if (correctAnswer === false) {
                    // they didn't get it right
                        quizMarker.setIcon(testMarkerRed);
                    }
                    else{
                        quizMarker.setIcon(testMarkerGreen);
                    }

            });

            return quizMarker;

            },
        }).addTo(mymap);
    mymap.fitBounds(formLayer.getBounds());
}

function getCorrectAnswers(){
    client = new XMLHttpRequest();
    var url =  "http://developer.cege.ucl.ac.uk:" + httpPortNumber + '/getCorrectAnswer/' + httpPortNumber;
    client.open("GET", url, true);
    client.onreadystatechange = processCorrectAnswers;
    try{
        client.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
    }
    catch (e){
    }
    client.send();
}     

function processCorrectAnswers(){
    //Waiting response from server
    if(client.readyState<4){
        console.log('waiting for form data')
    }
    else if (client.readyState === 4){
        if (client.status > 199 && client.status < 300){
            console.log('form data sent.')
            var AnsData = client.responseText;
            alert("You answered " + AnsData + " question(s) correctly!");
        }
    }
}  

function getRanking(){
    client = new XMLHttpRequest();
    var url =  "http://developer.cege.ucl.ac.uk:" + httpPortNumber + '/getRanking/' + httpPortNumber;
    client.open("GET", url, true);
    client.onreadystatechange = processRanking;
    try{
        client.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
    }
    catch (e){
    }
    client.send();
}   

function processRanking(){
    //Waiting response from server
    if(client.readyState<4){
        console.log('waiting for form data')
    }
    else if (client.readyState === 4){
        if (client.status > 199 && client.status < 300){
            console.log('form data sent.')
            var AnsData = client.responseText;
            alert("You are ranked " + AnsData + " !");
        }
    }
}   

// method to process the button click in this pop-up
function checkAnswer(questionID) {
    // get the answer from the hidden div
    // NB - do this BEFORE you close the pop-up as when you close the pop-up the DIV is destroyed
    var answer = document.getElementById("answer"+questionID).innerHTML;
    // now check the question radio buttons
    correctAnswer = false;
    answerSelected = 0;
    for (var i=1; i < 5; i++) {
        if (document.getElementById(questionID+"_"+i).checked){
            answerSelected = i;
        }
        if ((document.getElementById(questionID+"_"+i).checked) && (i ==
        answer)) {
            alert ("Well done");
            correctAnswer = true;
        }
    }
        if (correctAnswer === false) {
        // they didn't get it right
            alert("Better luck next time");
        }
        // now close the popup
        mymap.closePopup();

    // the code to upload the answer to the server would go here
        startAnswerupload(questionID,answer,answerSelected);
    // call an AJAX routine using the data
    // the answerSelected variable holds the number of the answer
    //that the user picked
}

function closestFormPoint(position) {
    // take the leaflet formdata layer
    // go through each point one by one
    // and measure the distance to Warren Street
    // for the closest point show the pop up of that point
    var minDistance = 0.2;
    var closestFormPoint = 0;
    // for this example, use the latitude/longitude of warren street
    // in your assignment replace this with the user's location    var userlng = -0.139924;
    formLayer.eachLayer(function(layer) {
        var distance = calculateDistance(position.coords.latitude, position.coords.longitude,layer.getLatLng().lat, layer.getLatLng().lng, 'K');
        if (distance < minDistance){
            minDistance = distance;
            closestFormPoint = layer.feature.properties.id;
        }
    });
            // for this to be a proximity alert, the minDistance must be
            // closer than a given distance - you can check that here
            // using an if statement
            // show the popup for the closest point
    formLayer.eachLayer(function(layer) {
        if (layer.feature.properties.id == closestFormPoint){
            layer.openPopup();

            // mymap.setView([position.coords.latitude, position.coords.longitude], 13);

        }
    });
}


function getGraph(){

const svg     = d3.select("svg"),
      margin  = {top: 20, right: 20, bottom: 30, left: 50},
      width   = +svg.attr("width")  - margin.left - margin.right,
      height  = +svg.attr("height") - margin.top  - margin.bottom,
      x       = d3.scaleBand().rangeRound([0, width]).padding(0.2),
      y       = d3.scaleLinear().rangeRound([height, 0]),
      g       = svg.append("g")
                   .attr("transform", `translate(${margin.left},${margin.top})`);

d3.json("http://developer.cege.ucl.ac.uk:" + httpPortNumber + '/getTopScorers').then(data => {
  data = data.array_to_json;
  console.log(data);
  x.domain(data.map(d => d.port_id));
  y.domain([0, d3.max(data, d => d.rank)]);

  g.append("g")
      .attr("class", "axis axis-x")
      .attr("transform", `translate(0,${height})`)
      .call(d3.axisBottom(x));


  g.append("g")
      .attr("class", "axis axis-y")
      .call(d3.axisLeft(y).ticks(10).tickSize(8));

  g.selectAll(".bar")
    .data(data)
    .enter().append("rect")
      .attr("class", "bar")
      .attr("x", d => x(d.port_id))
      .attr("y", d => y(d.rank))
      .attr("width", x.bandwidth())
      .attr("height", d => height - y(d.rank));
})
.catch(err => {
  svg.append("text")         
        .attr("y", 20)
        .attr("text-anchor", "left")  
        .style("font-size", "20px") 
        .style("font-weight", "bold")  
        .text(`Couldn't open the data file: "${err}".`);
});
}



function showAllQuestions(){
    alert(mylat)
    client = new XMLHttpRequest();
    var url =  "http://developer.cege.ucl.ac.uk:" + httpPortNumber + '/getClosePoints/' + position.coords.longitude + '/'+ position.coords.latitude;
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
            var htmlString = "<DIV id='popup'"+ feature.properties.id + "><h4>" +
            feature.properties.question_title + "</h4><br>";
            htmlString = htmlString + "<h4>"+feature.properties.question_text +
            "</h4><br>";
            htmlString = htmlString + "<input type='radio' name='answer' id ='"+feature.properties.id+"_1'/>"+feature.properties.answer_1+"<br>";
            htmlString = htmlString + "<input type='radio' name='answer' id ='"+feature.properties.id+"_2'/>"+feature.properties.answer_2+"<br>";
            htmlString = htmlString + "<input type='radio' name='answer' id ='"+feature.properties.id+"_3'/>"+feature.properties.answer_3+"<br>";
            htmlString = htmlString + "<input type='radio' name='answer' id ='"+feature.properties.id+"_4'/>"+feature.properties.answer_4+"<br>";
            htmlString = htmlString + "<button onclick='checkAnswer(" + feature.properties.id + ");return false;'>Submit Answer</button>";
            // now include a hidden element with the answer
            // in this case the answer is alwasy the first choice
            // for the assignment this will of course vary - you can use feature.properties.correct_answer
            htmlString = htmlString + "<div id=answer" + feature.properties.id + " hidden>"+feature.properties.correct_answer+"</div>";
            htmlString = htmlString + "</div>";

            // Code adapted from https://stackoverflow.com/questions/26058896/leaflet-popups-setting-an-on-close-event?fbclid=IwAR0RIGkYX8ao4CQ10Fd6Uhi4C5pEw2JBx6k7mIPiKsFfDuLZHQKrAyfocvs
            var quizMarker = L.marker(latlng, {icon:testMarkerPink}).bindPopup(htmlString);
            quizMarker.getPopup().on('remove',function(){
                
                    if (correctAnswer === false) {
                    // they didn't get it right
                        quizMarker.setIcon(testMarkerRed);
                    }
                    else{
                        quizMarker.setIcon(testMarkerGreen);
                    }

            });

            return quizMarker;

            },
        }).addTo(mymap);
    mymap.fitBounds(formLayer.getBounds());
}

// Removing map layer showing the 5 questions closest to the user's current position added by any user
  function removeAllQuestions() {
    mymap.removeLayer( formAllLayer );
        mymap.fitBounds(formLayer.getBounds());
    }

function getLocation() {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(showPosition);
  } else { 
    x.innerHTML = "Geolocation is not supported by this browser.";
  }
}

var mylat;
var mylng;

function showPosition(position) {
  mylat =  position.coords.latitude;
  mylng = position.coords.longitude;
}