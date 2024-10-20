import React, { useEffect, useState } from 'react';
import { useNavigate, NavLink } from 'react-router-dom';
import axios from 'axios';

import Header from "../../../components/Header/Header";
import Footer from "../../../components/Footer/Footer";
import Sidebar from "../../../components/Sidebar/Sidebar";
import Popup from "../../../components/Popup/Popup";
import Post from '../../../components/Post/Post';

import styles from "./AdminTransactionDashboard.module.css";

export default function AdminTransactionDashboard(props) {

    let user = props.user;
    let navigate = useNavigate();

    const [errorMsg, setErrorMsg] = useState('');

    useEffect(() => {
        if(user.access_level <= 1) {
            navigate("/dashboard");
        }
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
                        <h1>Transaction Management</h1>
                    </div>
                </section>
            </main>
            <Footer />
        </>
    );
}