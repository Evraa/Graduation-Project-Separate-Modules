import React from 'react'
import './jobcard.css'
import { useSelector, useDispatch } from 'react-redux';
import {PrimaryButton, Stack} from '@fluentui/react'
import { useHistory } from "react-router-dom";
import { getTime } from '../../../utilities/Utilities';
import { setCurrentJob } from '../../../redux'


function JobCard(props) {

    const {job, img} = props;
    const curUser = useSelector(state => state.currentUser);
    const signedin = curUser.isSignedIn;
    const viewsStatsFlag = curUser.role === 'hr' || curUser.role === 'admin';
    const history = useHistory();
    const dispatch = useDispatch();


    const viewJob = () => {
        dispatch(setCurrentJob(job));
        history.push('/view/'+job._id)
    }

    const applyJob = () => {
        dispatch(setCurrentJob(job));
        history.push('/apply/'+job._id)
    }

    const editJob = () => {
        dispatch(setCurrentJob(job));
        history.push('/edit/'+job._id)
    }

    return (
        <div className="card">
            <div className="thumb" style={{backgroundImage: `url(${img})`}}></div>
            <article>
                <h1>{job.title}</h1>
                <p>{job.description}</p>
                <Stack horizontal horizontalAlign= 'space-between'>
                    <span className="card_span">{getTime(job.createdAt)}</span>
                    {
                        !viewsStatsFlag &&
                        <PrimaryButton 
                            onClick={applyJob} text="Apply"
                            disabled={!signedin}
                            styles={{label:{color:'white'}, root:{margin:'1em 0 0 0'}}}
                        />
                    }
                    {
                        viewsStatsFlag &&
                        <Stack horizontal tokens={{childrenGap: 10}}>
                            <PrimaryButton 
                                onClick={editJob} text="Edit"
                                disabled={!signedin}
                                styles={{label:{color:'white'}, root:{margin:'1em 0 0 0'}}}
                            />
                            <PrimaryButton 
                                onClick={viewJob} text="View"
                                disabled={!signedin}
                                styles={{label:{color:'white'}, root:{margin:'1em 0 0 0'}}}
                            />
                        </Stack>
                    }
                </Stack>
            </article>
        </div>
    )
}

export default JobCard
