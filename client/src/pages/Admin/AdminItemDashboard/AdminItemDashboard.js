import React, { useEffect, useState } from 'react';
import { useNavigate, NavLink } from 'react-router-dom';
import axios from 'axios';

import Header from "../../../components/Header/Header";
import Footer from "../../../components/Footer/Footer";
import Sidebar from "../../../components/Sidebar/Sidebar";
import Popup from "../../../components/Popup/Popup";
import Post from '../../../components/Post/Post';

import styles from "./AdminItemDashboard.module.css";
import Table from '../../../components/Table/Table';
import EditableCell from '../../../components/EditableCell/EditableCell';

export default function AdminItemDashboard(props) {

    let user = props.user;
    let navigate = useNavigate();
    
    const [items, setItems] = useState([]);

    const [errorMsg, setErrorMsg] = useState('');

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
            size: 80,
        },
        {
            accessorKey: 'name',
            header: 'Name',
            size: 600,
            cell: EditableCell,
        },
        {
            accessorKey: 'value',
            header: 'Value',
            size: 150,
            cell: EditableCell,
        },
        {
            accessorKey: 'transfer_cost',
            header: 'Transfer Cost',
            size: 200,
            cell: EditableCell,
        },
        {
            accessorKey: 'created_at',
            header: 'Created',
            size: 400,
            cell: (props) => new Date(props.getValue()).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })
        },
        {
            accessorKey: 'test',
            header: 'Actions',
            size: 200,
            cell: (props) => {
                return (
                    <div style={{display: 'flex'}}>
                        <button onClick={() => {}}>Verify</button>
                        <button onClick={() => {}}>Delete</button>
                    </div>
                );
            }
        }
    ];

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
                        <Table title="Item Management"  data={items} columns={columnDef} />
                    </div>
                </section>
            </main>
            <Footer />
        </>
    );
}