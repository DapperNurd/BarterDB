import React, { useEffect, useState } from 'react';
import { useNavigate, NavLink } from 'react-router-dom';
import axios from 'axios';

import Header from "../../../components/Header/Header";
import Footer from "../../../components/Footer/Footer";
import Sidebar from "../../../components/Sidebar/Sidebar";
import Popup from "../../../components/Popup/Popup";
import Post from '../../../components/Post/Post';

import styles from "./AdminUserDashboard.module.css";
import Table from '../../../components/Table/Table';
import EditableCell from '../../../components/EditableCell/EditableCell';

export default function AdminUserDashboard(props) {

    let user = props.user;
    let navigate = useNavigate();
    
    const [verifiedUsers, setVerifiedUsers] = useState([]);
    const [unverifiedUsers, setUnverifiedUsers] = useState([]);
    const [errorMsg, setErrorMsg] = useState('');

    const columnDef = [
        {
            accessorKey: 'user_id',
            header: 'ID',
        },
        {
            accessorKey: 'email',
            header: 'E-mail',
            cell: EditableCell,
        },
        {
            accessorKey: 'access_level',
            header: 'Access Level',
            cell: EditableCell,
        },
        {
            accessorKey: 'created_at',
            header: 'Created',
            cell: (props) => new Date(props.getValue()).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' }),
        },
        {
            accessorKey: 'test',
            header: 'Actions',
            cell: (props) => {
                return (
                    <div style={{display: 'flex'}}>
                        <button onClick={() => {}}>Verify</button>
                        <button onClick={() => {}}>Delete</button>
                    </div>
                );
            },
        }
    ];

    const GetUsers = async () => {
        const verifiedUsersResponse = await axios.post("http://localhost:5000/users/get-all-verified-users", { userId: user.user_id });
        if(!verifiedUsersResponse.data.message) {
            setVerifiedUsers(verifiedUsersResponse.data.users);
        }

        const unverifiedUsersResponse = await axios.post("http://localhost:5000/users/get-all-unverified-users", { userId: user.user_id });
        if(!unverifiedUsersResponse.data.message) {
            setUnverifiedUsers(unverifiedUsersResponse.data.users);
        }
    }

    useEffect(() => {
        if(user.access_level <= 1) {
            navigate("/dashboard");
        }
        GetUsers();
    }, []);

    return (
        <>
            <Header showAdminLink={false} user={props.user} setUser={props.setUser} />
            <main className={styles.main}>
                <Sidebar user={props.user} setUser={props.setUser}>
                    <NavLink to="/dashboard/admin">Users</NavLink>
                    <NavLink to="/dashboard/admin/items">Items</NavLink>
                    <NavLink to="/dashboard/admin/transactions">Transactions</NavLink>
                </Sidebar>
                <section className={styles.section}>
                    <div className={styles.dash_header}>
                        {unverifiedUsers.length > 0 && 
                            <>
                                <Table title="New Users" data={unverifiedUsers} columns={columnDef} />
                            </>
                        }
                        <Table title="Verified Users" data={verifiedUsers} columns={columnDef} />
                    </div>
                </section>
            </main>
            <Footer />
        </>
    );
}