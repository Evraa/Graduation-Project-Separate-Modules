import {useEffect} from 'react'
import {resetIsLoading, setIsLoading, setCurrentUser} from '../redux/index'
import store from '../redux/store'
import { baseUrl } from '../env'

function useSetUp() {


    useEffect( () => {
        const autoLogIn = async () => {
            const token = window.localStorage.getItem("token");
            if(token === ""){
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
                    return;
                }
                const data = await res.json();
                console.log(data);
                data.user.token = token;
                store.dispatch(setCurrentUser(data.user));
            }
            catch (err) {
                console.log(err);
            }
        }
        store.dispatch(setIsLoading());
        autoLogIn();
        store.dispatch(resetIsLoading())
    }, [])
}

export default useSetUp
