import React, { useState } from 'react';
import axios, { isCancel } from 'axios';
import { NavLink, useNavigate } from 'react-router-dom';

import headerStyles from './Header.module.css';
import navStyles from './Nav.module.css';
import headerButtonsStyles from './Header_Buttons.module.css';

export default function Header(props) {

    let user = props.user;

    let showDashLink = props.showDashLink ?? true;
    let showAdminLink = props.showAdminLink ?? true;

    let navigate = useNavigate();
    axios.defaults.withCredentials = true;

    const [showMenu, setShowMenu] = useState(false);

    const signout = () => {
        axios.get("http://localhost:5000/users/logout").then((response) => {
            props.setUser(null);
            navigate("/login");
        });
    }

    const accountIcon = (
        <div className={headerButtonsStyles.account_menu}>
            <div className={headerButtonsStyles.account_icon}>
                <input type="checkbox" id={headerButtonsStyles.icon_button} onChange = {(e) => { setShowMenu(!showMenu); }} />
                <label htmlFor={headerButtonsStyles.icon_button}>
                    <img src="/images/avatar.png" alt="Account" />
                </label>
            </div>
                {showMenu && 
                    <>
                        <button onClick={(e) => { setShowMenu(!showMenu); }} className={headerButtonsStyles.menu_background}></button>
                        <div className={headerButtonsStyles.account_submenu}>
                            <NavLink to="/account">Settings</NavLink>
                            <button to="/signout" onClick={signout}>Logout</button>
                        </div>
                    </>
                }
        </div>
    );

    return (
        <header className={headerStyles.header}>
            {/* BarterDB logo */}
            <div className={headerStyles.title}>
                <NavLink to="/" className={headerStyles.header_logo}>BarterDB</NavLink>
            </div>

            {/* Navigation */}
            <nav className={navStyles.nav}>
                <ul>
                {user && showDashLink && <li key="dashboard"><NavLink to="/dashboard">Dashboard</NavLink></li>}
                {user.access_level > 1 && showAdminLink && <li key="admin_dashboard"><NavLink to="/dashboard/admin">Admin Panel</NavLink></li>}
                </ul>
            </nav>

            {/* Buttons */}
            <div className={headerButtonsStyles.header_buttons}>
                {!user && <NavLink to="/login" className={headerButtonsStyles.header_button}>Login</NavLink>}
                {user && accountIcon}
            </div>
        </header>
    );
}

