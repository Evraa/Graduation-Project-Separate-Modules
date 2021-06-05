import { SET_IS_LOADING, RESET_IS_LOADING } from './isLoadingTypes'


export const setIsLoading = () => {
    return {
        type: SET_IS_LOADING
    }
}

export const resetIsLoading = () => {
    return {
        type: RESET_IS_LOADING
    }
}