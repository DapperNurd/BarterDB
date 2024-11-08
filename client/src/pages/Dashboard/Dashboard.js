import React, { useEffect, useState } from 'react';
import { NavLink } from 'react-router-dom';
import axios from 'axios';

import Header from "../../components/Header/Header";
import Footer from "../../components/Footer/Footer";
import Popup from "../../components/Popup/Popup";
import Post from '../../components/Post/Post';

import styles from "./Dashboard.module.css";

export default function Dashboard(props) {

    let user = props.user;

    const [showCreatePostPopup, setShowCreatePostPopup] = useState(false);
    const [showViewPostPopup, setShowViewPostPopup] = useState(false);
    const [showEditPostPopup, setShowEditPostPopup] = useState(false);

    const [items, setItems] = useState([]);
    const [hasPartner, setHasPartner] = useState(false);

    const [viewingPost, setViewingPost] = useState({});

    const [viewPosts, setViewPosts] = useState([]);
    const [myPosts, setMyPosts] = useState([]);
    const [allPosts, setAllPosts] = useState([]);

    const [requestingItemName, setRequestingItemName] = useState("");
    const [requestingItemAmt, setRequestingItemAmt] = useState(1);
    const [offeringItemName, setOfferingItemName] = useState("");
    const [offeringItemAmt, setOfferingItemAmt] = useState(1);
    const [isNegotiable, setIsNegotiable] = useState(0);

    const [errorMsg, setErrorMsg] = useState('');

    const SetPostObject = (data) => {
        setRequestingItemName(data.requesting);
        setOfferingItemName(data.offering);
        setRequestingItemAmt(data.requestingAmount);
        setOfferingItemAmt(data.offeringAmount);
        setIsNegotiable(data.isNegotiable);
    }

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

        setShowCreatePostPopup(false);
        RefreshAllDashboards();
        return true;
    };

    const UpdatePost = async () => {

        const requestingItem = items.find(item => item.name.toLowerCase() === requestingItemName.toLowerCase());
        const offeringItem = items.find(item => item.name.toLowerCase() === offeringItemName.toLowerCase());

        const createPostResponse = await axios.post("http://localhost:5000/posts/update-post", { 
            userId: user.user_id,
            // postingPartnershipId: partnerResponse.data.partner.partnership_id,
            postId: viewingPost.post_id,
            requestingItemId: requestingItem.item_id,
            requestingItemAmt: requestingItemAmt,
            offeringItemId: offeringItem.item_id,
            offeringItemAmt: offeringItemAmt,
            isNegotiable: isNegotiable
        });
        if(!createPostResponse.data.status) {
            setErrorMsg('Error: Failed to update post.');
            return false;
        }

        setViewingPost([]);

        setShowEditPostPopup(false);
        RefreshAllDashboards();
        return true;
    };

    const DeletePost = async (post_id) => {
        const response = await axios.post("http://localhost:5000/posts/delete-post", { userId: props.user.user_id, postId: post_id });
        if(!response.data.status) {
            setErrorMsg('Error: Failed to delete post.');
            return;
        }

        setShowViewPostPopup(false);
        setViewingPost([]);
        RefreshAllDashboards();
    };

    const RefreshAllDashboards = () => {
        populatePosts();
    };

    // Function to refresh the posts
    const populatePosts = async () => {
        // View posts
        const viewPostsResponse = await axios.post("http://localhost:5000/posts/get-match-posts", { userId: props.user.user_id });
        setViewPosts(viewPostsResponse.data.message ? [] : viewPostsResponse.data.posts);
        // My posts
        const response = await axios.post("http://localhost:5000/posts/get-posts", { userId: props.user.user_id });
        setMyPosts(response.data.message ? [] : response.data.posts);

        // All posts
    };

    const getItems = async () => {
        const response = await axios.get("http://localhost:5000/posts/get-items");
        if(!response.data.message) {
            setItems(response.data.items);
        }
    }

    const getPartnership = async () => {
        const partnerResponse = await axios.post("http://localhost:5000/partnerships/get-partnership", { userId: user.user_id });
        if(!partnerResponse.data.message) {
            setHasPartner(true);
        }
    }

    useEffect(() => {
        populatePosts();
        getPartnership();
        getItems();
    }, []);

    // Create New Post popup
    const createPostPopup = (
        <Popup trigger={setShowCreatePostPopup}>
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

    const viewPostPopup = (
        <Popup trigger={setShowViewPostPopup}>
            <div className={styles.post_popup}>
                <h2>Post Details</h2>
                <div className={styles.error_message}>{errorMsg}</div>
                <p>Offering Item: <span>{viewingPost.offering}</span> {viewingPost.offeringAmount > 1 ? "x" + viewingPost.offeringAmount : ""}</p>
                <p>Requesting Item: <span>{viewingPost.requesting}</span> {viewingPost.requestingAmount > 1 ? "x" + viewingPost.requestingAmount : ""}</p>
                {viewingPost.isNegotiable > 0 && <p>Willing to negotiate.</p>}
                <p className={styles.created}>Created at: <time>{new Date(viewingPost.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</time></p>
                {viewingPost.createdAt != viewingPost.updatedAt && <p className={styles.created}>Updated at: <time>{new Date(viewingPost.updatedAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</time></p>}
                <div className={styles.button_group}>
                    <button className={`${styles.button} ${styles.edit_button}`} onClick={() => {SetPostObject(viewingPost); setShowViewPostPopup(false); setShowEditPostPopup(true); }}>Edit Post</button>
                    <button className={`${styles.button} ${styles.delete_button}`} onClick={() => { DeletePost(viewingPost.post_id) }}>Delete Post</button>
                </div>
            </div>
        </Popup>
    );

    const editPostPopup = (
        <Popup trigger={setShowEditPostPopup}>
            <h2>Edit Post</h2>
            <div className={styles.error_message}>{errorMsg}</div>
            <div className={styles.popup_section}>
                <label htmlFor="offering_item_list_edit">Item to offer:</label>
                <select name="offering_item_list_edit" defaultValue={viewingPost.offering} id="offering_item_list_edit" className={styles.popup_select} onChange={(e) => { setOfferingItemName(e.target.value); }}>
                    {items.map((item, index) => (
                        <option key={index} value={item.name}>
                            {item.name}
                        </option>
                    ))}
                </select>
                <input type="number" id="offering_amount_edit" name="quantity" min="1" max="99" defaultValue={viewingPost.offeringAmount} onChange={(e) => { setOfferingItemAmt(e.target.value); }}/>
            </div>
            <div className={styles.popup_section}>
                <label htmlFor="requesting_item_list_edit">Item to request:</label>
                <select name="requesting_item_list_edit" defaultValue={viewingPost.requesting} id="requesting_item_list_edit" className={styles.popup_select} onChange={(e) => { setRequestingItemName(e.target.value); }}>
                    {items.map((item, index) => (
                        <option key={index} value={item.name}>
                            {item.name}
                        </option>
                    ))}
                </select>
                <input type="number" id="requesting_amount_edit" name="quantity" min="1" max="99" defaultValue={viewingPost.requestingAmount} onChange={(e) => { setRequestingItemAmt(e.target.value); }}/>
            </div>
            <div className={styles.popup_section}>
                <button className={styles.create_button} onClick={UpdatePost}>Save</button>
                <div className={styles.checkbox}>
                    <label htmlFor="negotiate_edit">Will Negotiate</label>
                    <input type="checkbox" defaultChecked={viewingPost.isNegotiable > 0} id="negotiate_edit" name="negotiate_edit" onChange={(e) => { setIsNegotiable(e.target.checked ? 1 : 0); }}/>
                </div>
            </div>
        </Popup>
    );

    const headerButton = () => {
        if(user.access_level <= 0) {
            return  <div className={`${styles.feature_block} ${styles.no_permissions}`}>
                        <div><h3>Your account is unverified.</h3>Features are disabled until your account has been reviewed.</div>
                        <div className={styles.inactive_button_group}>
                            <div className={styles.inactive_button}>Create New Post</div>
                        </div>
                    </div>;
        }
        else if(!hasPartner) {
            return  <div className={`${styles.feature_block} ${styles.no_partnership}`}>
                        <div><h3>No partner found.</h3>Add a partner to begin creating posts and making trades.</div>
                        <div className={styles.inactive_button_group}>
                            <div className={styles.inactive_button}>Create New Post</div>
                        </div>
                    </div>
        }
        else {
            return  <div className={styles.create_post_button}>
                        <button onClick={() => { setShowCreatePostPopup(true); setRequestingItemName(items[0].name); setOfferingItemName(items[0].name); }}>Create New Post</button>
                    </div>
        }
    };

    const viewPostsContainer = (
        <div className={styles.post_container}>
            {viewPosts.length <= 0 ? <div className={styles.no_posts}>No posts to show</div> : null}
            {viewPosts.map(function(post, i) {
                return <Post key={i} id={post.post_id} data={post} setData={setViewingPost} setShowPopup={setShowViewPostPopup} />;
            })}
        </div>
    );

    const myPostsContainer = (
        <div className={styles.post_container}>
            {myPosts.length <= 0 ? <div className={styles.no_posts}>No posts to show</div> : null}
            {myPosts.map(function(post, i) {
                return <Post key={i} id={post.post_id} data={post} setData={setViewingPost} setShowPopup={setShowViewPostPopup} />;
            })}
        </div>
    );

    const allPostsContainer = (
        <div className={styles.post_container}>
            {allPosts.length <= 0 ? <div className={styles.no_posts}>No posts to show</div> : null}
            {allPosts.map(function(post, i) {
                return <Post key={i} id={post.post_id} data={post} setData={setViewingPost} setShowPopup={setShowViewPostPopup} />;
            })}
        </div>
    );

    return (
        <>
            <Header user={props.user} setUser={props.setUser} showDashLink={false} />
            {showViewPostPopup && viewPostPopup}
            {showCreatePostPopup && createPostPopup}
            {showEditPostPopup && editPostPopup}
            <main className={styles.main}>
                <div className={styles.heading}>
                    <h1>Welcome to your dashboard, {props.user.email}!</h1>
                    {headerButton()}
                </div>
                <div className={styles.dashboards}>
                    <div className={`${styles.dashboard} ${styles.view_posts}`}>
                        <h1>Your Offers</h1>
                        {viewPostsContainer}
                    </div>
                    <div className={`${styles.dashboard} ${styles.my_posts}`}>
                        <h1>My Posts</h1>
                        {myPostsContainer}
                    </div>
                    <div className={`${styles.dashboard} ${styles.all_posts}`}>
                        <h1>Transaction History</h1>
                        {allPostsContainer}
                    </div>
                </div>
            </main>
            <Footer />
        </>
    );
}