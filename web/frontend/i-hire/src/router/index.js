import React from 'react'
import { Switch, Route } from 'react-router-dom'
import HomePage from '../components/Home/HomePage';
import Login from '../components/Login/Login';
import AddJob from '../components/Job/Addjob/AddJob';
import SignUp from '../components/Signup/SignUp';
import ApplyJob from '../components/Job/Applyjob/ApplyJob';
import ViewJob from '../components/Job/Viewjob/ViewJob';
import ViewProfile from '../components/Profile/ViewProfile/ViewProfile';
import EditProfile from '../components/Profile/EditProfile/EditProfile';

function CustomRouter() {
    return (
        <Switch>
            <Route path ="/login"> <Login /> </Route>
            <Route path ="/create"> <AddJob /> </Route>
            <Route path ="/edit"> <AddJob /> </Route>
            <Route path ="/apply"> <ApplyJob /> </Route>
            <Route path ="/view"> <ViewJob /> </Route>
            <Route path ="/signup"> <SignUp /> </Route>
            <Route path ="/profile"> <ViewProfile /> </Route>
            <Route path ="/edit_profile"> <EditProfile /> </Route>
            <Route path ="/"> <HomePage /> </Route>
        </Switch>
    )
}

export default CustomRouter
