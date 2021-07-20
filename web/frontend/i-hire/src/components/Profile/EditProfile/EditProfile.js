import React, { useState } from 'react'
import { useEffect } from 'react'
import { useParams } from 'react-router-dom'

function EditProfile() {

    const { id } = useParams();
    const [user, setuser] = useState({})

    useEffect(() => {
        
        const fetchUser = async ()=> {
            
        }
        return () => {
            
        }
    }, [])

    return (
        <div>
            Edit Profile
        </div>
    )
}

export default EditProfile
