import { SET_IS_LOADING, RESET_IS_LOADING } from './isLoadingTypes'


const initialState = {
    isLoading: false
}

const isLoadingReducer = (state = initialState, action) => {
    switch(action.type) {
        case SET_IS_LOADING: return {
            ...state,
            isLoading: true
        }
        case RESET_IS_LOADING: return {
            ...state,
            isLoading: false
        }
        default: return state
    }
}

export default isLoadingReducer