import React, { useState } from 'react'
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
        })
    }



    return (
        <Stack vertical tokens={stackTokens} className='verticalstack'>

            <TextField 
            label='Name'
            type="text" 
            required
            className='label'
            value={name}
            onChange={(e) => setName(e.target.value)}
            />

            <TextField 
            label='Email'
            type="text" 
            required
            className='label'
            value={emailtxt}
            onChange={(e) => setEmail(e.target.value)}
            />

            <TextField 
            label='Password'
            type="password" 
            required
            className='label'
            value={passwordtxt}
            onChange={(e) => setPassword(e.target.value)}
            />


            <TextField 
            label='Password Confrimation'
            type="password" 
            required
            className='label'
            value={passwordConfirmation}
            onChange={(e) => setPasswordConfirmation(e.target.value)}
            />


            <Stack vertical className='button' tokens={{childrenGap: 40}}>
                <PrimaryButton onClick={signUp} text = "Sign up" className='signin'/>
            </Stack>
        </Stack>
    )
}

export default SignUp
