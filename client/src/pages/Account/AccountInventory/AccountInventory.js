import React, { useEffect, useState } from 'react';
import { useNavigate, NavLink } from 'react-router-dom';
import axios from 'axios';

import Header from "../../../components/Header/Header";
import Footer from "../../../components/Footer/Footer";
import Sidebar from "../../../components/Sidebar/Sidebar";
import Table from '../../../components/Table/Table';
import EditableCell from '../../../components/EditableCell/EditableCell';
import Popup from '../../../components/Popup/Popup';

import styles from "./AccountInventory.module.css";

export default function Account(props) {

    let user = props.user;
    let navigate = useNavigate();
    
    const [allItems, setAllItems] = useState([]);
    const [userItems, setUserItems] = useState([]);

    const [workingRow, setWorkingRow] = useState({});

    const [showDeleteItemPopup, setShowDeleteItemPopup] = useState(false);
    const [showCreateItemPopup, setShowCreateItemPopup] = useState(false);

    const [itemToAdd, setItemToAdd] = useState('');
    const [itemAmountToAdd, setItemAmountToAdd] = useState(1);

    const [errorMsg, setErrorMsg] = useState('');

    useEffect(() => {
        if(user.access_level <= 0) {
            navigate("/account");
        } 
    }, []); // eslint-disable-line react-hooks/exhaustive-deps

    useEffect(() => {
        setErrorMsg("");
    }, [showCreateItemPopup, showDeleteItemPopup]);

    useEffect(() => {
        GetAllItems();
        GetUserItems();
    }, []); // eslint-disable-line react-hooks/exhaustive-deps

    const columnDef = [
        {
            accessorKey: 'name',
            header: 'Name',
        },
        {
            accessorKey: 'item_amount',
            header: 'Amount',
            cell: EditableCell,
        },
        {
            accessorKey: 'created_at',
            header: 'Changed',
            cell: (props) => new Date(props.getValue()).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })
        },
        {
            accessorKey: 'buttons',
            header: 'Utility',
            cell: (data) => {
                const row = data.row.original;
                return (
                    <nav>
                        <button onClick={() => {setWorkingRow(row); setShowDeleteItemPopup(true);}}>Remove</button>
                    </nav>
                );
            },
            size: 175
        }
    ];

    const GetAllItems = async () => {
        const response = await axios.get("http://localhost:5000/items/get-items");
        if(!response.data.message) {
            setAllItems(response.data.items);
            setItemToAdd(response.data.items[0]?.name);
        }
    }

    const GetUserItems = async () => {
        const response = await axios.post("http://localhost:5000/items/get-inventory", {
            userId: user.user_id
        });
        if(!response.data.message) {
            setUserItems(response.data.items);
        }
    }

    const AddItem = async () => {
        if(itemToAdd === '') {
            setErrorMsg("Item name cannot be empty.");
            return;
        }

        const itemObj = allItems.find(item => item.name.toLowerCase() === itemToAdd.toLowerCase());
        if(!itemObj) {
            setErrorMsg("Error finding item.");
            return;
        }

        // check if user has item
        const userItem = userItems.find(item => item.item_id === itemObj.item_id);
        if(userItem) {
            setErrorMsg("You already have this item.");
            return;
        }


        const response = await axios.post("http://localhost:5000/items/add-to-inventory", {
            userId: user.user_id,
            itemId: itemObj.item_id,
            amount: itemAmountToAdd,
        });

        if(!response.data.status) {
            setErrorMsg("Failed to add item.");
            return;
        }
        
        setShowCreateItemPopup(false);
        setErrorMsg('');
        GetUserItems();
    }

    const meta = {
        updateData: (row, column, value) => {
            UpdateInventory(value, row.original.item_id);
        }
    }

    const UpdateInventory = async (newValue, item_id) => {
        const response = await axios.post("http://localhost:5000/items/update-inventory", {
            userId: user.user_id,
            itemId: item_id,
            amount: newValue
        });

        if(!response.data.status) {
            setErrorMsg("Failed to update item.");
            return;
        }
    }

    const DeleteItem = async (item_id) => {
        const response = await axios.post("http://localhost:5000/items/delete-from-inventory", {
            userId: user.user_id,
            itemId: item_id
        });

        if(!response.data.status) {
            setErrorMsg("Failed to delete item.");
            return;
        }

        setShowDeleteItemPopup(false);
        setErrorMsg('');
        GetUserItems();
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

    const addItemPopup = (
        <Popup trigger={setShowCreateItemPopup}>
            <h2>Add Item</h2>
            <div className={styles.error_message}>{errorMsg}</div>
            <div className={styles.popup_section}>
                <div className={styles.create_item_popup_row}>
                    <label>Item</label>
                    <select name="requesting_item_list" id="requesting_item_list" defaultValue={'DEFAULT'} className={styles.popup_select} onChange={(e) => { setItemToAdd(e.target.value); }}>
                    {allItems.map((item, index) => (
                        <option key={index} value={item.name.toLowerCase()}>
                            {item.name}
                        </option>
                    ))}
                </select>
                </div>
                <div className={styles.create_item_popup_row}>
                    <label>Amount</label>
                    <input type="number" id="item_amount" name="item_amount" min="1" max="99" defaultValue={1} onChange={(e) => { setItemAmountToAdd(e.target.value); }}/>
                </div>
            </div>
            <div>
                <button className={styles.popup_button} onClick={() => { AddItem(); }}>Create</button>
            </div>
        </Popup>
    );

    return (
        <>
            {showDeleteItemPopup && deleteItemPopup}
            {showCreateItemPopup && addItemPopup}
            <Header user={props.user} setUser={props.setUser} />
            <main className={styles.main}>
                <Sidebar user={props.user} setUser={props.setUser} usePermissions={true} >
                    <NavLink to="/account">Settings</NavLink>
                    <NavLink to="/account/partnership">Partnership</NavLink>
                    <NavLink to="/account/inventory">Inventory</NavLink>
                </Sidebar>
                <section className={styles.section}>
                    <button className={styles.new_item_button} onClick={() => { setShowCreateItemPopup(true); }}>+ Add Item</button>
                    <div className={styles.dash_header}>
                        <Table title="Inventory" meta={meta} data={userItems} columns={columnDef} />
                    </div>
                </section>
            </main>
            <Footer />
        </>
    );
}