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

    const [showDeleteItemPopup, setShowDeleteItemPopup] = useState(false);
    const [showCreateItemPopup, setShowCreateItemPopup] = useState(false);

    const [newItemName, setNewItemName] = useState('');
    const [newItemValue, setNewItemValue] = useState(1);
    const [newItemTransferCost, setNewItemTransferCost] = useState(1);

    const [errorMsg, setErrorMsg] = useState('');

    useEffect(() => {
        if(user.access_level <= 1) {
            navigate("/dashboard");
        }
    }, []); // eslint-disable-line react-hooks/exhaustive-deps


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
                        <button onClick={() => {setWorkingRow(row); setShowDeleteItemPopup(true);}}>Delete</button>
                    </nav>
                );
            },
            size: 175
        }
    ];

    const getItems = async () => {
        const response = await axios.get("http://localhost:5000/items/get-items");
        if(!response.data.message) {
            setItems(response.data.items);
        }
    }

    const CreateItem = async () => {
        if(newItemName === '') {
            setErrorMsg("Item name cannot be empty.");
            return;
        }

        const response = await axios.post("http://localhost:5000/items/create-item", {
            userId: user.user_id,
            name: newItemName,
            value: newItemValue,
            transfer_cost: newItemTransferCost
        });

        if(!response.data.status) {
            setErrorMsg("Failed to create item.");
            return;
        }
        
        setShowCreateItemPopup(false);
        setErrorMsg('');
        getItems();
    }

    const meta = {
        updateData: (row, column, value) => {
            UpdateItem(column.id, value, row.original.item_id);
        }
    }

    const UpdateItem = async (column, newValue, item_id) => {
        const response = await axios.post("http://localhost:5000/items/update-item", {
            userId: user.user_id,
            column: column,
            newValue: newValue,
            itemId: item_id
        });

        if(!response.data.status) {
            setErrorMsg("Failed to update item.");
            return;
        }
    }

    const DeleteItem = async (item_id) => {
        const response = await axios.post("http://localhost:5000/items/delete-item", {
            userId: user.user_id,
            itemId: item_id
        });

        if(!response.data.status) {
            setErrorMsg("Failed to delete item.");
            return;
        }

        setShowDeleteItemPopup(false);
        setErrorMsg('');
        getItems();
    }

    const deleteItemPopup = (
        <Popup trigger={setShowDeleteItemPopup}>
            <div className={styles.popup}>
                <h2>Delete Item</h2>
                <div className={styles.error_message}>{errorMsg}</div>
                <p>Are you sure you want to delete item <strong>{workingRow.name}</strong>? This cannot be undone, and <strong>will delete all posts and transactions using this item!</strong></p>
                <div className={styles.popup_button_group}>
                    <button className={`${styles.popup_button} ${styles.negative_button}`} onClick={() => { DeleteItem(workingRow.item_id); }}>Delete</button>
                </div>
            </div>
        </Popup>
    );

    const createItemPopup = (
        <Popup trigger={setShowCreateItemPopup}>
            <h2>Create Item</h2>
            <div className={styles.error_message}>{errorMsg}</div>
            <div className={styles.popup_section}>
                <div className={styles.create_item_popup_row}>
                    <label>Item Name</label>
                    <input type="text" id="offering_amount_edit" name="item_name" onChange={(e) => { setNewItemName(e.target.value); }}/>
                </div>
                <div className={styles.create_item_popup_row}>
                    <label>Value</label>
                    <input type="number" id="offering_amount_edit" name="item_value" min="1" max="99" defaultValue={1} onChange={(e) => { setNewItemValue(e.target.value); }}/>
                </div>
                <div className={styles.create_item_popup_row}>
                    <label>Transfer Cost</label>
                    <input type="number" id="offering_amount_edit" name="item_transfer_cost" min="1" max="99" defaultValue={1} onChange={(e) => { setNewItemTransferCost(e.target.value); }}/>
                </div>
            </div>
            <div>
                <button className={styles.popup_button} onClick={() => { CreateItem(); }}>Create</button>
            </div>
        </Popup>
    );

    return (
        <>
            <Header showAdminLink={false} user={props.user} setUser={props.setUser} />
            {showDeleteItemPopup && deleteItemPopup}
            {showCreateItemPopup && createItemPopup}
            <main className={styles.main}>
                <Sidebar user={props.user} setUser={props.setUser}>
                    <NavLink to="/dashboard/admin">Users</NavLink>
                    <NavLink to="/dashboard/admin/items">Items</NavLink>
                    {/* <NavLink to="/dashboard/admin/transactions">Transactions</NavLink> */}
                </Sidebar>
                <section className={styles.section}>
                    <button className={styles.new_item_button} onClick={() => { setShowCreateItemPopup(true); }}>+ Add New Item</button>
                    <div className={styles.dash_header}>
                        <Table title="Item Management" meta={meta} data={items} columns={columnDef} />
                    </div>
                </section>
            </main>
            <Footer />
        </>
    );
}