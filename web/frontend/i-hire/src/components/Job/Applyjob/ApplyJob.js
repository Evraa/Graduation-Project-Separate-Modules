import { Stack, IconButton, TextField, PrimaryButton, DialogFooter,
    ContextualMenu, Dialog, DefaultButton, Label } from '@fluentui/react';
import React, {useState, useEffect} from 'react'
import { useHistory, useParams } from 'react-router-dom';
import { baseUrl } from '../../../env';
import { useDispatch, useSelector } from 'react-redux';
import { setIsLoading, resetIsLoading } from '../../../redux';
import './applyjob.css'

function ApplyJob() {

    const [reqVideo, setreqVideo] = useState(true);
    const [jobTitle, setjobTitle] = useState('');
    const [jobDescription, setjobDescription] = useState('');

    const {id} = useParams();
    const history = useHistory();
    const dispatch = useDispatch();
    const currentUser = useSelector(state => state.currentUser);
    const token = currentUser.token;


    const [viewTitleSection, setviewTitleSection] = useState(false);
    const [viewDescriptionSection, setviewDescriptionSection] = useState(false);
    const [viewCVSection, setviewCVSection] = useState(false);
    const [viewVideoSection, setviewVideoSection] = useState(false);
    const [viewQSection, setviewQSection] = useState(false);

    const [questions, setquestions] = useState([]);

    const [video, setvideo] = useState({});
    const [resume, setresume] = useState({});

    const [videoDialog, setvideoDialog] = useState(true);
    const [resumeDialog, setresumeDialog] = useState(true);

    const [errVideo, seterrVideo] = useState('');
    const [errResume, seterrResume] = useState('');

    const [videoFromPastApp, setvideoFromPastApp] = useState(false);
    const [resumeFromPastApp, setresumeFromPastApp] = useState(false);

    const dragOptions = {
        moveMenuItemText: 'Move',
        closeMenuItemText: 'Close',
        menu: ContextualMenu,
        keepInBounds: true,
      };


    const questionElement =  questions.map ( (question, index) =>
        <div  className='apply_job_questions' key={question.ID} >
            <TextField 
                label={question.body}
                type="text" 
                key={question.ID}
                required={questions[index].required}
                value={questions[index].answer}
                onChange={(e) => setquestions(
                        prevState => {
                            prevState[index].answer = e.target.value;
                            return [...prevState];
                        }
                    )
                }
            />
            <div style = {{textAlign:'start', color:'red', fontSize: '14px'}}>{question.error}</div>
        </div>
    )


    const ChevronDown = { iconName: 'ChevronDown' };
    const ChevronUp = { iconName: 'ChevronUp' };
    const TaskSolid = { iconName: 'TaskSolid' };

    const Apply = async () => {
        const data = questions.map( question => {
            return { questionID: question.ID, answer: question.answer }
        })
        const body = {answers: data};
        if(reqVideo && !video.name){
            seterrVideo("introductory video is required *");
            return;
        }
        else seterrVideo('');

        if(!resume.name){
            seterrResume("resume is required *");
            return;
        }
        else seterrResume('');
        try {
            const res = await fetch(baseUrl+'/application/' + id, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer ' + token
                },
                body: JSON.stringify(body)
            });
            const data = await res.json();
            const qs = questions;
            const errors = data.errors;
            if(!res.ok){
                console.log(errors);
                for(let i=0; i < errors.length; i += 1){
                    for(let j = 0; j < qs.length; j += 1){
                        if(errors[i].questionID === qs[j].ID){
                            qs[j].error = errors[i].msg;
                        }
                    }
                }
                setquestions(qs);
                console.log(qs);
                return;
            }
            for(let j = 0; j < qs.length; j += 1) qs[j].error = '';
            setquestions(qs);
            if(!resumeFromPastApp){
                const formData = new FormData();
                formData.append('resume', resume);
                const res2 = await fetch(baseUrl+'/application/' + id + '/resume', {
                    method: 'POST',
                    headers: {
                        'Authorization': 'Bearer ' + token
                    },
                    body: formData
                });
                const data2 = await res2.json();
                console.log(data2);
                if(!res2.ok){
                    seterrResume(data2.errors[0].msg);
                    return;
                }
            }
            seterrResume('');
            if(!videoFromPastApp){
                const formData1 = new FormData();
                formData1.append('video', video);
                const res3 = await fetch(baseUrl+'/application/' + id + '/video', {
                    method: 'POST',
                    headers: {
                        'Authorization': 'Bearer ' + token
                    },
                    body: formData1
                });
                const data3 = await res3.json();
                console.log(data3);
                if(!res3.ok){
                    seterrVideo(data3.errors[0].msg);
                    return;
                }
            }
            history.push('/')
        } 
        catch (error) {
            console.log(error);
        }
    }



    useEffect(() => {
        let q = [];
        const fetchJob = async ()=>{
            console.log(id);
            try {
                const res = await fetch(baseUrl + "/job/"+id, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json'
                    }
                });
                if(!res.ok){
                    throw new Error('Can not fetch job');
                }
                const currentJob = await res.json();
                console.log(currentJob);
                setjobTitle(currentJob.title);
                setjobDescription(currentJob.description);
                setreqVideo(currentJob.videoRequired);
                const qs = currentJob.questions;
                q = qs.map(val => {
                    return {...val, 'answer': '', 'error': '', 'ID':val._id, '_id': val.ID}
                });
                setquestions(q);
            } catch (error) {
                console.log(error);
            }
        }

        const fetchApp = async ()=>{
            try {
                const res = await fetch(baseUrl + "/job/"+id+'/application', {
                    method: 'GET',
                    headers: {
                        'Authorization': 'Bearer ' + token
                    }
                });
                if(!res.ok){
                    throw new Error('Can not fetch previous application answers');
                }
                const app = await res.json();
                console.log(app);
                let ans = app;
                if(app.applied){
                    setvideo(app.application.video);
                    setresume(app.application.resume);
                    setvideoFromPastApp(true);
                    setresumeFromPastApp(true);
                    ans = app.application.answers;
                }
                else ans = app.answers;
                const qs = q;
                for(let i=0; app.applied && i < ans.length; i += 1){
                    for(let j = 0; j < qs.length; j += 1){
                        if(ans[i].questionID === qs[j].ID){
                            qs[j].answer = ans[i].answer;
                        }
                    }
                }
                for(let j = 0; !app.applied && j < qs.length; j += 1){
                    if(qs[j]._id in ans)
                        qs[j].answer = ans[qs[j]._id];
                }
                setquestions(qs);
            } catch (error) {
                console.log(error);
            }
        }
        const getData = async () => {
            dispatch(setIsLoading());
            await fetchJob();
            fetchApp();
            dispatch(resetIsLoading());
        }
        getData();

    }, [id, dispatch, token])


    return (
        <div>
            <Stack vertical className='apply_job_main'>
                <div style={{fontSize:'50px', alignSelf: 'start', paddingBottom: '30px', fontWeight: 'bold', color: 'blue'}}>
                    Apply on Job
                </div>



                <div style={{width:'100%'}} >
                    <div className='apply_job_title' onClick={()=>setviewTitleSection(previousState => !previousState)}>
                        <Stack horizontal className='apply_job_section' horizontalAlign='space-between'>
                            <div>
                                Job Title
                            </div>
                            <IconButton iconProps={viewTitleSection? ChevronUp: ChevronDown} 
                            title="Chevron" ariaLabel="Chevron" disabled={false}
                            />
                        </Stack>
                    </div>
                    {
                        viewTitleSection &&
                        <Label
                            className='add_job_title_section_content'
                            styles={{root:{textAlign:'start'}}}
                        >{jobTitle}</Label>
                    }
                </div>



                <div style={{width:'100%'}} >
                    <div className='apply_job_title' onClick={()=>setviewDescriptionSection(previousState => !previousState)}>
                        <Stack horizontal className='apply_job_section' horizontalAlign='space-between'>
                            <div>
                                Job Description
                            </div>
                            <IconButton iconProps={viewDescriptionSection? ChevronUp: ChevronDown} 
                            title="Chevron" ariaLabel="Chevron" disabled={false}
                            />
                        </Stack>
                    </div>
                    {
                        viewDescriptionSection &&
                        <Label 
                            className='add_job_title_section_content'
                            styles={{root:{textAlign:'start'}}}
                        >{jobDescription}</Label>
                    }
                </div>

                {
                    reqVideo &&
                <div style={{width:'100%'}} >
                    <div className='apply_job_title' onClick={()=>setviewVideoSection(previousState => !previousState)}>
                        <Stack horizontal className='apply_job_section' horizontalAlign='space-between'>
                            <div>
                                Upload Introductory Video
                            </div>
                            <IconButton iconProps={viewVideoSection? ChevronUp: ChevronDown} 
                            title="Chevron" ariaLabel="Chevron" disabled={false}
                            />
                        </Stack>
                    </div>
                    {
                        viewVideoSection &&
                        <div style = {{paddingBottom: '30px'}}>
                            <Stack horizontal className='apply_job_section_content' horizontalAlign='space-between'>
                                <div style={{alignSelf:'start'}}>
                                    Please Upload an introductory video to yourself
                                </div>

                                <Stack horizontal>
                                    <div style={{padding: '5px'}}>
                                        {video.name}
                                    </div>

                                    <DefaultButton 
                                        text='Upload'
                                        iconProps={{iconName: 'Up'}} 
                                        onClick={() => setvideoDialog(false)}
                                        styles={{
                                            root:{alignSelf:'end', borderColor: 'blue'}, 
                                            label:{color:'blue', fontWeight:'bold'}
                                        }}
                                    />  
                                </Stack>
                                 
                                
                            </Stack>
                            <div style={{color: 'red', textAlign:'start '}} >{errVideo}</div>
                        </div>
                    }
                </div>
                }


                <div style={{width:'100%'}} >
                    <div className='apply_job_title' onClick={()=>setviewCVSection(previousState => !previousState)}>
                        <Stack horizontal className='apply_job_section' horizontalAlign='space-between'>
                            <div>
                                Upload CV
                            </div>
                            <IconButton iconProps={viewCVSection? ChevronUp: ChevronDown} 
                            title="Chevron" ariaLabel="Chevron" disabled={false}
                            />
                        </Stack>
                    </div>
                    {
                        viewCVSection &&
                        <div style = {{paddingBottom: '30px'}}>
                            <Stack horizontal className='apply_job_section_content' horizontalAlign='space-between'>
                                <div style={{alignSelf:'start'}}>
                                    Please Upload your CV
                                </div>

                                <Stack horizontal>
                                    <div style={{padding: '5px'}}>
                                        {resume.name}
                                    </div>

                                    <DefaultButton 
                                        text='Upload'
                                        iconProps={{iconName: 'Up'}} 
                                        onClick={() => setresumeDialog(false)}
                                        styles={{
                                            root:{alignSelf:'end', borderColor: 'blue'}, 
                                            label:{color:'blue', fontWeight:'bold'}
                                        }}
                                    />  
                                </Stack>
                                
                            </Stack>
                            <div style={{color: 'red', textAlign:'start '}} >{errResume}</div>
                        </div>
                    }
                </div>


                <div style={{width:'100%'}} >
                    <div className='apply_job_title' onClick={()=>setviewQSection(previousState => !previousState)}>
                        <Stack horizontal className='apply_job_section' horizontalAlign='space-between'>
                            <div>
                                Behavioural Analysis
                            </div>
                            <IconButton iconProps={viewQSection? ChevronUp: ChevronDown} 
                            title="Chevron" ariaLabel="Chevron" disabled={false}
                            />
                        </Stack>
                    </div>
                    {
                        viewQSection &&
                        <div style = {{paddingBottom: '30px'}}>
                            <Stack vertical tokens={{childrenGap: '20px'}} className='apply_job_section_content'>
                                {questionElement}
                            </Stack>
                        </div>
                    }
                </div>



                <div style={{padding: '40px', paddingRight:'15%', width: '100%', textAlign: 'right'}}>
                    <DefaultButton 
                        text='Apply' 
                        iconProps={TaskSolid} 
                        styles={{root:{alignSelf:'end', borderColor: 'blue'}, label:{color:'blue', fontWeight:'bold'}}} 
                        onClick={Apply}
                    />                      
                </div>
            </Stack>


            <Dialog
                hidden={videoDialog}
                onDismiss={() => {setvideoDialog(true); setvideo({})}}
                dialogContentProps={{title: 'Choose a video' }}
                modalProps={{isBlocking: true, dragOptions: dragOptions, styles:{ main: { width: 900 } }}}
            >
                <input 
                    type="file" 
                    onChange={ e => {setvideo(e.target.files[0]); setvideoFromPastApp(false);}} 
                    className='upload_file'
                />
                <div style={{color:'blue'}}>{video.name}</div>
                <DialogFooter>
                    <PrimaryButton onClick={ () => {setvideoDialog(true); setvideo({})} } text="cancel" />
                    <PrimaryButton onClick={() => setvideoDialog(true)} text="choose" />
                </DialogFooter>
            </Dialog>


            <Dialog
                hidden={resumeDialog}
                onDismiss={() => {setresumeDialog(true); setresume({})}}
                dialogContentProps={{title: 'Choose a CV' }}
                modalProps={{isBlocking: true, dragOptions: dragOptions, styles:{ main: { width: 900 } }}}
            >
                <input 
                    type="file" 
                    onChange={ e => {setresume(e.target.files[0]); setresumeFromPastApp(false)}} 
                    className='upload_file'
                />
                <div style={{color:'blue'}}>{resume.name}</div>
                <DialogFooter>
                    <PrimaryButton onClick={ () => {setresumeDialog(true); setresume({})} } text="cancel" />
                    <PrimaryButton onClick={() => setresumeDialog(true)} text="choose" />
                </DialogFooter>
            </Dialog>
        </div>
    )
}

export default ApplyJob
