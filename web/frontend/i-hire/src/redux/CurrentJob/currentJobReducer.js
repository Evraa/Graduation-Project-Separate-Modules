import { SET_CURRENT_JOB, RESET_CURRENT_JOB } from './currentJobTypes'


const initialState = {
    _id: "",
    title: "",
    description: "",
    questions: [],
    videoRequired: false,
    enabled: true,
    applicationIDs: [],
    rankedApplicants: []
}

const currentJobReducer = (state = initialState, action) => {
    switch(action.type) {
        case SET_CURRENT_JOB: return {
            ...state,
            ...action.job
        }
        case RESET_CURRENT_JOB: return {
            ...state,
            _id: "",
            title: "",
            description: "",
            questions: [],
            videoRequired: false,
            enabled: true,
            applicationIDs: [],
            rankedApplicants: []
        }
        default: return state
    }
}

export default currentJobReducer