# iHire Backend
Backend API for iHire web application

## How to run
0. Make sure you have installed [node.js](https://nodejs.org/en/download/) and [mongodb](https://docs.mongodb.com/manual/installation/)
1. To install all the dependancies, you need to run the following command in the terminal  
    ```shell
    npm install
    ```
2. Make a new file called `.env` and copy the contents of `.env.example` file in it, and change the config variables.
   1. Make sure that the port number is the same port number that the frontend connects to.
3. To run the server, run  
    ```shell
    node app.js
    ```  
    or
    ```
    nodemon app
    ```
