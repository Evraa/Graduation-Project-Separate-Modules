import { Stack } from '@fluentui/react'
import React, { useState } from 'react'
import { IconButton } from '@fluentui/react'
import JobCard from '../common/JobCard/JobCard'
import './homepage.css'

const HomePage = ()=> {

    const ChevronUp = {iconName: 'ChevronUp'}
    const ChevronDown = {iconName: 'ChevronDown'}

    const [viewJobsSection, setviewJobsSection] = useState(false)

    
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
            {
                viewJobsSection &&
                <Stack vertical className='homecontainer'>
                    <br/>
                    <br/>
                    <br/>
                    <br/>
                    <Stack horizontal className='homecontainer' horizontalAlign='center' tokens={{childrenGap: 70}}>
                        <JobCard />
                        <JobCard />
                        <JobCard />
                    </Stack>

                    <Stack horizontal className='homecontainer' horizontalAlign='center' tokens={{childrenGap: 70}}>
                        <JobCard />
                        <JobCard />
                        <JobCard />
                    </Stack>

                </Stack>
            }
        </div>

    )
}

export default HomePage
