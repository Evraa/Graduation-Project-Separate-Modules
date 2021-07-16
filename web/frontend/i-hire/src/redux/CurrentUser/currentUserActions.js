import { SET_CURRENT_USER, RESET_CURRENT_USER } from './currentUserTypes'


export const resetCurrentUser = () => {
    return {
        type: RESET_CURRENT_USER
    }
}

export const setCurrentUser = (user) => {
    return {
        type: SET_CURRENT_USER,
        user: user 
    }
}