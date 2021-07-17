import React, {useEffect} from 'react'
import { useDispatch } from 'react-redux';
import { resetCurrentJob } from '../../../redux';

function ViewJob() {

    const dispatch = useDispatch();

    useEffect(()=>{
        console.log(window.location.pathname);
        console.log(window.location.href);
        return () => {
            dispatch(resetCurrentJob());
        }
    },[dispatch]);

    return (
        <h1>
            ViewJob
        </h1>
    )
}

export default ViewJob
