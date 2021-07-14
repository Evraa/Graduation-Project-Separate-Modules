import { Stack } from '@fluentui/react'
import React from 'react'
import JobCard from '../common/JobCard/JobCard'
import './homepage.css'

const HomePage = ()=> {

    
    return (
        <Stack vertical className='homecontainer'>
            <br/>
            <br/>
            <br/>
            <br/>
            <Stack horizontal className='homecontainer' horizontalAlign='center' tokens={{childrenGap: 70}}>
                <JobCard />
                <JobCard />
                <JobCard />
                <JobCard />
            </Stack>
            <br />
            <br />
            <br />
            <Stack horizontal className='homecontainer' horizontalAlign='left' tokens={{childrenGap: 70}}>
                <JobCard />
                <JobCard />
                <JobCard />
            </Stack>
            <br />
            <br />
            <br />
            <br />
        </Stack>
    )
}

export default HomePage
