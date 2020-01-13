# Quiz
Technical Guide 
================

1.Quiz app
==========

The Quiz app is a location-based app that runs on Android phones using
PhoneGap and Material design. When the app is launched it loads a series
of quiz questions and receives the user's location. Once a quiz point is
within the user's radio, a pop-up in the point opens prompting the user
to answer the question. The questions within the app relate to a wide
variety of historical and landmark topics.

System requirements
-------------------

The Quiz app supports Android model above 2.3.3 Gingerbread (API Level
10). The app was executed on the Cordova PhoneGap.

### How to deploy the code?

To deploy this code, first download and SSH file transfer software such
as BitVise (1) for Windows or Cyberduck (2) for Mac. Set up the
SSH to connect to the Ubuntu Server by inserting a port number and host.
For the authentication provide a username and password (**Figure 1**).
Once the SSH software is connected to SFTP client, navigate to the local
server using the following command *cd /home/username*(3)$*/code.*
Use the Linux (ubuntu) terminal from the SSH software to clone the
github repositories (ucesapc-quiz(4) and ucesapc-serve(5)) to
the local server using the command line (*git clone HTTPS URL*(6)).
Start the server from the cloned ucesapc-server repository by navigating
to *cd /home/username*(3)*/code/ucesapc-server.* Run the following
command *node httpServer.js* to debug the server then *pm2 start
httpServer.js* and *pm2 start httpsServer.js* to start the server. In
order to deploy the quiz app on an Android device, navigate to the
ucesapc-quiz folder cloned in the local server using the following
command line (*cd /home/username*(3)*/code/ucesapc-quiz/ucesapc/*).
Using the Linux (Ubuntu) terminal from the SSH software run the code
"*phonegap serve"* in the command line. From the smartphone device,
launch the PhoneGap app and type the server address in the empty field
and connect.

![](/media/image3.png)

**Figure 1:** Show a BitVise interface, to access the server and virtual
machine. (Taken from: Ellul, 2019.)

### How to test the code?

Testing the code can be done by downloading the PhoneGap by logging in
the server (**Figure 2).** For a perfect functioning app the outcome
once the question is answered should display, a red marker for the wrong
answers, a green marker for the correct answers and a pink marker for a
yet to be answered question (**Figure 2**). Note, tests can only be
carried out with the server (e.g. httpServe.js) running.

![](./media/image2.png)![](./media/image5.png)![](./media/image1.png)![](./media/image6.png)

**Figure 2:** Shows the process of initiating the Quip App on PhoneGap
(left) to the testing of the app (right).

| Files                      | Function                                                                                                                         |
|----------------------------|----------------------------------------------------------------------------------------------------------------------------------|
| Index.html                 | Contains the code for the web client side (e.g. material design and leaflet functions). The main function is to display the app. |
| Instructions.html          | Contains user guide instruction to inform and guide new users.                                                                   |
| leaflet.awesome-markers.js | Provides styling for the leaflet features such as markers.                                                                       |
| leaflet.js                 | Provides mp tile to the application (e.g. mapbox and open street map)                                                            |
| leafletFunctions.js        | Makes all the the request to the database (e.g. get the form data )                                                              |
| startup.js                 | Responsible for initiating any desired function when the app is launched (e.g. load the quiz points and tracks user position)    |
| uploadData.js              | Responsible for uploading the quiz answers,to the database                                                                       |
| userTracking.js            | Provides users current position and all location-based function.                                                                 |
| utilities.js               | Processes port number from the port.xml file and lots form data (i.e. quiz points)                                               |

**Table 1:** Illustrates all HTML and javascript files deployed in the Quiz App.
