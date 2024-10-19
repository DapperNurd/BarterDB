import React, {useEffect, useState} from 'react';
import { NavLink } from 'react-router-dom';
import axios from 'axios';

import styles from './AccountSidebar.module.css';

export default function AccountSidebar(props) {

    let user = props.user;

    const noPermissions = (
        <div className={styles.no_permissions}>
            <div><h3>Your account is unverified.</h3>Features are disabled until your account has been reviewed.</div>
            <div className={styles.aside_item}>Settings</div>
            <div className={styles.aside_item}>Partnership</div>
        </div>
    );

    return (
        <aside className={styles.aside}>
            {user.access_level <= 0 && noPermissions}
            {user.access_level > 0 && <NavLink to="/account">Settings</NavLink>}
            {user.access_level > 0 && <NavLink to="/account/partnership">Partnership</NavLink>}
        </aside>
    );
}