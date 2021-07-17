import { combineReducers } from 'redux'
import isLoadingReducer from './ISLoading/isLoadingReducer'
import currentUserReducer from './CurrentUser/currentUserReducer'
import currentJobReducer from './CurrentJob/currentJobReducer'


const rootReducer = combineReducers({
    isLoading: isLoadingReducer,
    currentUser: currentUserReducer,
    currentJob: currentJobReducer
})

export default rootReducer