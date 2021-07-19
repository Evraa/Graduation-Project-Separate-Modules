import { Stack } from '@fluentui/react'
import React, { useEffect, useState } from 'react'
import { IconButton } from '@fluentui/react'
import JobCard from '../common/JobCard/JobCard'
import './homepage.css'
import { softWareimages } from '../../images/Images'
import { baseUrl } from '../../env'
import { useDispatch } from 'react-redux'
import { setIsLoading, resetIsLoading } from '../../redux'

const HomePage = ()=> {

    const ChevronUp = {iconName: 'ChevronUp'}
    const ChevronDown = {iconName: 'ChevronDown'}

    const [viewJobsSection, setviewJobsSection] = useState(false)
    const [Jobs, setJobs] = useState([]);
    const dispatch = useDispatch();

    const jobsSection = ()=>{
        let content = [];
        for(let x = 0; x < Jobs.length; x += 3){
            const subcont = [];
            for(let j = x; j < x+3 && j < Jobs.length; j += 1){
                subcont.push(<JobCard job={Jobs[j]} img={softWareimages[j%12]} key={Jobs[j]._id}/>)
            }
            content.push(
                <Stack horizontal className='homecontainer' horizontalAlign='center' tokens={{childrenGap: 80}}>
                    {subcont}
                </Stack>
            )
        }
        return(
            <Stack vertical className='homecontainer'>
                {content}
            </Stack>
        );
    }

    useEffect(()=>{
        const fetchJobs = async ()=>{
            dispatch(setIsLoading());
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
            dispatch(resetIsLoading());
        }
        fetchJobs();
    },[dispatch])
    
    return (

        <div className='homepage_main' >
            <div className='apply_job_title' onClick={()=>setviewJobsSection(previousState => !previousState)}>
                <Stack horizontal className='apply_job_section' horizontalAlign='space-between'>
                    <div>
                        Available Jobs
                    </div>
                    <IconButton iconProps={viewJobsSection? ChevronUp: ChevronDown} 
                    title="Chevron" ariaLabel="Chevron" disabled={false}
                    />
                </Stack>
            </div>
            <br/>
            <br/>
            <br/>
            <br/>
            {
                viewJobsSection && jobsSection()
            }
        </div>

    )
}

export default HomePage
