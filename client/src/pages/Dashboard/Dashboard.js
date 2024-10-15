import React, { useEffect, useState, useRef } from 'react';
import { NavLink } from 'react-router-dom';
import axios from 'axios';

import Header from "../../components/Header/NoLinkHeader";
import Footer from "../../components/Footer/Footer";
import PostContainer from "../../components/PostContainer/PostContainer";
import Popup from "../../components/Popup/Popup";

import styles from "./Dashboard.module.css";

export default function Dashboard(props) {

    let user = props.user;

    const offersDashboard = useRef();
    const postsDashboard = useRef();
    const historyDashboard = useRef();

    const [showPopup, setShowPopup] = useState(false);
    const [items, setItems] = useState([]);

    const [requestingItemName, setRequestingItemName] = useState("");
    const [requestingItemAmt, setRequestingItemAmt] = useState(1);
    const [offeringItemName, setOfferingItemName] = useState("");
    const [offeringItemAmt, setOfferingItemAmt] = useState(1);
    const [isNegotiable, setIsNegotiable] = useState(0);

    const [errorMsg, setErrorMsg] = useState('');

    const CreatePost = async () => {

        const requestingItem = items.find(item => item.name.toLowerCase() === requestingItemName.toLowerCase());
        const offeringItem = items.find(item => item.name.toLowerCase() === offeringItemName.toLowerCase());

        const partnerResponse = await axios.post("http://localhost:5000/partnerships/get-partnership", { userId: user.user_id });
        if(partnerResponse.data.message) {
            setErrorMsg('Error: Unable to find partner.');
            return false;
        }

        const createPostResponse = await axios.post("http://localhost:5000/posts/create-post", { 
            userId: user.user_id,
            postingPartnershipId: partnerResponse.data.partner.partnership_id,
            requestingItemId: requestingItem.item_id,
            requestingItemAmt: requestingItemAmt,
            offeringItemId: offeringItem.item_id,
            offeringItemAmt: offeringItemAmt,
            isNegotiable: isNegotiable
        });
        if(!createPostResponse.data.status) {
            setErrorMsg('Error: Failed to create post.');
            return false;
        }

        // Reset Values (TODO: MAKE THIS A FUNCTION)
        setRequestingItemName(items[0].name);
        setOfferingItemName(items[0].name);
        setRequestingItemAmt(1);
        setOfferingItemAmt(1);
        setIsNegotiable(0);

        setShowPopup(false);
        RefreshAllDashboards();
        return true;
    };

    const RefreshAllDashboards = () => {
        offersDashboard.current.populatePosts();
        postsDashboard.current.populatePosts();
        historyDashboard.current.populatePosts();
    };

    useEffect(() => {
        const getItems = async () => {
            const response = await axios.get("http://localhost:5000/posts/get-items");
            if(!response.data.message) {
                setItems(response.data.items);
            }
        }
        getItems();
    }, []);

    const noPermissions = (
        <div className={styles.no_permissions}>
            <div><h3>Your account is unverified.</h3>Features are disabled until your account has been reviewed.</div>
            <div className={styles.aside_item}>Create New Post</div>
        </div>
    );

    // Create New Post popup
    const popup = (
        <Popup trigger={setShowPopup}>
            <h2>Create New Post</h2>
            <div className={styles.error_message}>{errorMsg}</div>
            <div className={styles.popup_section}>
                <label htmlFor="offering_item_list">Item to offer:</label>
                <select name="offering_item_list" id="offering_item_list" className={styles.popup_select} onChange={(e) => { setOfferingItemName(e.target.value); }}>
                    {items.map((item, index) => (
                        <option key={index} value={item.name.toLowerCase()}>
                            {item.name}
                        </option>
                    ))}
                </select>
                <input type="number" id="offering_amount" name="quantity" min="1" max="99" defaultValue="1" onChange={(e) => { setOfferingItemAmt(e.target.value); }}/>
            </div>
            <div className={styles.popup_section}>
                <label htmlFor="requesting_item_list">Item to request:</label>
                <select name="requesting_item_list" id="requesting_item_list" className={styles.popup_select} onChange={(e) => { setRequestingItemName(e.target.value); }}>
                    {items.map((item, index) => (
                        <option key={index} value={item.name.toLowerCase()}>
                            {item.name}
                        </option>
                    ))}
                </select>
                <input type="number" id="requesting_amount" name="quantity" min="1" max="99" defaultValue="1" onChange={(e) => { setRequestingItemAmt(e.target.value); }}/>
            </div>
            <div className={styles.popup_section}>
                <button className={styles.create_button} onClick={CreatePost}>Create</button>
                <div className={styles.checkbox}>
                    <label htmlFor="negotiate">Will Negotiate</label>
                    <input type="checkbox" id="negotiate" name="negotiate" onChange={(e) => { setIsNegotiable(e.target.checked ? 1 : 0); }}/>
                </div>
            </div>
        </Popup>
    );

    return (
        <>
            <Header user={props.user} setUser={props.setUser} />
            {showPopup && popup}
            <main className={styles.main}>
                {user.access_level > 0 && <div className={styles.create_post_button}><button onClick={() => { setShowPopup(true); setRequestingItemName(items[0].name); setOfferingItemName(items[0].name); }}>Create New Post</button></div>}
                {user.access_level <= 0 && noPermissions}
                <div className={styles.dash_header}>
                    <h1>Welcome to your dashboard, {props.user.email}!</h1>
                </div>
                <div className={`${styles.dashboard} ${styles.view_posts}`}>
                    <h1>Your Offers</h1>
                    <PostContainer ref={offersDashboard} refresh={RefreshAllDashboards} user={props.user} setUser={props.setUser} />
                </div>
                <div className={`${styles.dashboard} ${styles.my_posts}`}>
                    <h1>My Posts</h1>
                    <PostContainer ref={postsDashboard} refresh={RefreshAllDashboards} user={props.user} setUser={props.setUser} />
                </div>
                <div className={`${styles.dashboard} ${styles.all_posts}`}>
                    <h1>Post History</h1>
                    <PostContainer ref={historyDashboard} refresh={RefreshAllDashboards} user={props.user} setUser={props.setUser} />
                </div>
            </main>
            <Footer />
        </>
    );
}