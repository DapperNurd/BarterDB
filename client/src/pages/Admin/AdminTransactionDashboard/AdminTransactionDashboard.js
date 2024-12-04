import React, { useEffect, useState } from 'react';
import { useNavigate, NavLink } from 'react-router-dom';
import axios from 'axios';

import Header from "../../../components/Header/Header";
import Footer from "../../../components/Footer/Footer";
import Sidebar from "../../../components/Sidebar/Sidebar";

import styles from "./AdminTransactionDashboard.module.css";
import Table from '../../../components/Table/Table';
import Popup from '../../../components/Popup/Popup';

export default function AdminTransactionDashboard(props) {

    let user = props.user;
    let navigate = useNavigate();
    
    const [transactions, setTransactions] = useState([]);

    const columnDef = [
        {
            accessorKey: 'transaction_id',
            header: 'ID',
            size: 80,
        },
        {
            accessorKey: 'primary_post_id',
            header: 'Primary Post ID',
            size: 500,
        },
        {
            accessorKey: 'secondary_post_id',
            header: 'Secondary Post ID',
            size: 500,
        },
        {
            accessorKey: 'hash_code',
            header: 'Hash Code',
            size: 800,
        },
        {
            accessorKey: 'state',
            header: 'Status',
            cell: (props) => {
                switch (props.getValue()) {
                    case 0:
                        return "Bartering";
                    case 1:
                        return "Approving";
                    case 2:
                        return "Completed";
                    default:
                        return "Completed";
                }
            },
            size: 800,
        }
    ];

    const GetTransactions = async () => {
        const verifiedUsersResponse = await axios.post("http://localhost:5000/transactions/get-all-transactions", { userId: user.user_id });
        if(!verifiedUsersResponse.data.message) {
            setTransactions(verifiedUsersResponse.data.transactions);
        }
    }

    useEffect(() => {
        if(user.access_level <= 1) {
            navigate("/dashboard");
        }
        GetTransactions();
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
                        <Table title="All Transactions" data={transactions} columns={[...columnDef]} />
                    </div>
                </section>
            </main>
            <Footer />
        </>
    );
}