import { DefaultButton, Stack, IconButton, PrimaryButton } from '@fluentui/react';
import React, { useState } from 'react'
import { useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux';
import { useParams, useHistory } from 'react-router-dom'
import { baseUrl } from '../../../env'
import { setIsLoading, resetIsLoading } from '../../../redux'
import ViewApplication from '../../Job/ViewApplication/ViewApplication'


function ViewProfile() {

    const { id } = useParams();
    const history = useHistory();
    const dispatch = useDispatch();

    const [user, setuser] = useState({})
    const [Jobs, setJobs] = useState([])
    const [isLoggedIn, setisLoggedIn] = useState(false)
    const [viewJobsAppsSection, setviewJobsAppsSection] = useState(false);
    const [hideAppDailog, sethideAppDailog] = useState(true);
    const [ViewAppId, setViewAppId] = useState('');


    const currentUser = useSelector(state => state.currentUser);
    const token = currentUser.token;

    const ChevronUp = {iconName:'ChevronUp'}
    const ChevronDown = {iconName:'ChevronDown'}

    useEffect(() => {
        
        const fetchUser = async ()=> {
            const res = await fetch(baseUrl+'/user/me', {
                method: 'GET',
                headers: {
                    'Authorization': 'Bearer ' + token,
                    'Content-Type': 'application/json'
                }
            })
            const data = await res.json();
            setuser(data.user);
            setisLoggedIn(data.user._id === id);

        }

        const fetchJobs = async ()=>{
            try{
                const res = await fetch(baseUrl + "/job/", {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json'
                    }
                });
                const data = await res.json();
                setJobs(data);
            }
            catch(err){
                console.log(err);
            }
        }

        const fetchData = async () => {
            dispatch(setIsLoading());
            await fetchUser();
            fetchJobs();
            dispatch(resetIsLoading());
        }

        fetchData();
        
        return () => {
            
        }
    }, [dispatch, id, token])

    const editProfile = ()=>{
        history.push('/edit_profile/'+id);
    }

    const viewJob = (jobID) => {
        history.push('/view/' + jobID);
    }

    const editJob = (jobID) => {
        history.push('/edit/' + jobID);
    }

    const jobsSection = Jobs.map(job => 
        <Stack 
            horizontal 
            horizontalAlign='space-between' 
            style={{paddingLeft: '10px'}}
            className='apply_job_title'
            key={job._id}
        >
            <div style={{color: 'gray', fontSize: '20px'}} >
                {job.title}
            </div>
            <Stack horizontal tokens={{childrenGap:20}}>
                <PrimaryButton text='View Job' onClick={()=>viewJob(job._id)}/>
                <PrimaryButton text='Edit Job' onClick={()=>editJob(job._id)}/>
            </Stack>
        </Stack>
    );

    const viewApp = (appID) => {
        setViewAppId(appID);
        sethideAppDailog(false);
    }

    const editApp = async (appID) => {
        try{
            const res = await fetch(baseUrl+'/application/' + appID, {
                method: 'GET',
                headers: {
                    'Authorization': 'Bearer ' + token
                },
            });
            if(!res.ok){
                throw new Error('Error in fetching application [View Profile]');
            }
            const data = await res.json();
            history.push('/apply/' + data.jobID);
        }
        catch (err){
            console.log(err);
        }
    }

    const applicationsSection = user.applications? user.applications.map(app => 
        <Stack 
            horizontal 
            horizontalAlign='space-between' 
            style={{paddingLeft: '10px'}}
            className='apply_job_title'
            key={app.ID}
        >
            <div style={{color: 'gray', fontSize: '20px'}} >
                {app.title}
            </div>
            <Stack horizontal tokens={{childrenGap:20}}>
                <PrimaryButton text='View App' onClick={()=>viewApp(app.ID)}/>
                <PrimaryButton text='Edit App' onClick={async ()=>editApp(app.ID)}/>
            </Stack>
        </Stack>
    ): null;


    return (
        <div>
            <div className='homepage_main' >
                <div style={{borderBottom: '1px solid #e2e2e2', paddingBottom: '20px', width:'80%'}}>
                    <Stack horizontal horizontalAlign='space-between' >
                        <div 
                            style= {{color: 'blue', fontWeight: 'bold', fontSize: '40px',}}
                        >
                            {user.name}
                        </div>
                        {
                            isLoggedIn &&
                            <div style={{paddingTop:'30px'}}>
                                <DefaultButton 
                                    text='Edit Profile'
                                    onClick={editProfile}
                                />
                            </div>
                        }
                    </Stack>
                </div>
                {
                    (user.role === 'hr' || user.role === 'admin') &&
                    <div style={{paddingTop: '40px', paddingBootom: '40px', width:'90%'}}>
                        <div className='apply_job_title' onClick={()=>setviewJobsAppsSection(previousState => !previousState)}>
                            <Stack horizontal className='apply_job_section' horizontalAlign='space-between'>
                                <div>
                                    Jobs
                                </div>
                                <IconButton iconProps={viewJobsAppsSection? ChevronUp: ChevronDown} 
                                title="Chevron" ariaLabel="Chevron" disabled={false}
                                />
                            </Stack>
                        </div>
                        {
                            viewJobsAppsSection && 
                            <Stack 
                                vertical tokens={{childrenGap:40}} 
                                style={{
                                    paddingTop:'40px', paddingBottom:'40px', width: '90%'
                                }}
                            >
                                {jobsSection}
                            </Stack>
                        }
                    </div>                
                }

                {
                    user.role === 'applicant' &&
                    <div style={{paddingTop: '40px', paddingBootom: '40px', width:'90%'}}>
                        <div className='apply_job_title' onClick={()=>setviewJobsAppsSection(previousState => !previousState)}>
                            <Stack horizontal className='apply_job_section' horizontalAlign='space-between'>
                                <div>
                                    Applications
                                </div>
                                <IconButton iconProps={viewJobsAppsSection? ChevronUp: ChevronDown} 
                                title="Chevron" ariaLabel="Chevron" disabled={false}
                                />
                            </Stack>
                        </div>
                        {
                            viewJobsAppsSection && 
                            <Stack 
                                vertical tokens={{childrenGap:40}} 
                                style={{
                                    paddingTop:'40px', paddingBottom:'40px', width: '90%'
                                }}
                            >
                                {applicationsSection}
                            </Stack>
                        }
                    </div>                
                }
                
            </div>
            <ViewApplication 
                appID={ViewAppId} hideDialog={hideAppDailog} 
                sethideDialog={sethideAppDailog} 
            />
        </div>
    )
}

export default ViewProfile
