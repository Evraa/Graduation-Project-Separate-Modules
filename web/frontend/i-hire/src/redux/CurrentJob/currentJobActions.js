import { SET_CURRENT_JOB, RESET_CURRENT_JOB } from './currentJobTypes'


export const resetCurrentJob = () => {
    return {
        type: RESET_CURRENT_JOB
    }
}

export const setCurrentJob = (job) => {
    return {
        type: SET_CURRENT_JOB,
        job: job 
    }
}