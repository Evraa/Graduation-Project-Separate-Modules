const amqp = require('amqplib');
const util = require('util');
const exec = util.promisify(require('child_process').exec);
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
var connection;

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
        }, TOKEN_EXPIRY - 1000);

        console.log("Worker logged in successfully");
        
        connection = await amqp.connect(process.env.RABBITMQ_URL);
            
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
                        console.log(`Error in processing video: ${obj.url}`);
                        exit(-1);
                    }
                }).catch(err => {throw new Error(err);});
            } else if (obj.type == 'resumes') {
                process_resumes(obj.jobID, obj.jobDescription, token).then(() => {
                    console.log(`Finsihd processing resumes for job: ${obj.jobID}`);
                    channel.ack(msg);
                }).catch(err => {
                    console.log(`Error in processing resumes for job: ${obj.jobID}`);
                    exit(-1);
                });
            } else if (obj.type == 'answers') {
                process_answers(obj.applicationID, token).then(() => {
                    console.log(`Finsihd processing personality for application: ${obj.applicationID}`);
                    channel.ack(msg);
                }).catch(err => {
                    console.log(`Error in processing personality for application: ${obj.applicationID}`);
                    exit(-1);
                });
            } else {
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
    const CODE_PATH = "models/video/emotion_detection_production.py";
    const MODEL_PATH = "models/video/model/emotion_detect_model_120.hd5";
    const HAAR_PATH = "models/video/model/haarcascade_frontalface_default.xml";
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
        const {stdout, stderr} = await exec(`python ${CODE_PATH} -p=${url} -m=${MODEL_PATH} -ha=${HAAR_PATH}`, );
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
        throw new Error("Error in processing video");
    }
    return false;
};

const process_resumes = async (jobID, jobDescription, token) => {
    const RESUME_FOLDER = `uploads/resumes/${jobID}/cv`;
    const JOB_FILE_NAME = `uploads/resumes/${jobID}/description.txt`;
    const OUT_FILE_NAME = `output/${jobID}.json`;
    const MODEL_FILE_NAME = 'models/resume_ranker_model/model/word2vec_vs_300_ep_150_sg_alpha_0.001.wordvectors';
    const CODE_FILE_NAME = 'models/resume_ranker_model/resume_ranker_production.py';

    try {
        fs.mkdirSync(RESUME_FOLDER, {recursive:true});
        fs.mkdirSync('output', {recursive: true});
        const res = await fetch(`${MASTER_URL}/api/job/${jobID}/resumes`, {
            headers: {
                "Authorization": "Bearer " + token
            }
        });
        if (res.ok) {
            const resumes = await res.json();
            for (const obj of resumes) {
                const [name, ext] = path.basename(obj.resume.url).split('.');
                const fileName = path.join(RESUME_FOLDER, obj.applicantID) + '.' + ext;
                if (!fs.existsSync(fileName)) {
                    const resumeRes = await fetch(`${MASTER_URL}/${obj.resume.url}`, {
                        headers: {
                            "Authorization": "Bearer " + token
                        }
                    });
                    if (resumeRes.ok) {
                        fs.writeFileSync(fileName, Buffer.from(await(await resumeRes.blob()).arrayBuffer()));
                    } else {
                        console.log(await resumeRes.json());
                        throw new Error(`Couldn't fetch resume: ${obj.resume.url}`);
                    }
                }
            }
        } else {
            console.log(await res.json());
            throw new Error(`Couldn't fetch job resumes for job ID:${jobID}`);
        }
        
        fs.writeFileSync(JOB_FILE_NAME, jobDescription);
        const {stdout, stderr} = await exec(`python ${CODE_FILE_NAME} -p=${RESUME_FOLDER} -jd=${JOB_FILE_NAME} -rp=${OUT_FILE_NAME} -m=${MODEL_FILE_NAME}`);
        const results = JSON.parse(fs.readFileSync(OUT_FILE_NAME));
        if (!results.success) {
            console.log(results.error);
            throw new Error("Error in running python code on resumes");
        }

        const storeRes = await fetch(`${MASTER_URL}/api/job/${jobID}/rankedApplicants`, {
            method: "POST",
            headers: {
                'Authorization': 'Bearer ' + token,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                rankedApplicants: results.results
            })
        });
        if (!storeRes.ok) {
            console.log(await storeRes.json());
            throw new Error("Couldn't store rankedApplicants");
        }

    } catch (error) {
        console.log(error);
        throw new Error("Error in process_resumes");
    }
};

const process_answers = async (applicationID, token) => {
    const TEXT_FOLDER = 'uploads/text';
    const OUT_FOLDER = `output/text`;
    const CODE_PATH = " models/Personality/Personality_detection_production.py";
    const INPUT_PATH = `${TEXT_FOLDER}/${applicationID}.txt`;
    const MODEL_PATH = "models/Personality/bert_base_model.h5";
    const OUTPUT_PATH = `${OUT_FOLDER}/${applicationID}.json`;

    try {
        fs.mkdirSync(TEXT_FOLDER, {recursive: true});
        fs.mkdirSync(OUT_FOLDER, {recursive: true});
        
        // request the application answers
        const res = await fetch(`${MASTER_URL}/api/application/${applicationID}/answers`, {
            headers: {
                'Authorization': 'Bearer ' + token,
            }
        });

        if (res.ok) {
            fs.writeFileSync(INPUT_PATH, Buffer.from((await res.json()).text));

        } else {
            const err = await res.json();
            console.error(err);
            throw new Error(`Couldn't fetch answers for application: ${applicationID}`);
        }

        const {stdout, stderr} = await exec(`python ${CODE_PATH} -p=${INPUT_PATH} -m=${MODEL_PATH} -rp=${OUTPUT_PATH}`);
        
        const data =  JSON.parse(fs.readFileSync(OUTPUT_PATH));
        if (!data.success) {
            throw new Error(data.error);
        }
        const storeRes = await fetch(`${MASTER_URL}/api/application/${applicationID}/storeAnalyzedPersonality`, {
            method: "POST",
            headers: {
                'Authorization': 'Bearer ' + token,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                results: data.results
            })
        });
        if (!storeRes.ok) {
            console.log(await storeRes.json());
            throw new Error("Could't store the analyzed personality");
        }
    } catch (err) {
        console.error(err);
        throw new Error(err);
    }
    return false;
};

main();