import { combineReducers } from 'redux'
import isLoadingReducer from './ISLoading/isLoadingReducer'


const rootReducer = combineReducers({
    isLoading: isLoadingReducer
})

export default rootReducer