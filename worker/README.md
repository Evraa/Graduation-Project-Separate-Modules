## How to run
1. To install all the dependancies, you need to run the following command in the terminal  
    ```shell
    npm install
    ```
2. install [RabbitMQ](https://www.rabbitmq.com/download.html)
3. Sign up HR user for this worker to make requests with.
4. Make a new file called `.env` and copy the contents of `.env.example` file in it, and change the config variables.
   1. Master url is the url of the backend to connect to, and send requests to.
   2. Email and password are the HR user email and password created at step 2
   3. Token expiry is how long the login token is valid before it's expired
   4. To create a RabbitMQ user and give it permissions to read and write to public IP, refer to this [link](https://www.rabbitmq.com/access-control.html)  
   The following commands will create a user with username: "test" and password "test" and grant him all the permissions to read and write in '/' vhost
   ```shell
   sudo rabbitmqctl add_user 'test' 'test'
   sudo rabbitmqctl set_permissions -p "/" "test" ".*" ".*" ".*"
   sudo rabbitmqctl set_user_tags test administrator
   ```
5. install the dependancies 
   ```shell
   pip install -r requirements.txt
   ```
6. download the models
   1. download https://drive.google.com/file/d/17wUY5YfVgj4d7I0-0qt35r0c3p56r7e0/view?usp=sharing into worker/models/Personality/bert_base_model.h5
   2. download https://drive.google.com/file/d/1Di9i6PhMttnTigZbTyY-IAlxURNcEb0K/view?usp=sharing and extract it into worker/models/resume_ranker_model/model
7. The server should have been running, then run the worker (because the worker needs to login to the server on booting)
    ```shell
    node index.js
    ```  