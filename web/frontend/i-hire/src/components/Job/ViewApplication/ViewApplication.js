import React, {useEffect, useState, useCallback} from 'react';
import {baseUrl, downloadUrl} from '../../../env';
import { useSelector } from 'react-redux';
import { Stack, TextField, Dialog,
    PrimaryButton, DialogFooter, Link } from '@fluentui/react';
import './viewApplication.css'

function ViewApplication(props) {

    const { appID, hideDialog, sethideDialog } = props;
    const currentUser = useSelector(state => state.currentUser);
    const token = currentUser.token;

    const titleStyle = {
        fontSize: '40px', fontWeight: 'bold', color: 'red',
        textAlign:'center'
    };
    const itemStyle = {fontSize: '25px'};
    const itemContentStyle = {fontSize: '18px', paddingTop: '4px'};
    
    
    const [Application, setApplication] = useState({});
    const [Job, setJob] = useState({});



    const questionsElement = useCallback(
        () => {
            if(!Application.answers || !Job.questions) return null;
            const findQuestion = (qID) => {
                const qs = Job.questions;
                for(var i = 0; i < qs.length; i += 1){
                    if(qID === qs[i]._id)
                        return qs[i].body;
                }
                return '';
            }
            console.log(Application.answers);
            return Application.answers.map(q => 
                <TextField
                    key={q.questionID}
                    label={findQuestion(q.questionID)}
                    readOnly
                    defaultValue={q.answer}
                />
            )
        },
        [Application.answers, Job.questions],
    )
    

    useEffect(() => {
        const fetchApp = async () => {
            try{
                const res = await fetch(baseUrl+'/application/' + appID, {
                    method: 'GET',
                    headers: {
                        'Authorization': 'Bearer ' + token
                    },
                });
                if(!res.ok){
                    throw new Error('Error in fetching application [ViewApplication]');
                }
                const data = await res.json();
                setApplication({...data});
            }
            catch (err){
                console.log(err);
            }
        }


        const fetchJob = async () => {
            try{
                const res = await fetch(baseUrl+'/job/' + Application.jobID, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                });
                if(!res.ok){
                    throw new Error('Error in fetching Job [ViewApplication]');
                }
                const data = await res.json();
                setJob({...data});
            }
            catch (err){
                console.log(err);
            }
        }


        const getData = async () => {
            await fetchApp();
            await fetchJob();
        }

        getData();
        return () => {
            
        }
    }, [Application.jobID, appID, token])

    const getLink = async (url, name) => {
        const res = await fetch(url, {
            headers: {
                "Authorization": "Bearer " + token
            }
        });
        const bl = await res.blob();
        console.log(url, name);
        const ret = URL.createObjectURL(bl);
        var a = document.createElement('a');
        a.href = ret;
        a.download = name;
        document.body.appendChild(a);
        a.click();    
        a.remove();
    }

    return (
        <Dialog
            hidden={hideDialog}
            onDismiss={() => sethideDialog(true)}
            dialogContentProps={{title: 'View Application' }}
            modalProps={{isBlocking: true, styles:{ main: { width: 900 } }}}
            containerClassName={ 'ms-Dialog-main dialogStyle'}
        >
            <Stack vertical tokens={{childrenGap: 50}} >
                <div style={titleStyle}>{Job.title}</div>
                <Stack horizontal horizontalAlign='space-between'>
                    <div style={itemStyle}> jobDescription </div>
                    <div style={itemContentStyle} > {Job.description} </div>
                </Stack>
                {
                    Application.video &&
                    <Stack horizontal horizontalAlign='space-between'>
                        <div style={itemStyle}> Introductory Video </div>
                        <Link 
                            onClick={async () => getLink(downloadUrl+Application.video.url, Application.video.name)} 
                            style={itemContentStyle}
                        > 
                             {Application.video.name} 
                        </Link>
                    </Stack>
                }
                {
                    Application.resume &&
                    <Stack horizontal horizontalAlign='space-between'>
                        <div style={itemStyle}> Resume </div>
                        <Link 
                            onClick={async () => {
                                getLink(downloadUrl+Application.resume.url, Application.resume.name);
                                console.log('clicked');
                            }}
                            style={itemContentStyle}
                        > 
                            {Application.resume.name} 
                        </Link>
                    </Stack>
                }
                <div style={{textAlign:'start', width: '90%'}}>
                    <Stack vertical tokens={{childrenGap: 30}}>
                        <div style={itemStyle}>Behavioural Analysis</div>
                        {questionsElement()}
                    </Stack>
                </div>
                <DialogFooter>
                    <PrimaryButton onClick={() => sethideDialog(true)} text="ok" />
                </DialogFooter>
            </Stack>

        </Dialog>
    )
}

export default ViewApplication
