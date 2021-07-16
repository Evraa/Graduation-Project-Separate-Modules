const amqp = require('amqplib');
const { execSync } = require('child_process');
const fs  = require('fs');
const fetch = require('node-fetch');
const { exit } = require('process');
const path = require('path');

if (process.env.NODE_ENV !== 'production') {
    require('dotenv').config();
}

const MASTER_URL = process.env.MASTER_URL;
const EMAIL = process.env.EMAIL;
const PASSWORD = process.env.PASSWORD;
const VIDEO_PATH = 'uploads/videos';
const TOKEN_EXPIRY = parseInt(process.env.TOKEN_EXPIRY) || 1000*60*60*24;

fs.mkdirSync(VIDEO_PATH, {recursive: true});

const main = async () => {
    try {
        
        let token = await login();
        setInterval(async () => {
            try {
                token = await login();
            } catch (error) {
                console.error(error);
                exit(-1);
            }
        }, TOKEN_EXPIRY);

        console.log("Worker logged in successfully");
        
        const connection = await amqp.connect('amqp://localhost');
            
        const channel = await connection.createChannel();
        
        const queue = 'task_queue';

        await channel.assertQueue(queue, {
            durable: true
        });
        channel.prefetch(1);
        console.log(" [*] Waiting for messages in %s. To exit press CTRL+C", queue);
        channel.consume(queue, function(msg) {
            
            const obj = JSON.parse(msg.content);
            console.log(" [x] Received %s", obj.type);

            if (obj.type == 'video') {
                process_video(obj.url, token)
                .then(check => {
                    if (check) {
                        console.log(`Finished processing video: ${obj.url}`);
                        channel.ack(msg);
                    } else {
                        throw new Error(`Error in processing video: ${obj.url}`);
                    }
                }).catch(err => {throw new Error(err);});
            }
            else {
                console.log("Unsupported message");
                channel.ack(msg);
            }
            
        }, {
            noAck: false
        });

    } catch (err) {
        console.error(err);
        if (connection) {
            connection.close();
        }
        exit(-1);
    }
    
};

const login = async () => {
    try {
        const res = await fetch(`${MASTER_URL}/api/user/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({email: EMAIL, password: PASSWORD})
        });
        if (res.ok) {
            return (await res.json()).token;
        } else {
            throw (await res.json());
        }    
    } catch (error) {
        console.log(error);
        throw new Error("Couldn't login worker");
    }
};

const process_video = async (url, token) => {
    
    try {
        // if the video doesn't exist on this worker, request it from master
        if (!fs.existsSync(url)) {
            const res = await fetch(`${MASTER_URL}/${url}`, {
                headers: {
                    'Authorization': 'Bearer ' + token,
                }
            });
            
            if (res.ok) {
                fs.writeFileSync(url, Buffer.from(await(await res.blob()).arrayBuffer()));

            } else {
                const err = await res.json();
                console.log(err);
                return false;
            }
        }
        execSync(`python models/emotion_detection_production.py -p ${url} -m models/emotion_detect_model_90.h5`);
        const fileBaseName = path.basename(url).split('.')[0];
        const outFileName = 'output/' + fileBaseName + '.json';
        const data =  JSON.parse(fs.readFileSync(outFileName));
        if (!data.success) {
            throw new Error(data.error);
        }
        const res = await fetch(`${MASTER_URL}/api/application/storeAnalyzedVideo`, {
            method: "POST",
            headers: {
                'Authorization': 'Bearer ' + token,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                applicantID: fileBaseName.split('_')[0],
                jobID: fileBaseName.split('_')[1],
                analyzedVideo: data
            })
        });
        if (res.ok) {
            return true;
        } else {
            console.log(await res.json());
        }
    } catch (err) {
        console.error(err);
        throw new Error(err);
    }
    return false;
};

main();