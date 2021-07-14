import React, { useEffect, useState } from 'react'
import { PrimaryButton, Stack, TextField } from '@fluentui/react';
import { useHistory } from "react-router-dom";
import axios from 'axios';
import { baseUrl } from '../../env'

function SignUp() {

    const stackTokens = { childrenGap: 20 };
    const [emailtxt, setEmail] = useState('');
    const [passwordtxt, setPassword] = useState('');
    const [name, setName] = useState('');
    const [passwordConfirmation, setPasswordConfirmation] = useState('')
    const history = useHistory();


    const signUp = () => {
        const data = {
            email: emailtxt,
            password: passwordtxt,
            passwordConfirmation: passwordConfirmation,
            name: name
        }
        const config = {
            headers: {
                'Content-Type': 'application/json',
            }
        }
        axios.post(baseUrl+"/user/signup", JSON.stringify(data), config)
        .then( response => {
            console.log(response);
        }).catch(error => {
            console.log(error);
        });
        history.push("/");
    }

    return (
        <Stack vertical tokens={stackTokens} className='login_verticalstack'>

            <TextField 
            label='Name'
            type="text" 
            required
            className='login_label'
            value={name}
            onChange={(e) => setName(e.target.value)}
            />

            <TextField 
            label='Email'
            type="text" 
            required
            className='login_label'
            value={emailtxt}
            onChange={(e) => setEmail(e.target.value)}
            />

            <TextField 
            label='Password'
            type="password" 
            required
            className='login_label'
            value={passwordtxt}
            onChange={(e) => setPassword(e.target.value)}
            />


            <TextField 
            label='Password Confrimation'
            type="password" 
            required
            className='login_label'
            value={passwordConfirmation}
            onChange={(e) => setPasswordConfirmation(e.target.value)}
            />


            <Stack vertical className='login_button' tokens={{childrenGap: 40}}>
                <PrimaryButton onClick={signUp} text = "Sign up" className='login_signin'/>
            </Stack>
        </Stack>
    )
}

export default SignUp
