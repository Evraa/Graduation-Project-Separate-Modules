import { SET_CURRENT_USER, RESET_CURRENT_USER } from './currentUserTypes'


const initialState = {
    isSignedIn: false,
    _id: "",
    token: "",
    email: "",
    role: "",
    name: "",
    picture: "",
    jobs: null,
    applications: null,
    resume: "",
    createdAt:"",
    updatedAt:""
}

const currentUserReducer = (state = initialState, action) => {
    switch(action.type) {
        case SET_CURRENT_USER: return {
            ...state,
            isSignedIn:true,
            ...action.user
        }
        case RESET_CURRENT_USER: return {
            ...state,
            isSignedIn: false,
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