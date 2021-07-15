const amqp = require('amqplib/callback_api');
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

fs.mkdirSync(VIDEO_PATH, {recursive: true});

const main = async () => {
    try {
        const res  = await fetch(`${MASTER_URL}/api/user/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({email: EMAIL, password: PASSWORD})
        });
        if (res.ok) {
            const data = await res.json();
            const token = data.token;
            console.log("Worker logged in successfully");
            
            amqp.connect('amqp://localhost', function(error, connection) {
                if (error) {
                    throw error;
                }
                connection.createChannel(function(error, channel) {
                    if (error) {
                        throw error;
                    }
                    var queue = 'task_queue';
            
                    channel.assertQueue(queue, {
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
                                    console.log(`Error in processing video: ${obj.url}`);
                                }
                            }).catch(err => console.log(err));
                        }
                        else {
                            console.log("Unsupported message");
                            channel.ack(msg);
                        }
                        
                    }, {
                        noAck: false
                    });
                });
            });
            
        } else {
            const data = await res.json();
            console.log("Couldn't login worker");
            console.log(data);
            exit(-1);
        }  
    } catch (err) {
        console.error(err);
        exit(-1);
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
    }
    return false;
};

main();