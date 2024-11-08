import React, { useEffect, useState } from 'react';
import { useNavigate, NavLink } from 'react-router-dom';
import axios from 'axios';

import Header from "../../../components/Header/Header";
import Footer from "../../../components/Footer/Footer";
import Sidebar from "../../../components/Sidebar/Sidebar";

import styles from "./AdminUserDashboard.module.css";
import Table from '../../../components/Table/Table';
import Popup from '../../../components/Popup/Popup';

export default function AdminUserDashboard(props) {

    let user = props.user;
    let navigate = useNavigate();
    
    const [verifiedUsers, setVerifiedUsers] = useState([]);
    const [unverifiedUsers, setUnverifiedUsers] = useState([]);

    const [workingRow, setWorkingRow] = useState({});

    const [showVerifyUserPopup, setShowVerifyUserPopup] = useState(false);
    const [showSuspendUserPopup, setShowSuspendUserPopup] = useState(false);
    const [showUnsuspendUserPopup, setShowUnsuspendUserPopup] = useState(false);
    const [showDeleteUserPopup, setShowDeleteUserPopup] = useState(false);

    const [errorMsg, setErrorMsg] = useState('');

    const columnDef = [
        {
            accessorKey: 'user_id',
            header: 'ID',
            size: 80,
        },
        {
            accessorKey: 'email',
            header: 'E-mail',
            size: 800,
        },
        {
            accessorKey: 'access_level',
            header: 'Access Level',
            cell: (props) => {
                switch (props.getValue()) {
                    case 0:
                        return "Unverified";
                    case 1:
                        return "Verified";
                    case 2:
                        return "Administrator";
                    default:
                        return "Suspended";
                }
            },
            size: 150,
        },
        {
            accessorKey: 'created_at',
            header: 'Created',
            size: 500,
            cell: (props) => new Date(props.getValue()).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' }),
        }
    ];

    const newUsersButtons = {
        accessorKey: 'buttons',
        header: 'Utility',
        cell: (data) => {
            const row = data.row.original;
            return (
                <nav>
                    <button onClick={() => {setWorkingRow(row); setShowVerifyUserPopup(true);}}>Verify</button>
                    <button onClick={() => {setWorkingRow(row); setShowDeleteUserPopup(true);}}>Delete</button>
                </nav>
            );
        },
        size: 300
    }

    const verifiedUsersButtons = {
        accessorKey: 'buttons',
        header: 'Utility',
        cell: (data) => {
            const row = data.row.original;
            return (
                <nav>
                    {row.access_level < 0
                        ? <button onClick={() => {setWorkingRow(row); setShowUnsuspendUserPopup(true);}}>Unsuspend</button> 
                        : <button onClick={() => {setWorkingRow(row); setShowSuspendUserPopup(true);}}>Suspend</button>
                    }
                    <button onClick={() => {setWorkingRow(row); setShowDeleteUserPopup(true);}}>Delete</button>
                </nav>
            );
        },
        size: 300
    }

    const GetUsers = async () => {
        const verifiedUsersResponse = await axios.post("http://localhost:5000/users/get-all-verified-users", { userId: user.user_id });
        if(!verifiedUsersResponse.data.message) {
            setVerifiedUsers(verifiedUsersResponse.data.users);
        }

        const unverifiedUsersResponse = await axios.post("http://localhost:5000/users/get-all-unverified-users", { userId: user.user_id });
        if(unverifiedUsersResponse.data.users) {
            setUnverifiedUsers(unverifiedUsersResponse.data.users);
        }
    }

    const SetAccessLevel = async (targetId, newLevel) => {
        if(targetId === user.user_id) {
            setErrorMsg("You cannot change your own access level.");
            return;
        }

        const response = await axios.post("http://localhost:5000/users/set-access-level", { userId: user.user_id, targetUserId: targetId, level: newLevel });
        if(!response.data.status) {
            setErrorMsg("Error changing access level of user.");
            return;
        }
        
        setWorkingRow({});
        CloseAllPopups();
        GetUsers();
    }

    const DeleteUser = async (targetId) => {
        if(targetId === user.user_id) {
            setErrorMsg("You cannot delete your own account.");
            return;
        }

        const response = await axios.post("http://localhost:5000/users/delete-user", { userId: user.user_id, targetUserId: targetId });
        if(!response.data.status) {
            setErrorMsg("Error deleting user.");
            return;
        }

        setWorkingRow({});
        CloseAllPopups();
        GetUsers();
    }

    const CloseAllPopups = () => {
        setShowVerifyUserPopup(false);
        setShowSuspendUserPopup(false);
        setShowUnsuspendUserPopup(false);
        setShowDeleteUserPopup(false);
    }

    useEffect(() => {
        if(user.access_level <= 1) {
            navigate("/dashboard");
        }
        GetUsers();
    }, []); // eslint-disable-line react-hooks/exhaustive-deps

    useEffect(() => {
        setErrorMsg('');    
    }, [showVerifyUserPopup, showSuspendUserPopup, showUnsuspendUserPopup, showDeleteUserPopup]);

    const verifyPopup = (
        <Popup trigger={setShowVerifyUserPopup}>
            <div className={styles.popup}>
                <h2>Verify User</h2>
                <div className={styles.error_message}>{errorMsg}</div>
                <p>Are you sure you want to verify <strong>{workingRow.email}</strong>?</p>
                <div className={styles.popup_button_group}>
                    <button className={`${styles.popup_button} ${styles.positive_button}`} onClick={() => {SetAccessLevel(workingRow.user_id, 1)}}>Verify</button>
                </div>
            </div>
        </Popup>
    );

    const suspendPopup = (
        <Popup trigger={setShowSuspendUserPopup}>
            <div className={styles.popup}>
                <h2>Suspend User</h2>
                <div className={styles.error_message}>{errorMsg}</div>
                <p>Are you sure you want to suspend <strong>{workingRow.email}</strong>?</p>
                <div className={styles.popup_button_group}>
                    <button className={`${styles.popup_button} ${styles.positive_button}`} onClick={() => {SetAccessLevel(workingRow.user_id, -1)}}>Verify</button>
                </div>
            </div>
        </Popup>
    );

    const unsuspendPopup = (
        <Popup trigger={setShowUnsuspendUserPopup}>
            <div className={styles.popup}>
                <h2>Unsuspend User</h2>
                <div className={styles.error_message}>{errorMsg}</div>
                <p>Are you sure you want to unsuspend <strong>{workingRow.email}</strong>?</p>
                <div className={styles.popup_button_group}>
                    <button className={`${styles.popup_button} ${styles.positive_button}`} onClick={() => {SetAccessLevel(workingRow.user_id, 1)}}>Verify</button>
                </div>
            </div>
        </Popup>
    );

    const deletePopup = (
        <Popup trigger={setShowDeleteUserPopup}>
            <div className={styles.popup}>
                <h2>Delete User</h2>
                <div className={styles.error_message}>{errorMsg}</div>
                <p>Are you sure you want to delete user <strong>{workingRow.email}</strong>? This cannot be undone.</p>
                <div className={styles.popup_button_group}>
                    <button className={`${styles.popup_button} ${styles.negative_button}`} onClick={() => {DeleteUser(workingRow.user_id)}}>Delete</button>
                </div>
            </div>
        </Popup>
    );

    return (
        <>
            <Header showAdminLink={false} user={props.user} setUser={props.setUser} />
            {showVerifyUserPopup && verifyPopup}
            {showSuspendUserPopup && suspendPopup}
            {showUnsuspendUserPopup && unsuspendPopup}
            {showDeleteUserPopup && deletePopup}
            <main className={styles.main}>
                <Sidebar user={props.user} setUser={props.setUser}>
                    <NavLink to="/dashboard/admin">Users</NavLink>
                    <NavLink to="/dashboard/admin/items">Items</NavLink>
                    <NavLink to="/dashboard/admin/transactions">Transactions</NavLink>
                </Sidebar>
                <section className={styles.section}>
                    <div className={styles.dash_header}>
                        {unverifiedUsers.length > 0 && <Table showButtons={false} title="New Users" data={unverifiedUsers} columns={[...columnDef, newUsersButtons]} /> }
                        <Table title="Verified Users" data={verifiedUsers} columns={[...columnDef, verifiedUsersButtons]} />
                    </div>
                </section>
            </main>
            <Footer />
        </>
    );
}