import React, { useState } from 'react'
import { useDispatch } from 'react-redux';
import { PrimaryButton, Stack, TextField, Label } from '@fluentui/react';
import { useHistory } from "react-router-dom";
import { baseUrl } from '../../env'
import { setCurrentUser } from '../../redux/CurrentUser/currentUserActions'
import { setIsLoading, resetIsLoading } from '../../redux/ISLoading/isLoadingActions'

function SignUp() {

    const stackTokens = { childrenGap: 20 };
    const [emailtxt, setEmail] = useState('');
    const [passwordtxt, setPassword] = useState('');
    const [name, setName] = useState('');
    const [passwordConfirmation, setPasswordConfirmation] = useState('');
    const [errors, setErrors] = useState({});
    const history = useHistory();

    const dispatch = useDispatch();

    const signUp = async () => {
        const data = {
            email: emailtxt,
            password: passwordtxt,
            passwordConfirmation: passwordConfirmation,
            name: name
        }
        try {
            const res = await fetch(baseUrl + "/user/signup", {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(data)
            })
            if(res.ok){
                dispatch(setIsLoading())
                const data = await res.json();
                console.log(data);
                const res2 = await fetch(baseUrl + "/user/me", {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': 'Bearer ' + data.token
                    }
                })
                const data2 = await res2.json();
                console.log(data2);
                data2.user.token = data.token;
                window.localStorage.setItem("token", data.token);
                dispatch(setCurrentUser(data2.user));
                dispatch(resetIsLoading())
                history.push('/');
            }
            else{
                const data = await res.json();
                const errors = data.errors;
                console.log(errors);
                const newErrors = {};
                errors.forEach(element => {
                    newErrors[element.param] = element.msg;
                });
                setErrors(newErrors);
            }
        }
        catch(error) {
            console.log(error);
        };
    };

    return (
        <Stack vertical tokens={stackTokens} className='login_verticalstack'>
            <div>
                <TextField 
                    label='Name'
                    type="text" 
                    required
                    className='login_label'
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                />
                <Label className='login_label' styles={{root:{textAlign:'end'}}}>{errors['name']}</Label>
            </div>

            <div>
                <TextField 
                    label='Email'
                    type="text" 
                    required
                    className='login_label'
                    value={emailtxt}
                    onChange={(e) => setEmail(e.target.value)}
                />
                <Label className='login_label' styles={{root:{textAlign:'end'}}}>{errors['email']}</Label>
            </div>

            <div>
                <TextField 
                    label='Password'
                    type="password" 
                    required
                    className='login_label'
                    value={passwordtxt}
                    onChange={(e) => setPassword(e.target.value)}
                />
                <Label className='login_label' styles={{root:{textAlign:'end'}}}>{errors['password']}</Label>
            </div>

            <div>
                <TextField 
                    label='Password Confrimation'
                    type="password" 
                    required
                    className='login_label'
                    value={passwordConfirmation}
                    onChange={(e) => setPasswordConfirmation(e.target.value)}
                />
                <Label className='login_label' styles={{root:{textAlign:'end'}}}>{errors['passwordConfirmation']}</Label>
            </div>


            <Stack vertical className='login_button' tokens={{childrenGap: 40}}>
                <PrimaryButton onClick={signUp} text = "Sign up" className='login_signin'/>
            </Stack>
        </Stack>
    )
}

export default SignUp
