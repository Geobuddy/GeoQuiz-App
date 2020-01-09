// Code altered from Practical 5, web and mobile GIS course by Claire Ellul, UCL (2018).

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
// Code to process the data
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


var xhrFormData; // Global varial for form request

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
            var htmlString = "<DIV id='popup'"+ feature.properties.id + "</h4><br>";
            htmlString = htmlString + "<h4>"+feature.properties.question_text +
            "</h4><br>";
            htmlString = htmlString + "</div>";
            return L.marker(latlng, {icon:testMarkerPink}).bindPopup(htmlString);
            },
        }).addTo(mymap);
    mymap.fitBounds(formLayer.getBounds());
}
// create a custom popup
var popup = L.popup();

// Function to  extract lat/lng coords
function onMapclick(e){ // Add marker to map at click location; add popup window 
    popup 
            .setLatLng(e.latlng)
            .setContent("I'm your question's coords")
            .openOn(mymap);
            document.getElementById("latitude").value = e.latlng.lat;
            document.getElementById("longitude").value = e.latlng.lng;

};

// now add the click event detector to the map - the listener setter 
mymap.on('click', onMapclick);

function getTopScores(){
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

function getUserGraph(){

document.getElementById("getUserGraph").innerHTML="";
document.getElementById("getAllUserGraph").innerHTML="";
document.getElementById("getUserGraph").innerHTML="<svg width='380' height='350'></svg> Red = correct answers; Green = questions answered (all users) ";

const svg     = d3.select("svg"),
      margin  = {top: 20, right: 20, bottom: 30, left: 50},
      width   = +svg.attr("width")  - margin.left - margin.right,
      height  = +svg.attr("height") - margin.top  - margin.bottom,
      x       = d3.scaleBand().rangeRound([0, width]).padding(0.2),
      y       = d3.scaleLinear().rangeRound([height, 0]),
      g       = svg.append("g")
                   .attr("transform", `translate(${margin.left},${margin.top})`);

d3.json("http://developer.cege.ucl.ac.uk:" + httpPortNumber + '/getParticipationRateUser/' + httpPortNumber).then(data => {
  data = data.array_to_json;
  console.log(data);
  x.domain(data.map(d => d.day));
  y.domain([0, d3.max(data, d => d.questions_answered)]);

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
      .attr("x", d => x(d.day))
      .attr("y", d => y(d.questions_answered))
      .attr("width", x.bandwidth())
      .attr("height", d => height - y(d.questions_answered));

      g.selectAll(".newbar")
    .data(data)
    .enter().append("rect")
      .attr("class", "newbar")
      .attr("x", d => x(d.day))
      .attr("y", d => y(d.questions_correct))
      .attr("width", x.bandwidth())
      .attr("height", d => height - y(d.questions_correct));
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


function getAllUserGraph(){

document.getElementById("getUserGraph").innerHTML="";
document.getElementById("getAllUserGraph").innerHTML="";
document.getElementById("getAllUserGraph").innerHTML="<svg width='380' height='350'></svg> Red = correct answers; Green = questions answered (all users) ";

const svg     = d3.select("svg"),
      margin  = {top: 20, right: 20, bottom: 30, left: 50},
      width   = +svg.attr("width")  - margin.left - margin.right,
      height  = +svg.attr("height") - margin.top  - margin.bottom,
      x       = d3.scaleBand().rangeRound([0, width]).padding(0.2),
      y       = d3.scaleLinear().rangeRound([height, 0]),
      g       = svg.append("g")
                   .attr("transform", `translate(${margin.left},${margin.top})`);

d3.json("http://developer.cege.ucl.ac.uk:" + httpPortNumber + '/getParticipationRateAll').then(data => {
  data = data.array_to_json;
  console.log(data);
  x.domain(data.map(d => d.day));
  y.domain([0, d3.max(data, d => d.questions_answered)]);

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
      .attr("x", d => x(d.day))
      .attr("y", d => y(d.questions_answered))
      .attr("width", x.bandwidth())
      .attr("height", d => height - y(d.questions_answered));

      g.selectAll(".newbar")
    .data(data)
    .enter().append("rect")
      .attr("class", "newbar")
      .attr("x", d => x(d.day))
      .attr("y", d => y(d.questions_correct))
      .attr("width", x.bandwidth())
      .attr("height", d => height - y(d.questions_correct));
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
    client = new XMLHttpRequest();
    var url =  "http://developer.cege.ucl.ac.uk:" + httpPortNumber + '/getLastPoints';
    client.open("GET", url, true);
    client.onreadystatechange = processFormData;
    try{
        client.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
    }
    catch (e){
    }
    client.send();
}
// Code to process the data
function processFormData(){
    //Waiting response from server
    if(client.readyState<4){
        console.log('waiting for form data')
    }
    else if (client.readyState === 4){
        if (client.status > 199 && client.status < 300){
            console.log('form data sent.')
            var FormAllData = client.responseText;
            loadFormData(FormAllData);
        }
    }
}


var xhrFormData; // Global varial for form request

function formDataResponse(){
    if (xhrFormData.readyState == 4) {
// once the data is ready, process the data
        var formData = xhrFormData.responseText;
        loadFormData(formData);
    }
        }


// we can also use this to determine distance for the proximity alert
var formAllLayer;

function loadFormData(formData) {
// convert the text received from the server to JSON
    var formJSON = JSON.parse(formData);
// load the geoJSON layer
    formAllLayer = L.geoJson(formJSON,
        {       

// use point to layer to create the points
            pointToLayer: function (feature, latlng)
            {
            // in this case, we build an HTML DIV string
            // using the values in the data
            var htmlString = "<DIV id='popup'"+ feature.properties.id + "</h4><br>";
            htmlString = htmlString + "<h4>"+feature.properties.question_text +
            "</h4><br>";
            htmlString = htmlString + "</div>";
            return L.marker(latlng,{icon:testMarkerPink}).bindPopup(htmlString);
            },
        }).addTo(mymap);
    mymap.fitBounds(formAllLayer.getBounds());
}

  function removeAllQuestions() {
    mymap.removeLayer( formAllLayer );
        mymap.fitBounds(formLayer.getBounds());
    }

var xhrNode; //define global variable to process AJAX request

// AJAX request function
function getHardQuestions(){
    xhrNode = new XMLHttpRequest();
    var url = "http://developer.cege.ucl.ac.uk:" + httpPortNumber + '/getHardPoints'; //get url with non-hardcoded port number
    xhrNode.open("GET", url, true); // send to server
    xhrNode.onreadystatechange = processDivChange;
    try {
        xhrNode.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
    }
    catch (e) {
        // this only works in internet explorer
    }
    xhrNode.send();
}

// AJAX response function
function processDivChange(){
    if (xhrNode.readyState < 4) //while waiting for response from server
        document.getElementById('list').innerHTML = "Loading...";

    else if (xhrNode.readyState === 4) { // 4 = response from server completely loaded
        if (xhrNode.status > 199 && xhrNode.status < 300) 
            // http status between 200 to 299 are all successful
            document.getElementById('list').innerHTML = xhrNode.responseText;
    };
}

// // Code to process the data
// function processHardQuestions(){
//     //Waiting response from server
//     if(client.readyState<4){
//         console.log('waiting for form data')
//     }
//     else if (client.readyState === 4){
//         if (client.status > 199 && client.status < 300){
//             console.log('form data sent.')
//             var QuestionData = client.responseText;
//             loadFormData(QuestionData);
//         }
//     }
// }

// function loadFormData(formData) {
// // convert the text received from the server to JSON
//     var formJSON = JSON.parse(formData);
//     var list = document.getElementById('list');
//     createList(formJSON, list)
// }