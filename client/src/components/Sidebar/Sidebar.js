import React, {useEffect, useState} from 'react';
import { NavLink } from 'react-router-dom';
import axios from 'axios';

import styles from './Sidebar.module.css';

export default function Sidebar(props) {

    let user = props.user;
    
    let usePermissions = props.usePermissions ?? false;

    const noPermissions = (
        <div className={styles.no_permissions}>
            <div><h3>Your account is unverified.</h3>Features are disabled until your account has been reviewed.</div>
            <div className={styles.no_permissions_links}>
                {props.children}
            </div>
        </div>
    );

    const displayItems = () => {
        if(usePermissions && user.access_level <= 0) {
            return noPermissions;
        }
        else {
            return props.children;
        }
    }

    return (
        <aside className={styles.aside}>
            {displayItems()}
        </aside>
    );
}