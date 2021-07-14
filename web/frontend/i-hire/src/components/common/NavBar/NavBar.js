import React from 'react'
import { Link } from "react-router-dom";
import { useSelector } from 'react-redux';
import './navbar.css';

function NavBar() {

    const signedin = useSelector(state => state.isSignedin).isSignedin;
    const curUser = useSelector(state => state.currentUser);
    const createFlag = curUser.role === 'hr' || curUser.role === 'admin';

    const logOut = () => {
        console.log("log out");     // log out
    }


    return (
        <nav className="navbar">
            <Link to="/"><h1>iHire</h1></Link>
            <div className="links">
                <Link to="/">Home</Link>
                {createFlag && <Link to="/create"> Create Job </Link>}
                {!signedin && <Link to="/login">Sign in</Link>}
                {signedin && <Link to="/profile">Profile</Link>}
                {signedin && <Link to="/home" onClick={logOut}>Log out</Link>}
            </div>
        </nav>
    );
}

export default NavBar
