import { combineReducers } from 'redux'
import isLoadingReducer from './ISLoading/isLoadingReducer'
import currentUserReducer from './CurrentUser/currentUserReducer'


const rootReducer = combineReducers({
    isLoading: isLoadingReducer,
    currentUser: currentUserReducer
})

export default rootReducer