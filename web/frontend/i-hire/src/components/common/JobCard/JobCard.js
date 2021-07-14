import React from 'react'
import './jobcard.css'
import { useSelector } from 'react-redux';
import {PrimaryButton} from '@fluentui/react'
import { useHistory } from "react-router-dom";


function JobCard() {

    const signedin = useSelector(state => state.isSignedin).isSignedin;
    const curUser = useSelector(state => state.currentUser);
    const viewsStatsFlag = curUser.role === 'hr' || curUser.role === 'admin';
    const enableApply = false;
    const history = useHistory();
    const buttonStyles = {
        label: {fontSize : 30, fontWeight: 'bold'}, 
        root: {backgroundColor: '#F61471'}, 
        rootHovered: {backgroundColor: 'red'}
    }


    const viewJob = () => {
        console.log('hello');
        history.push('/view')
    }

    const applyJob = () => {
        console.log('hello');
        history.push('/apply')
    }

    return (
        <div className='job_card'>
            <div className='job_header'>
                <div className='job_text'>Job title</div>
            </div>
            <div className='job_body'>
                <div style={{color:'red'}} className='job_text'>Job description</div>
            </div>
        
            <div className='job_footer'>
                {
                    signedin && viewsStatsFlag &&
                    <PrimaryButton 
                    onClick={viewJob} text = "View Stats" className='job_card_button' 
                    styles={buttonStyles}
                    />
                }
                {
                    !signedin && !viewsStatsFlag &&
                    <PrimaryButton 
                    onClick={applyJob} text = "Apply Job" className='job_card_button'
                    disabled={enableApply}  styles={buttonStyles}
                    />
                }
            </div>
        </div>
    )
}

export default JobCard
