import { SET_IS_SIGNEDIN, RESET_IS_SIGNEDIN } from './isSignedinTypes'


const initialState = {
    isSignedin: false
}

const isSignedinReducer = (state = initialState, action) => {
    switch(action.type) {
        case SET_IS_SIGNEDIN: return {
            ...state,
            isSignedin: true
        }
        case RESET_IS_SIGNEDIN: return {
            ...state,
            isSignedin: false
        }
        default: return state
    }
}

export default isSignedinReducer