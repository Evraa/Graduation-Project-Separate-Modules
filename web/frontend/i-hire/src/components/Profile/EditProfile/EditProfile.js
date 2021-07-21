import { Label, PrimaryButton, Stack, TextField } from '@fluentui/react';
import React, { useState } from 'react'
import { useEffect } from 'react'
import { useSelector } from 'react-redux';
import { useParams } from 'react-router-dom'
import { baseUrl } from '../../../env'

function EditProfile() {

    const { id } = useParams();
    const [user, setuser] = useState({})

    const currentUser = useSelector(state => state.currentUser);
    const token = currentUser.token;

    const [image, setimage] = useState({});
    const [imgErr, setimgErr] = useState('')


    const [name, setname] = useState('');
    const [nameErr, setnameErr] = useState('')

    const initialState = {
        oldPassword: '', newPassword: '', passwordConfirmation: ''
    }
    const [password, setpassword] = useState(initialState);
    const [passwordErr, setpasswordErr] = useState(initialState)

    useEffect(() => {
        
        const fetchUser = async ()=> {
            const res = await fetch(baseUrl+'/user/me', {
                method: 'GET',
                headers: {
                    'Authorization': 'Bearer ' + token,
                    'Content-Type': 'application/json'
                }
            })
            const data = await res.json();
            setuser(data.user);

        }

        fetchUser();

        return () => {
            
        }
    }, [token])

    const editImage = async () => {
        try {
            const formData = new FormData();
            formData.append('picture', image);
            const res2 = await fetch(baseUrl+'/user/picture', {
                method: 'POST',
                headers: {
                    'Authorization': 'Bearer ' + token
                },
                body: formData
            });
            const data2 = await res2.json();
            console.log(data2);
            if(!res2.ok){
                setimgErr(data2.errors[0].msg);
                return;
            }
            setimgErr('');
        } catch (error) {
            console.log(error);
        }
    }

    const editName = async () => {
        try {
            const data={name: name};
            const res2 = await fetch(baseUrl+'/user/update_profile', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer ' + token
                },
                body: JSON.stringify(data)
            });
            const data2 = await res2.json();
            console.log(data2);
            if(!res2.ok){
                setnameErr(data2.errors[0].msg);
                return;
            }
            setnameErr('');
        } catch (error) {
            console.log(error);
        }
    }

    const editPassword = async () => {
        try {
            const data={
                oldPassword: password.oldPassword,
                newPassword: password.newPassword,
                passwordConfirmation: password.passwordConfirmation
            };
            const res2 = await fetch(baseUrl+'/user/update_profile', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer ' + token
                },
                body: JSON.stringify(data)
            });
            const data2 = await res2.json();
            console.log(data2);
            if(!res2.ok){
                const errors = data2.errors;
                const err = {...initialState};
                for(var i = 0; i < errors.length; i += 1)
                    err[errors[i].param] = errors[i].msg;
                setpasswordErr(err);
                return;
            }
            setpasswordErr(initialState);
        } catch (error) {
            console.log(error);
        }
    }

    return (
        <Stack vertical tokens={{childrenGap:40}} className='homepage_main' >
            <Stack vertical
                style={{borderBottom: '1px solid #e2e2e2', paddingBottom: '40px', width:'90%', paddingLeft:'25px'}}
            >
                <Stack.Item align='start'
                    style={{color: 'blue', paddingBottom: '20px', 'fontSize': '25px', fontWeight: 'bold'}} 
                >
                    Update image
                </Stack.Item> 

                <Stack.Item align='center'>
                    <input 
                        type="file" 
                        onChange={ e => {setimage(e.target.files[0])}} 
                        className='upload_file'
                    />
                    <div style={{paddingBottom: '20px'}} >{image? image.name: null}</div>
                    <Label className='login_label' >{imgErr}</Label>
                </Stack.Item>

                <Stack.Item align='end'>
                    <PrimaryButton text='Update Image' onClick={editImage} />
                </Stack.Item>
            </Stack>


            <Stack vertical
                style={{borderBottom: '1px solid #e2e2e2', paddingBottom: '40px', width:'90%', paddingLeft:'25px'}}
            >
                <Stack.Item align='start'
                    style={{color: 'blue', paddingBottom: '20px', 'fontSize': '25px', fontWeight: 'bold'}} 
                >
                    Update Name
                </Stack.Item> 

                <Stack.Item align='center'>
                    <TextField required
                        label='Name'
                        text={name}
                        className='login_label'
                        onChange={e => setname(e.target.value)}
                    />
                    <Label className='login_label' styles={{root:{textAlign:'end'}}}>
                        {nameErr}
                    </Label>
                </Stack.Item>

                <Stack.Item align='end'>
                    <PrimaryButton text='Update Name' onClick={editName} />
                </Stack.Item>
            </Stack>

            <Stack vertical
                style={{ paddingBottom: '40px', width:'90%', paddingLeft:'25px'}}
            >
                <Stack.Item align='start'
                    style={{color: 'blue', paddingBottom: '20px', 'fontSize': '25px', fontWeight: 'bold'}} 
                >
                    Update Password
                </Stack.Item> 

                <Stack.Item align='center'>
                    <Stack vertical tokens={{childrenGap:20}}>

                        <div>
                            <TextField 
                                label='old password'
                                type="password" 
                                required
                                className='login_label'
                                canRevealPassword
                                value={password.oldPassword}
                                onChange={(e) => setpassword(p => {return {...p, oldPassword:e.target.value}})}
                            />
                            <Label className='login_label' styles={{root:{textAlign:'end'}}}>
                                {passwordErr['oldPassword']}
                            </Label>
                        </div>

                        <div>
                            <TextField 
                                label='new password'
                                type="password" 
                                required
                                className='login_label'
                                canRevealPassword
                                value={password.newPassword}
                                onChange={(e) => setpassword(p => {return {...p, newPassword:e.target.value}})}
                            />
                            <Label className='login_label' styles={{root:{textAlign:'end'}}}>
                                {passwordErr['newPassword']}
                            </Label>
                        </div>

                        <div>
                            <TextField 
                                label='new password confirmation'
                                type="password" 
                                required
                                className='login_label'
                                canRevealPassword
                                value={password.passwordConfirmation}
                                onChange={(e) => setpassword(p => {return {...p, passwordConfirmation:e.target.value}})}
                            />
                            <Label className='login_label' styles={{root:{textAlign:'end'}}}>
                                {passwordErr['passwordConfirmation']}
                            </Label>
                        </div>

                    </Stack>
                </Stack.Item>

                <Stack.Item align='end'>
                    <PrimaryButton text='Update Password' onClick={editPassword} />
                </Stack.Item>
            </Stack>
                
        </Stack>
    )
}

export default EditProfile
