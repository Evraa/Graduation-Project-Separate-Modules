import {useEffect} from 'react'
import {resetIsLoading, setIsLoading, setCurrentUser} from '../redux/index'
import store from '../redux/store'
import { baseUrl } from '../env'

function useSetUp() {


    useEffect( () => {
        const autoLogIn = async () => {
            store.dispatch(setIsLoading());
            const token = window.localStorage.getItem("token");
            if(token === ""){
                store.dispatch(resetIsLoading());
                return;
            }
            try {
                const res = await fetch(baseUrl + "/user/me", {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': 'Bearer ' + token
                    }
                });
                if(!res.ok){
                    window.localStorage.setItem("token", "");
                    store.dispatch(resetIsLoading());
                    return;
                }
                const data = await res.json();
                console.log(data);
                data.user.token = token;
                store.dispatch(setCurrentUser(data.user));
                store.dispatch(resetIsLoading())
            }
            catch (err) {
                console.log(err);
            }
        }
        autoLogIn();
    }, [])
}

export default useSetUp
