## How to run
1. To install all the dependancies, you need to run the following command in the terminal  
    ```shell
    npm install
    ```
2. install [RabbitMQ](https://www.rabbitmq.com/download.html)
3. Sign up hr user for this worker to make requests with.
4. Make a new file called `.env` and copy the contents of `.env.example` file in it, and change the config variables.
   1. Master url is the url of the backend to connect to, and send requests to.
   2. Email and password are the hr user email and password created at step 2
   3. Token expiry is how long the login token is valid before it's expired
   4. To create a RabbitMQ user and give it permissions to read and write to public IP, refer to this [link](https://www.rabbitmq.com/access-control.html) 
5. To run the server, run  
    ```shell
    node app.js
    ```  
    or
    ```
    nodemon app
    ```
