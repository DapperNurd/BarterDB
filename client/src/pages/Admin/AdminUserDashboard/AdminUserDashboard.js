import React, { useEffect, useState } from 'react';
import { useNavigate, NavLink } from 'react-router-dom';
import axios from 'axios';

import Header from "../../../components/Header/Header";
import Footer from "../../../components/Footer/Footer";
import Sidebar from "../../../components/Sidebar/Sidebar";

import styles from "./AdminUserDashboard.module.css";
import Table from '../../../components/Table/Table';
import EditableCell from '../../../components/EditableCell/EditableCell';

export default function AdminUserDashboard(props) {

    let user = props.user;
    let navigate = useNavigate();
    
    const [verifiedUsers, setVerifiedUsers] = useState([]);
    const [unverifiedUsers, setUnverifiedUsers] = useState([]);

    const columnDef = [
        {
            accessorKey: 'user_id',
            header: 'ID',
            size: 80,
        },
        {
            accessorKey: 'email',
            header: 'E-mail',
            cell: EditableCell,
            size: 1200,
        },
        {
            accessorKey: 'access_level',
            header: 'Access Level',
            cell: EditableCell,
            size: 250,
        },
        {
            accessorKey: 'created_at',
            header: 'Created',
            cell: (props) => new Date(props.getValue()).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' }),
        },
    ];

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

    useEffect(() => {
        if(user.access_level <= 1) {
            navigate("/dashboard");
        }
        GetUsers();
    }, []); // eslint-disable-line react-hooks/exhaustive-deps

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
                                <Table showButtons={false} title="New Users" data={unverifiedUsers} columns={columnDef} />
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