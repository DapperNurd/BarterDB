import React, { useEffect, useState } from 'react';
import { useNavigate, NavLink } from 'react-router-dom';
import axios from 'axios';

import Header from "../../components/Header/Header";
import Footer from "../../components/Footer/Footer";
import Popup from "../../components/Popup/Popup";
import Post from '../../components/Post/Post';

import styles from "./AdminDashboard.module.css";

export default function AdminDashboard(props) {

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
                <aside className={styles.aside}>
                    <NavLink to="/dashboard/admin">Users</NavLink>
                    <NavLink to="/dashboard/admin">Items</NavLink>
                    <NavLink to="/dashboard/admin">Transactions</NavLink>
                </aside>
                <section className={styles.section}>
                    <div className={styles.dash_header}>
                        <h1>Welcome to the admin panel, {props.user.email}!</h1>
                    </div>
                </section>
            </main>
            <Footer />
        </>
    );
}