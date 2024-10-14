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
        <>
            <aside>
                {user.access_level <= 0 && noPermissions}
                {user.access_level > 0 && <div className={styles.aside_item}><NavLink to="/account">Settings</NavLink></div>}
                {user.access_level > 0 && <div className={styles.aside_item}><NavLink to="/account/partnership">Partnership</NavLink></div>}
            </aside>
        </>
    );
}