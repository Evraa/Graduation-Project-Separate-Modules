import React, { useState } from 'react'
import { DefaultButton, PrimaryButton, Stack, TextField } from '@fluentui/react';
import { useHistory } from "react-router-dom";
import './login.css'

function Login() {

    const stackTokens = { childrenGap: 20 };
    const [emailtxt, setEmail] = useState('');
    const [passwordtxt, setPassword] = useState('');
    const history = useHistory();


    const signIn = () => {
        console.log(emailtxt);
        setPassword("");
    }

    const signUp = () => {
        history.push('signup');
    }

    return (
        <Stack vertical tokens={stackTokens} className='login_verticalstack'>
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


            <Stack vertical className='login_button' tokens={{childrenGap: 40}}>
                <DefaultButton onClick={signIn} text = "Sign in" className='login_signin'/>
                <PrimaryButton onClick={signUp} text = "Sign up" className='login_signin'/>
            </Stack>
        </Stack>
    )
}

export default Login
