import React, {useEffect, useState} from 'react';
import { NavLink } from 'react-router-dom';
import axios from 'axios';

import Popup from '../Popup/Popup';

import styles from './DashboardSidebar.module.css';

export default function DashboardSidebar(props) {

    let user = props.user;

    const [showPopup, setShowPopup] = useState(false);
    const [items, setItems] = useState([]);

    // This is just a debug thing so you don't have to physically update the database everytime.
    // user.access_level = 1;

    useEffect(() => {
        const signout = async () => {
            const response = await axios.get("http://localhost:5000/api/getitems");
            if(!response.data.message) {
                setItems(response.data.items);
            }
        }
        signout();
    }, []);

    const noPermissions = (
        <div className={styles.no_permissions}>
            <div><h3>Your account is unverified.</h3>Features are disabled until your account has been reviewed.</div>
            <div className={styles.aside_item}>My Posts</div>
            <div className={styles.aside_item}>Active Transactions</div>
            <div className={styles.aside_item}>Completed Transactions</div>
        </div>
    );

    // Create New Post popup
    const popup = (
        <Popup trigger={setShowPopup}>
            <h2>Create New Post</h2>
            <div className={styles.section}>
                <label htmlFor="offering_item_list">Item to offer:</label>
                <select name="offering_item_list" id="offering_item_list" className={styles.popup_select}>
                    {items.map((item, index) => (
                        <option key={index} value={item.name.toLowerCase()}>
                            {item.name}
                        </option>
                    ))}
                </select>
                <input type="number" id="quantity" name="quantity" min="1" max="99" defaultValue="1"/>
            </div>
            <div className={styles.section}>
                <label htmlFor="offering_item_list">Item to request:</label>
                <select name="offering_item_list" id="offering_item_list" className={styles.popup_select} onChange={(e) => console.log(e.target.value)}>
                    {items.map((item, index) => (
                        <option key={index} value={item.name.toLowerCase()}>
                            {item.name}
                        </option>
                    ))}
                </select>
                <input type="number" id="quantity" name="quantity" min="1" max="99" defaultValue="1"/>
            </div>
            <div className={styles.section}>
                <button className={styles.create_button}>Create</button>
                <div className={styles.checkbox}>
                    <label htmlFor="negotiate">Will Negotiate</label>
                    <input type="checkbox" id="negotiate" name="negotiate" />
                </div>
            </div>
        </Popup>
    );

    return (
        <>
            {showPopup && popup}
            <aside>
                {user.access_level <= 0 && noPermissions}
                {user.access_level > 0 && <div className={styles.aside_item}><button onClick={() => { setShowPopup(true); }}>Create New Post</button></div>}
                {user.access_level > 0 && <div className={styles.aside_item}><NavLink to="/dashboard/posts">My Posts</NavLink></div>}
                {user.access_level > 0 && <div className={styles.aside_item}><NavLink to="/dashboard/active">Active Transactions</NavLink></div>}
                {user.access_level > 0 && <div className={styles.aside_item}><NavLink to="/dashboard/history">Completed Transactions</NavLink></div>}
            </aside>
        </>
    );
}