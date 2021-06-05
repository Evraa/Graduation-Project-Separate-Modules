import {useEffect} from 'react'
import {setIsLoading} from '../redux/index'
import store from '../redux/store'

function useSetUp() {


    useEffect( () => {
        store.dispatch(setIsLoading())
    }, [])
}

export default useSetUp
