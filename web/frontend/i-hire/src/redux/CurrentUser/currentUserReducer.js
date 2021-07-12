import { SET_CURRENT_USER, RESET_CURRENT_USER } from './currentUserTypes'


const initialState = {
    user_id: "",
    token: "",
    email: "",
    role: "",
    name: "",
    picture: "",
    jobs: null,
    applications: null,
    resume: ""
}

const currentUserReducer = (state = initialState, action) => {
    switch(action.type) {
        case SET_CURRENT_USER: return {
            ...state,
            user_id: action.user_id? action.user_id: state.user_id,
            token: action.token? action.token: state.token,
            email: action.email? action.email: state.email,
            role: action.role? action.role: state.role,
            name: action.name? action.name: state.name,
            picture: action.picture? action.picture: state.picture,
            jobs: action.jobs? action.jobs: state.jobs,
            applications: action.applications? action.applications: state.applications,
            resume: action.resume? action.resume: state.resume,
        }
        case RESET_CURRENT_USER: return {
            ...state,
            user_id: "",
            token: "",
            email: "",
            role: "",
            name: "",
            picture: "",
            jobs: null,
            applications: null,
            resume: ""
        }
        default: return state
    }
}

export default currentUserReducer