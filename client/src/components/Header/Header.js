import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';

import headerStyles from './Header.module.css';
import navStyles from './Nav.module.css';
import headerButtonsStyles from './Header_Buttons.module.css';

import avatarImg from '../../images/avatar.png';

export default function Header() {

    let navigate = useNavigate();
    axios.defaults.withCredentials = true;

    const [loginStatus, setLoginStatus] = useState(false);
    const [showMenu, setShowMenu] = useState(false);

    useEffect(() => {
        axios.get("http://localhost:5000/login").then((response) => {
			setLoginStatus(response.data.loggedIn);
        })
        .then((response) => {
			console.log("got response:" + response);
		})
		.catch((error) => {
			console.error("There was an error with the login request:", error);
		});
    });

    const signout = () => {
        axios.post("http://localhost:5000/logout").then((response) => {
            navigate("/dashboard");
        });
    }

    const accountIcon = 
    <div className={headerButtonsStyles.account_menu}>
        <div className={headerButtonsStyles.account_icon}>
            <input type="checkbox" id={headerButtonsStyles.icon_button} onChange = {(e) => {
							setShowMenu(!showMenu);
						}} />
            <label htmlFor={headerButtonsStyles.icon_button}>
                <img src={avatarImg} alt="Account" />
            </label>
        </div>
            {showMenu && <div className={headerButtonsStyles.account_submenu}>
            <Link to="/account">Settings</Link>
            <button to="/signout" onClick={signout}>Sign Out</button>
        </div>}
    </div>

    return (
        <header className={headerStyles.header}>
            <div className={headerStyles.title}>
                <Link to="/" className={headerStyles.header_logo}>BarterDB</Link>
            </div>

            <nav className={navStyles.nav}>
                <ul>
                    <li key="home"><Link to="/">Home</Link></li>
                    {loginStatus && <li key="dashboard"><Link to="/dashboard">Dashboard</Link></li>}
                </ul>
            </nav>

            <div className={headerButtonsStyles.header_buttons}>
                {!loginStatus && <Link to="/signin" className={headerButtonsStyles.header_button}>Sign In</Link>}
                {loginStatus && accountIcon}
            </div>
        </header>
    );
}