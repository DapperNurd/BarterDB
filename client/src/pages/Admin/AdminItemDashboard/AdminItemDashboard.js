import React, { useEffect, useState } from 'react';
import { useNavigate, NavLink } from 'react-router-dom';
import axios from 'axios';

import Header from "../../../components/Header/Header";
import Footer from "../../../components/Footer/Footer";
import Sidebar from "../../../components/Sidebar/Sidebar";

import styles from "./AdminItemDashboard.module.css";
import Table from '../../../components/Table/Table';
import EditableCell from '../../../components/EditableCell/EditableCell';
import Popup from '../../../components/Popup/Popup';

export default function AdminItemDashboard(props) {

    let user = props.user;
    let navigate = useNavigate();
    
    const [items, setItems] = useState([]);

    const [workingRow, setWorkingRow] = useState({});

    const [showDeleteUserPopup, setShowDeleteUserPopup] = useState(false);

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
        {
            accessorKey: 'buttons',
            header: 'Utility',
            cell: (data) => {
                const row = data.row.original;
                return (
                    <nav>
                        <button onClick={() => {setWorkingRow(row); setShowDeleteUserPopup(true);}}>Delete</button>
                    </nav>
                );
            },
            size: 175
        }
    ];

    const deletePopup = (
        <Popup trigger={setShowDeleteUserPopup}>
            <div className={styles.popup}>
                <h2>Delete Item</h2>
                <div className={styles.error_message}>{errorMsg}</div>
                <p>Are you sure you want to delete item <strong>{workingRow.name}</strong>? This cannot be undone.</p>
                <div className={styles.popup_button_group}>
                    <button className={`${styles.popup_button} ${styles.negative_button}`} onClick={() => {console.log("delete user " + workingRow.name)}}>Delete</button>
                </div>
            </div>
        </Popup>
    );

    useEffect(() => {
        if(user.access_level <= 1) {
            navigate("/dashboard");
        }
    }, []); // eslint-disable-line react-hooks/exhaustive-deps

    return (
        <>
            <Header showAdminLink={false} user={props.user} setUser={props.setUser} />
            {showDeleteUserPopup && deletePopup}
            <main className={styles.main}>
                <Sidebar user={props.user} setUser={props.setUser}>
                    <NavLink to="/dashboard/admin">Users</NavLink>
                    <NavLink to="/dashboard/admin/items">Items</NavLink>
                    <NavLink to="/dashboard/admin/transactions">Transactions</NavLink>
                </Sidebar>
                <section className={styles.section}>
                    <button className={styles.new_item_button}>+ Add New Item</button>
                    <div className={styles.dash_header}>
                        <Table title="Item Management"  data={items} columns={columnDef} />
                    </div>
                </section>
            </main>
            <Footer />
        </>
    );
}