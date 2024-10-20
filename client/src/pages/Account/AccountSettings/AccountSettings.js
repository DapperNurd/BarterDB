import React, {useEffect, useState} from 'react';
import { NavLink } from 'react-router-dom';
import axios from 'axios';

import Header from "../../../components/Header/Header";
import Footer from "../../../components/Footer/Footer";
import Sidebar from "../../../components/Sidebar/Sidebar";
import Popup from '../../../components/Popup/Popup';

import styles from "./AccountSettings.module.css";

export default function Account(props) {

    let user = props.user;

    const [showEditPopup, setEditShowPopup] = useState(false);
    const [showPwChangePopup, setPwChangeShowPopup] = useState(false);

    const [email, setEmail] = useState(user.email);
    const [phone, setPhone] = useState(user.phone_number);
    const [address, setAddress] = useState(user.address);

    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmNewPassword, setConfirmNewPassword] = useState('');

    const [errorMsg, setErrorMsg] = useState('');

    useEffect(() => {
        setErrorMsg("");
    }, [showEditPopup, showPwChangePopup]);

    const SaveAccountInfo = async () => {
        if(email === '') {
            setErrorMsg('Please fill in all required (*) fields.');
            return;
        }

        const newResponse = await axios.post("http://localhost:5000/users/set-user-info", { userId: user.user_id, email: email, phone: phone, address: address });
        if(newResponse.data.message) {
            setErrorMsg('Failed to update password.');
            return;
        }
        else {
            props.setUser(newResponse.data.user);
        }

        setEditShowPopup(false);
    }

    const ChangePassword = async () => {
        if(currentPassword === '' || newPassword === '' || confirmNewPassword === '') {
            setErrorMsg('Please fill in all required (*) fields.');
            return;
        }
        else if(newPassword !== confirmNewPassword) {
            setErrorMsg('New passwords do not match.');
            return;
        }

        const response = await axios.post("http://localhost:5000/users/compare-password", { userId: user.user_id, password: currentPassword});
        if(!response.data.status) {
            setErrorMsg('Current password is incorrect.');
            return;
        }

        const newResponse = await axios.post("http://localhost:5000/users/change-user-password", { userId: props.user.user_id, password: newPassword});
        if(newResponse.data.message) {
            setErrorMsg('Failed to update password.');
            return;
        }

        setPwChangeShowPopup(false);
    }
    
    const GetUserStatus = () => {
        if(user.access_level < 0) {
            return <div className={styles.account_status}>Account is suspended.</div>
        }
        else if(user.access_level == 0) {
            return <div className={styles.account_status}>Account is unverified.</div>
        }
        else if(user.access_level == 1) {
            return <div className={styles.account_status}>Account is verified and has full access.</div>
        }
        else return <div className={styles.account_status}>Account has administrator privileges.</div>
    }

    // Edit Account popup
    const editAccountPopup = (
        <Popup trigger={setEditShowPopup}>
            <h2>Edit Account</h2>
            <div className={styles.error_message}>{errorMsg}</div>
            <div className={styles.popup_section}>
                <label htmlFor="email" className={styles.required}>E-mail</label>
                <input type="email" id="email" defaultValue={user.email} onChange={(e) => { setEmail(e.target.value); }}/>
            </div>
            <div className={styles.popup_section}>
                <label htmlFor="phone">Phone Number</label>
                <input id="phone" defaultValue={user.phone_number} onChange={(e) => { setPhone(e.target.value); }}/>
            </div>
            <div className={styles.popup_section}>
                <label htmlFor="address">Address</label>
                <input id="address" defaultValue={user.address} onChange={(e) => { setAddress(e.target.value); }}/>
            </div>
            <div className={styles.button_group}>
                <button className={`${styles.button} ${styles.popup_button}`} onClick={SaveAccountInfo}>Save</button>
                <button className={`${styles.button} ${styles.popup_button}`} onClick={() => { setEditShowPopup(false); setPwChangeShowPopup(true); }}>Change Password</button>
            </div>
        </Popup>
    );

    // Change Password popup
    const changePasswordPopup = (
        <Popup trigger={setPwChangeShowPopup}>
            <h2>Change Password</h2>
            <div className={styles.error_message}>{errorMsg}</div>
            <div className={styles.popup_section}>
                <label htmlFor="currentPw" className={styles.required}>Current Password</label>
                <input type="email" id="currentPw" onChange={(e) => { setCurrentPassword(e.target.value); }}/>
            </div>
            <div className={styles.popup_section}>
                <label htmlFor="newPw" className={styles.required}>New Password</label>
                <input id="newPw" onChange={(e) => { setNewPassword(e.target.value); }}/>
            </div>
            <div className={styles.popup_section}>
                <label htmlFor="confirmNewPw" className={styles.required}>Confirm New Password</label>
                <input id="confirmNewPw" onChange={(e) => { setConfirmNewPassword(e.target.value); }}/>
            </div>
            <div className={styles.button_group}>
                <button className={`${styles.button} ${styles.popup_button}`} onClick={ChangePassword}>Save</button>
                <button className={`${styles.button} ${styles.popup_button}`} onClick={() => { setEditShowPopup(true); setPwChangeShowPopup(false); }}>Back</button>
            </div>
        </Popup>
    );

    return (
        <>
            {showEditPopup && editAccountPopup}
            {showPwChangePopup && changePasswordPopup}
            <Header user={props.user} setUser={props.setUser} />
            <main className={styles.main}>
                <Sidebar user={props.user} setUser={props.setUser} usePermissions={true} >
                    <NavLink to="/account">Settings</NavLink>
                    <NavLink to="/account/partnership">Partnership</NavLink>
                </Sidebar>
                <section className={styles.section}>
                    <h1>Account Settings</h1>
                    <p><strong>E-mail:</strong> {user.email}</p>
                    <p><strong>Phone:</strong> {!user.phone_number || user.phone_number == '' ? <span className={styles.not_set}>Not set.</span> : user.phone_number}</p>
                    <p><strong>Address:</strong> {!user.address || user.address == '' ? <span className={styles.not_set}>Not set.</span> : user.address}</p>                
                    <GetUserStatus />
                    {user.access_level > 0 && <button className={`${styles.button} ${styles.edit_button}`} onClick={() => { setEditShowPopup(true); }}>Edit Account Info</button>}
                </section>
            </main>
            <Footer />
        </>
    );
}