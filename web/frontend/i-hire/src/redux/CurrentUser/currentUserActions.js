import { SET_CURRENT_USER, RESET_CURRENT_USER } from './currentUserTypes'


export const setCurrentUser = () => {
    return {
        type: SET_CURRENT_USER
    }
}

export const resetCurrentUser = (user_id, token, email, role, name, picture, jobs, applications, resume) => {
    return {
        type: RESET_CURRENT_USER,
        user_id: user_id,
        token: token,
        email: email,
        role: role,
        name: name,
        picture: picture,
        jobs: jobs,
        applications: applications,
        resume: resume
    }
}