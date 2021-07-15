## How to run
1. To install all the dependancies, you need to run the following command in the terminal  
    ```shell
    npm install
    ```
2. install [RabbitMQ](https://www.rabbitmq.com/download.html)
3. Sign up hr user for this worker to make requests with.
4. Make a new file called `.env` and copy the contents of `.env.example` file in it, and change the config variables.
5. To run the server, run  
    ```shell
    node app.js
    ```  
    or
    ```
    nodemon app
    ```
