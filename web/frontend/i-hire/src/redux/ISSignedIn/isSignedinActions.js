import { SET_IS_SIGNEDIN, RESET_IS_SIGNEDIN } from './isSignedinTypes'


export const setIsSignedin = () => {
    return {
        type: SET_IS_SIGNEDIN
    }
}

export const resetIsSignedin = () => {
    return {
        type: RESET_IS_SIGNEDIN
    }
}