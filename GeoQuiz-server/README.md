# Server

System requirements
-------------------

The server supports Ubuntu 14.04/15.10, CentOS 6.x, Red Hat Enterprise
Linux (RHEL) 7.x and Debian 7.7.

### How to deploy the code?

The server is deployed using NodeJS run-time environment (**Table 3**).

### How to test the code?

To test the code the server has to run in debug mode so that any errors
can be seen in the console. This is done by first navigation to the
folder directory containing the *httpServer.js* stopping the server
typing the command line (pm2 stop *server\_number*) in the Ubuntu
terminal. Then type the following command line in the Ubuntu terminal:
*node httpServer.js.* To test the code. If no error is shown in the
console log, then the code is running perfectly, otherwise, an error
message will be displayed.

| Files          | Function                                                                                                        |
|----------------|-----------------------------------------------------------------------------------------------------------------|
| httpServer.js  | Contains SQL queries to perform operations through HTTP protocol between the client and the database side.      |
| httpsServer.js | Contains SQL queries to perform operations through the,HTTPS protocol between the client and the database side. |

**Table 3:** illustrates all javascript files deployed in the Server.
