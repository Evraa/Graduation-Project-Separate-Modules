import React from 'react'
import { Link } from "react-router-dom";
import { useSelector, useDispatch } from 'react-redux';
import './navbar.css';
import { setIsLoading, resetIsLoading, resetCurrentUser} from '../../../redux/index'

function NavBar(props) {


    const { setviewAdminPanel } = props;

    const curUser = useSelector(state => state.currentUser);
    const signedin = curUser.isSignedIn;
    const createFlag = curUser.role === 'hr';
    const isAdmin = curUser.role === 'admin';
    const dispatch = useDispatch();

    const logOut = () => {
        dispatch(setIsLoading());
        dispatch(resetCurrentUser());
        window.localStorage.setItem("token", "");
        dispatch(resetIsLoading());
    }


    return (
        <nav className="navbar">
            <Link to="/"><h1>iHire</h1></Link>
            <div className="links">
                <Link to="/">Home</Link>
                {createFlag && <Link to="/create"> Create Job </Link>}
                {!signedin && <Link to="/login">Sign in</Link>}
                {signedin && <Link to={"/profile/"+curUser._id}>Profile</Link>}
                {signedin && <Link to="/home" onClick={logOut}>Log out</Link>}
                {
                    isAdmin && 
                    <Link onClick={() => setviewAdminPanel(true)}>Manage Users</Link>
                }
            </div>
        </nav>
    );
}

export default NavBar
