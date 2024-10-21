import React, { useEffect, useState } from 'react';
import { useNavigate, NavLink } from 'react-router-dom';
import axios from 'axios';

import Header from "../../../components/Header/Header";
import Footer from "../../../components/Footer/Footer";
import Sidebar from "../../../components/Sidebar/Sidebar";

import styles from "./AdminItemDashboard.module.css";
import Table from '../../../components/Table/Table';
import EditableCell from '../../../components/EditableCell/EditableCell';

export default function AdminItemDashboard(props) {

    let user = props.user;
    let navigate = useNavigate();
    
    const [items, setItems] = useState([]);

    const getItems = async () => {
        const response = await axios.get("http://localhost:5000/posts/get-items");
        if(!response.data.message) {
            setItems(response.data.items);
        }
    }

    useEffect(() => {
        getItems();
    }, []);

    const columnDef = [
        {
            accessorKey: 'item_id',
            header: 'ID',
        },
        {
            accessorKey: 'name',
            header: 'Name',
            cell: EditableCell,
        },
        {
            accessorKey: 'value',
            header: 'Value',
            cell: EditableCell,
        },
        {
            accessorKey: 'transfer_cost',
            header: 'Transfer Cost',
            cell: EditableCell,
        },
        {
            accessorKey: 'created_at',
            header: 'Created',
            cell: (props) => new Date(props.getValue()).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })
        },
    ];

    useEffect(() => {
        if(user.access_level <= 1) {
            navigate("/dashboard");
        }
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
                        <Table title="Item Management"  data={items} columns={columnDef} />
                    </div>
                </section>
            </main>
            <Footer />
        </>
    );
}