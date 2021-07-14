import { combineReducers } from 'redux'
import isLoadingReducer from './ISLoading/isLoadingReducer'
import isSignedinReducer from './ISSignedIn/isSignedinReducer'
import currentUserReducer from './CurrentUser/currentUserReducer'


const rootReducer = combineReducers({
    isLoading: isLoadingReducer,
    isSignedin: isSignedinReducer,
    currentUser: currentUserReducer
})

export default rootReducer