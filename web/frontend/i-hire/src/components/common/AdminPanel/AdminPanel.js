import { DefaultButton, Link, Panel, PrimaryButton, Stack, TextField } from '@fluentui/react';
import React, { useEffect, useState } from 'react'
import { useSelector } from 'react-redux';
import { useHistory } from 'react-router-dom';
import {baseUrl, downloadUrl} from '../../../env';

function AdminPanel(props) {

    const {viewAdminPanel, setviewAdminPanel} = props;

    const currentUser = useSelector(state => state.currentUser);
    const token = currentUser.token;

    const [searchText, setsearchText] = useState('');

    const [users, setusers] = useState([])
    const promoteState = ['promote', 'demote']

    const history = useHistory();

    useEffect(() => {

        const fetchUsers = async () => {
            try {
                const res = await fetch(baseUrl+'/user/', {
                    method: 'GET',
                    headers: {
                        'Authorization': 'Bearer ' + token,
                        'Content-Type': 'application/json'
                    }
                })
                const data = await res.json();
                console.log(data);
                setusers(data);
                
            } catch (error) {
                console.log(error);
            }
        }
        if(viewAdminPanel)
            fetchUsers();
        
        return () => {

        }
    }, [token, viewAdminPanel])

    const searchUsers = async () => {
        try {
            const url = new URL(baseUrl + "/user/search/");
            const params = {q: searchText};
            url.search = new URLSearchParams(params).toString();
            const res = await fetch(url, {
                method: 'GET',
                headers: {
                    'Authorization': 'Bearer ' + token,
                    'Content-Type': 'application/json'
                }
            })
            const data = await res.json();
            console.log(data);
            if(!res.ok){
                return;
            }
            setusers(data);

        } catch (error) {
            console.log(error);
        }
    }

    const viewUsers = async () => {
        try {
            const res = await fetch(baseUrl+'/user/', {
                method: 'GET',
                headers: {
                    'Authorization': 'Bearer ' + token,
                    'Content-Type': 'application/json'
                }
            })
            const data = await res.json();
            setusers(data);
            
        } catch (error) {
            console.log(error);
        }
    }

    const alternateUser = async (ind) => {
        const usrs = [...users];
        const usr = users[ind];
        const promote = usr.role === 'applicant'? '/promote' : '/demote';
        
        try {
            const res = await fetch(baseUrl+'/user/' + usr._id + promote, {
                method: 'PATCH',
                headers: {
                    'Authorization': 'Bearer ' + token,
                    'Content-Type': 'application/json'
                }
            })
            const data = await res.json();
            if(res.ok){
                usrs[ind].role = usr.role === 'applicant'? 'hr' : 'applicant';
                setusers(usrs);
            }
            
        } catch (error) {
            console.log(error);
        }
    }

    const usersElement = users.map((user, index) =>
        <Stack horizontal horizontalAlign='space-between' style={{height:'50px'}}>
            <Stack horizontal tokens={{childrenGap:10}}>
                {
                    user.picture && 
                    <img 
                        src={downloadUrl + user.picture} alt='profile' 
                        style={{
                            borderRadius:'50%', height:'50px', width: '50px'
                        }} 
                    />
                }
                <Link 
                    style={{
                        color: 'blue', fontSize:'20px', fontWeight: 'bold'
                    }}
                    onClick={()=>{
                        setviewAdminPanel(false);
                        history.push("/profile/"+user._id);
                    }}
                >
                    {user.name}
                </Link>
            </Stack>
            
            <div style={{paddingTop: '10px'}}>
                <PrimaryButton 
                    text={user.role === 'applicant'? 'promote': 'demote '}
                    onClick={() => alternateUser(index)}
                />
            </div>
            

        </Stack>
    )

    return (
        <Panel
            headerText="Manage Users"
            customWidth='500px'
            isOpen={viewAdminPanel}
            onDismiss={()=>setviewAdminPanel(false)}
            // You MUST provide this prop! Otherwise screen readers will just say "button" with no label.
            closeButtonAriaLabel="Close"
        >
            <TextField 
                text={searchText}
                onChange={(e) => setsearchText(e.target.value)}
                label='Search by name'
                description='search by name or email'
                styles={{
                    root:{paddingTop: '50px', paddingBottom:'30px'}, 
                    subComponentStyles:{
                        label: {root:{color: 'blue'}}
                    }
                }}
            />
            <Stack horizontal horizontalAlign='end' 
                tokens={{childrenGap:20}}
                styles={{
                    root:{paddingBottom:'40px'}
                }}
            >
                <DefaultButton 
                    text='Search'
                    onClick={searchUsers}
                    iconProps={{iconName:'Search'}} 
                    styles={{label:{color:'blue', fontWeight:'bold'}}}
                />

                <DefaultButton 
                    text='View All'
                    onClick={viewUsers}
                    iconProps={{iconName:'ContactList'}} 
                    styles={{label:{color:'blue', fontWeight:'bold'}}}
                />
            </Stack>
            <div 
                style={{
                    borderBottom: '1px solid #e2e2e2',
                    color: 'red', paddingBottom: '20px', 
                    fontSize:'25px', fontWeight: 'bold'
                }}
            >
                Users
            </div>

            <Stack vertical 
                tokens={{childrenGap:30}}
                style={{paddingTop: '50px'}}
            >
                {usersElement}
            </Stack>
            
        </Panel>
    )
}

export default AdminPanel
