import React from 'react'
import './jobcard.css'
import { useSelector } from 'react-redux';
import {PrimaryButton} from '@fluentui/react'
import { useHistory } from "react-router-dom";


function JobCard() {

    const curUser = useSelector(state => state.currentUser);
    const signedin = curUser.isSignedIn;
    const viewsStatsFlag = curUser.role === 'hr' || curUser.role === 'admin';
    const enableApply = false;
    const history = useHistory();
    const buttonStyles = {
        label: {fontSize : 30, fontWeight: 'bold'}, 
        root: {backgroundColor: '#F61471'}, 
        rootHovered: {backgroundColor: '#33E3FF'}
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
                <div className='job_text'>The Fluent UI Icons tool lets you search and browse all of Fluent UI's icons. You can also use it to create and maintain subsets of the icon font to use in your web apps, which are drop-in replacements for the default Fabric Core and Fluent UI React icon sets. In addition, the Fluent UI Icons tool is updated with new icons several times a month, whereas the default Fluent UI set is updated only occasionally. You can see detailed docs for the tool at https://aka.ms/fluentui-icons?help. (Note: This tool is only for use with font-based icons currently.)</div>
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
                    !viewsStatsFlag &&
                    <PrimaryButton 
                    onClick={applyJob} text = "Apply Job" className='job_card_button'
                    disabled={enableApply || !signedin}  styles={buttonStyles}
                    />
                }
            </div>
        </div>
    )
}

export default JobCard
