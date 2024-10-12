import React, { useState } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';

import headerStyles from './Header.module.css';
import navStyles from './Nav.module.css';
import headerButtonsStyles from './Header_Buttons.module.css';

import avatarImg from '../../images/avatar.png';

export default function Header({user, setUser}) {

    let navigate = useNavigate();
    axios.defaults.withCredentials = true;

    const [showMenu, setShowMenu] = useState(false);

    const signout = () => {
        axios.get("http://localhost:5000/api/logout").then((response) => {
            setUser(null);
            navigate("/login");
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
            <button to="/signout" onClick={signout}>Logout</button>
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
                    {user && <li key="dashboard"><Link to="/dashboard">Dashboard</Link></li>}
                </ul>
            </nav>

            <div className={headerButtonsStyles.header_buttons}>
                {!user && <Link to="/login" className={headerButtonsStyles.header_button}>Login</Link>}
                {user && accountIcon}
            </div>
        </header>
    );
}

