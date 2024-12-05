import React, { useEffect, useState } from 'react';
// import { NavLink } from 'react-router-dom';
import axios from 'axios';

import Header from "../../components/Header/Header";
import Footer from "../../components/Footer/Footer";
import Popup from "../../components/Popup/Popup";
import Post from '../../components/Post/Post';
import Transaction from '../../components/Transaction/Transaction';

import styles from "./Dashboard.module.css";

export default function Dashboard(props) {

    let user = props.user;

    const [showCreatePostPopup, setShowCreatePostPopup] = useState(false);
    const [showViewPostPopup, setShowViewPostPopup] = useState(false);
    const [showMatchPostPopup, setShowMatchPostPopup] = useState(false);
    const [showEditPostPopup, setShowEditPostPopup] = useState(false);
    const [showViewTransactionPopup, setShowViewTransactionPopup] = useState(false);
    const [showNewTransactionProposalPopup, setShowNewTransactionProposalPopup] = useState(false);

    const [allItems, setAllItems] = useState([]);
    const [offeringItems, setOfferingItems] = useState([]);
    const [hasPartner, setHasPartner] = useState(false);

    const [viewingPost, setViewingPost] = useState({});
    const [viewingTransaction, setViewingTransaction] = useState({});

    const [viewPosts, setViewPosts] = useState([]);
    const [myPosts, setMyPosts] = useState([]);
    const [myTransactions, setMyTransactions] = useState([]);

    // All of this could just be saved as a post object realistically (except maybe the names, though we could add that to the sql query)
    const [requestingItemName, setRequestingItemName] = useState("");
    const [requestingItemAmt, setRequestingItemAmt] = useState(-1);
    const [offeringItemName, setOfferingItemName] = useState("");
    const [offeringItemAmt, setOfferingItemAmt] = useState(-1);
    const [receiving, setReceiving] = useState("Me");
    const [giving, setGiving] = useState("Me");
    const [isNegotiable, setIsNegotiable] = useState(0);

    const [proposingRequestAmount, setProposingRequestAmount] = useState(-1);
    const [proposingOfferAmount, setProposingOfferAmount] = useState(-1);

    const [offeringFee, setOfferingFee] = useState(0);
    const [requestingFee, setRequestingFee] = useState(0);
    const [userHasAmount, setUserHasAmount] = useState(false);
    const [userHasOfferAmount, setUserHasOfferAmount] = useState(false);
    const [userOfferingAmountOwned, setUserOfferingAmountOwned] = useState(0);

    const [enteredHash, setEnteredHash] = useState('');

    const [errorMsg, setErrorMsg] = useState('');

    useEffect(() => {
        setOfferingItemName("");
        setOfferingItemAmt(-1);
        setRequestingItemName("");
        setRequestingItemAmt(-1);
        setIsNegotiable(0);
        setErrorMsg("");
        setOfferingFee(0);
    }, [showCreatePostPopup, showEditPostPopup, showViewPostPopup, showMatchPostPopup, showViewTransactionPopup, showNewTransactionProposalPopup]);

    const SetPostObject = (data) => {
        setRequestingItemName(data.requesting);
        setOfferingItemName(data.offering);
        setRequestingItemAmt(data.requestingAmount);
        setOfferingItemAmt(data.offeringAmount);
        setIsNegotiable(data.isNegotiable);
    }

    const CreatePost = async () => {
        if(requestingItemName === "" || offeringItemName === "") {
            setErrorMsg('Please fill in all required fields.');
            return false;
        }
        if(requestingItemName === offeringItemName) {
            setErrorMsg('You cannot request and offer the same item.');
            return false;
        }

        const requestingItem = allItems.find(item => item.name.toLowerCase() === requestingItemName.toLowerCase());
        const offeringItem = allItems.find(item => item.name.toLowerCase() === offeringItemName.toLowerCase());

        const partnerResponse = await axios.post("http://localhost:5000/partnerships/get-partner", { userId: user.user_id });
        if(!partnerResponse.data.partner) {
            setErrorMsg('Error: Unable to find partner.');
            return false;
        }
        const receiving_id = receiving.toLowerCase().includes("partner") ? partnerResponse.data.partner.user_id : user.user_id;
        const giving_id = giving.toLowerCase().includes("partner") ? partnerResponse.data.partner.user_id : user.user_id;

        const createPostResponse = await axios.post("http://localhost:5000/posts/create-post", { 
            userId: user.user_id,
            requestingItemId: requestingItem.item_id,
            requestingItemAmt: requestingItemAmt,
            offeringItemId: offeringItem.item_id,
            offeringItemAmt: offeringItemAmt,
            receivingId: receiving_id,
            givingId: giving_id,
            isNegotiable: isNegotiable,
        });
        if(!createPostResponse.data.status) {
            setErrorMsg('Error: Failed to create post.');
            return false;
        }

        // Reset Values (TODO: MAKE THIS A FUNCTION)
        setRequestingItemName(allItems[0].name);
        setOfferingItemName(allItems[0].name);
        setRequestingItemAmt(1);
        setOfferingItemAmt(1);
        setIsNegotiable(0);

        setShowCreatePostPopup(false);
        RefreshAllDashboards();
        return true;
    };

    const UpdateRequestingItemData = (e) => {
        if(offeringItemAmt < 0) setOfferingItemAmt(1);

        let requestingItem = allItems.find(item => item.name.toLowerCase() === requestingItemName.toLowerCase());
        if(!requestingItem) return;
        
        let offeringItem = null;

        let value = parseFloat(e);
        if(isNaN(value)) {
            // This is being called from the select dropdown
            offeringItem = allItems.find(item => item.name.toLowerCase() === e.toLowerCase());
            if(!offeringItem) return;

            value = offeringItem.value;
            if(requestingItemAmt >= 0) setOfferingItemAmt(requestingItemAmt * requestingItem.value / offeringItem.value);
            else setRequestingItemAmt(requestingItem.value / value);
        }
        else {
            // This is being called from the amount input field
            offeringItem = allItems.find(item => item.name.toLowerCase() === offeringItemName.toLowerCase());
            if(!offeringItem) return;

            setRequestingItemAmt(offeringItem.value / requestingItem.value * value);
        }
    }

    const UpdateOfferingItemData = (e) => {
        if(requestingItemAmt < 0) setRequestingItemAmt(1);

        let offeringItem = allItems.find(item => item.name.toLowerCase() === offeringItemName.toLowerCase());
        if(!offeringItem) return;

        let requestingItem = null;

        let value = parseFloat(e);
        if(isNaN(value)) {
            // This is being called from the select dropdown
            requestingItem = allItems.find(item => item.name.toLowerCase() === e.toLowerCase());
            if(!requestingItem) return;

            value = requestingItem.value;
            if(offeringItemAmt >= 0) setRequestingItemAmt(offeringItemAmt * offeringItem.value / requestingItem.value);
            else setOfferingItemAmt(offeringItem.value / value);
        }
        else {
            // This is being called from the amount input field
            requestingItem = allItems.find(item => item.name.toLowerCase() === requestingItemName.toLowerCase());
            if(!requestingItem) return;

            setOfferingItemAmt(requestingItem.value / offeringItem.value * value);
        }
    }

    const UpdatePost = async () => {
        if(requestingItemName === "" || offeringItemName === "") {
            setErrorMsg('Please fill in all required fields.');
            return false;
        }
        if(requestingItemName === offeringItemName) {
            setErrorMsg('You cannot request and offer the same item.');
            return false;
        }

        const requestingItem = allItems.find(item => item.name.toLowerCase() === requestingItemName.toLowerCase());
        const offeringItem = allItems.find(item => item.name.toLowerCase() === offeringItemName.toLowerCase());

        const partnerResponse = await axios.post("http://localhost:5000/partnerships/get-partner", { userId: user.user_id });
        if(!partnerResponse.data.partner) {
            setErrorMsg('Error: Unable to find partner.');
            return false;
        }
        const receiving_id = receiving.toLowerCase().includes("partner") ? partnerResponse.data.partner.user_id : user.user_id;
        const giving_id = giving.toLowerCase().includes("partner") ? partnerResponse.data.partner.user_id : user.user_id;

        const createPostResponse = await axios.post("http://localhost:5000/posts/update-post", { 
            userId: user.user_id,
            postId: viewingPost.post_id,
            requestingItemId: requestingItem.item_id,
            requestingItemAmt: requestingItemAmt,
            offeringItemId: offeringItem.item_id,
            offeringItemAmt: offeringItemAmt,
            receivingId: receiving_id,
            givingId: giving_id,
            isNegotiable: isNegotiable,
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
        PopulatePosts();
    };

    const MatchPost = async (matchPostId) => {
        // viewingPost.post_id ------------------> post that you click match on, i.e., a post you did NOT make
        // matchPostId / viewingPost.matchPost --> the match to the post you clicked match on, i.e., a post you DID make
        const createTransactionResponse = await axios.post("http://localhost:5000/transactions/create-transaction", { 
            userId: user.user_id,
            primaryPost: viewingPost,
            secondaryPostId: matchPostId,
            isNegotiating: viewingPost.isNegotiable
        });
        if(!createTransactionResponse.data.status) {
            setErrorMsg('Failed to match post.');
            return false;
        }

        setShowMatchPostPopup(false);
        setViewingPost([]);
        RefreshAllDashboards();
    };

    // Function to refresh the posts
    const PopulatePosts = async () => {
        // View posts
        const viewPostsResponse = await axios.post("http://localhost:5000/posts/get-match-posts", { userId: props.user.user_id });
        console.log(viewPostsResponse.data);
        setViewPosts(viewPostsResponse.data.message ? [] : viewPostsResponse.data.posts);
        // My posts
        const myPostsResponse = await axios.post("http://localhost:5000/posts/get-posts", { userId: props.user.user_id });
        setMyPosts(myPostsResponse.data.message ? [] : myPostsResponse.data.posts);

        // My transactions
        const allPostsResponse = await axios.post("http://localhost:5000/transactions/get-transactions", { userId: props.user.user_id });
        setMyTransactions(allPostsResponse.data.transactions);
    };

    const GetItems = async (offeringInventory) => {
        if(!offeringInventory) offeringInventory = "Me";
        const offeringItemsResponse = (offeringInventory.toLowerCase().includes("partner"))
            ? await axios.post("http://localhost:5000/items/get-partner-inventory", { userId: user.user_id })
            : await axios.post("http://localhost:5000/items/get-inventory", { userId: user.user_id });

        const allItemsResponse = await axios.get("http://localhost:5000/items/get-items");     

        if(!offeringItemsResponse.data.message && !allItemsResponse.data.message) {
            setOfferingItems(offeringItemsResponse.data.items);
            setAllItems(allItemsResponse.data.items);
        }
    }

    const GetPartnership = async () => {
        const partnerResponse = await axios.post("http://localhost:5000/partnerships/get-partnership", { userId: user.user_id });
        if(!partnerResponse.data.message) {
            setHasPartner(true);
        }
    }

    useEffect(() => {
        PopulatePosts();
        GetPartnership();
        GetItems();
    }, []); // eslint-disable-line react-hooks/exhaustive-deps

    // Create New Post popup
    const createPostPopup = (
        <Popup trigger={setShowCreatePostPopup}>
            <h2>Create New Post</h2>
            <div className={styles.error_message}>{errorMsg}</div>
            
            {/* REQUESTING */}
            <div className={styles.popup_section}>
                <label htmlFor="requesting_item_list">Item to request:</label>
                <select name="requesting_item_list" id="requesting_item_list" defaultValue={'DEFAULT'} className={styles.popup_select} onChange={(e) => { setRequestingItemName(e.target.value); UpdateOfferingItemData(e.target.value); }}>
                    <option hidden disabled value="DEFAULT"></option>
                    {allItems.map((item, index) => (
                        <option key={index} value={item.name.toLowerCase()}>
                            {item.name}
                        </option>
                    ))}
                </select>
                <input type="number" id="requesting_amount" name="quantity" min="1" max="99" value={requestingItemAmt < 0 ? "" : requestingItemAmt} onChange={(e) => { setRequestingItemAmt(e.target.value); UpdateOfferingItemData(e.target.value); }}/>
            </div>
            <div className={styles.popup_section}>
                <label>For:</label>
                <select name="requesting_for" id="requesting_for" className={styles.popup_select} onChange={(e) => { setReceiving(e.target.value); }}>
                    <option key={0}>Me</option>
                    <option key={1}>My Partner</option>
                </select>
            </div>

            <br/>
            {/* OFFERING */}
            <div className={styles.popup_section}>
                <label>From:</label>
                <select name="offering_from" id="offering_from" className={styles.popup_select} onChange={(e) => { setGiving(e.target.value); GetItems(e.target.value); setOfferingItemName(""); }}>
                    <option key={0}>Me</option>
                    <option key={1}>My Partner</option>
                </select>
            </div>
            <div className={styles.popup_section}>
                <label htmlFor="offering_item_list">Item to offer:</label>
                <select name="offering_item_list" id="offering_item_list" defaultValue={'DEFAULT'} className={styles.popup_select} onChange={(e) => { console.log(e.target.value); setOfferingItemName(e.target.value); UpdateRequestingItemData(e.target.value); AdjustOfferingFeeByName(e.target.value);}}>
                    <option hidden disabled value="DEFAULT"></option>
                    {offeringItems.map((item, index) => (
                        <option key={index} value={item.name.toLowerCase()}>
                            {item.name}
                        </option>
                    ))}
                </select>
                <input type="number" id="offering_amount" name="quantity" min="1" max="99" value={offeringItemAmt < 0 ? "" : offeringItemAmt} onChange={(e) => { setOfferingItemAmt(e.target.value); UpdateRequestingItemData(e.target.value);}}/>
                <div/><div/>
                <div className={styles.transaction_line}>
                    <div className={`${styles.last_column} ${styles.right_align}`}>+{Math.round(offeringFee * offeringItemAmt * 100) / 100}</div>
                </div>
            </div>
            
            <div className={styles.popup_section}>
                { userOfferingAmountOwned >= Number(offeringItemAmt) + offeringFee*Number(offeringItemAmt)
                 ? <button className={styles.create_button} onClick={CreatePost}>Create</button>
                 : <button className={styles.create_button} disabled>Missing items {"(" + userOfferingAmountOwned + " owned)"}</button>}
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
                <h2>Your Post Details</h2>
                <div className={styles.error_message}>{errorMsg}</div>
                <p>Requesting Item: <span>{viewingPost.requesting}</span> x{viewingPost.requestingAmount}</p>
                <p>Offering Item: <span>{viewingPost.offering}</span> x{viewingPost.offeringAmount} (+{Math.round(viewingPost.fee * viewingPost.offeringAmount * 100) / 100})</p>
                {viewingPost.isNegotiable > 0 && <p>Willing to negotiate.</p>}
                <p className={styles.created}>Created at: <time>{new Date(viewingPost.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</time></p>
                {viewingPost.createdAt !== viewingPost.updatedAt && <p className={styles.created}>Updated at: <time>{new Date(viewingPost.updatedAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</time></p>}
                <div className={styles.button_group}>
                    <button className={`${styles.button} ${styles.edit_button}`} onClick={() => { 
                        SetPostObject(viewingPost);
                        setShowViewPostPopup(false);
                        setShowEditPostPopup(true);
                        setRequestingItemName(viewingPost.requesting.toLowerCase());
                        UpdateOfferingItemData(viewingPost.requesting.toLowerCase());
                        setOfferingItemName(viewingPost.offering.toLowerCase());
                        UpdateRequestingItemData(viewingPost.offering.toLowerCase());
                        console.log(viewingPost); 
                    }}>Edit Post</button>
                    <button className={`${styles.button} ${styles.delete_button}`} onClick={() => { DeletePost(viewingPost.post_id) }}>Delete Post</button>
                </div>
            </div>
        </Popup>
    );

    const matchPostPopup = (
        <Popup trigger={setShowMatchPostPopup}>
            <div className={styles.post_popup}>
                <h2>Matching Post</h2>
                <div className={styles.error_message}>{errorMsg}</div>
                <p>Offering Item: <span>{viewingPost.offering}</span> x{viewingPost.offeringAmount}</p>
                <p>Requesting Item: <span>{viewingPost.requesting}</span> x{viewingPost.requestingAmount}</p>
                {viewingPost.isNegotiable > 0 && <p>Willing to negotiate.</p>}
                <div className={styles.button_group}>
                    <button className={`${styles.button} ${styles.edit_button}`} onClick={() => { MatchPost(viewingPost.matchPost); }}>Match Post</button>
                </div>
            </div>
        </Popup>
    );

    const editPostPopup = (
        <Popup trigger={setShowEditPostPopup}>
            <h2>Edit Post</h2>
            <div className={styles.error_message}>{errorMsg}</div>
            {/* REQUESTING */}
            <div className={styles.popup_section}>
                <label htmlFor="requesting_item_list">Item to request:</label>
                <select name="requesting_item_list" id="requesting_item_list" defaultValue={viewingPost?.requesting?.toLowerCase()} className={styles.popup_select} onChange={(e) => { setRequestingItemName(e.target.value); UpdateOfferingItemData(e.target.value); }}>
                    {allItems.map((item, index) => (
                        <option key={index} value={item.name.toLowerCase()}>
                            {item.name}
                        </option>
                    ))}
                </select>
                <input type="number" id="requesting_amount" name="quantity" min="1" max="99" value={requestingItemAmt < 0 ? "" : requestingItemAmt} onChange={(e) => { setRequestingItemAmt(e.target.value); UpdateOfferingItemData(e.target.value); }}/>
            </div>
            <div className={styles.popup_section}>
                <label>For:</label>
                <select name="requesting_for" id="requesting_for" defaultValue={viewingPost?.user_id_receiving === user.user_id ? "me" : "partner"} className={styles.popup_select} onChange={(e) => { setReceiving(e.target.value); }}>
                    <option key={0} value={"me"}>Me</option>
                    <option key={1} value={"partner"}>My Partner</option>
                </select>
            </div>

            <br/>
            {/* OFFERING */}
            <div className={styles.popup_section}>
                <label>From:</label>
                <select name="offering_from" id="offering_from" defaultValue={viewingPost?.user_id_giving === user.user_id ? "me" : "partner"} className={styles.popup_select} onChange={(e) => { setGiving(e.target.value); GetItems(e.target.value); setOfferingItemName(""); }}>
                    <option key={0} value={"me"}>Me</option>
                    <option key={1} value={"partner"}>My Partner</option>
                </select>
            </div>
            <div className={styles.popup_section}>
                <label htmlFor="offering_item_list">Item to offer:</label>
                <select name="offering_item_list" id="offering_item_list" defaultValue={viewingPost?.offering?.toLowerCase()} className={styles.popup_select} onChange={(e) => { setOfferingItemName(e.target.value); UpdateRequestingItemData(e.target.value); AdjustOfferingFeeByName(e.target.value);}}>
                    {offeringItems.map((item, index) => (
                        <option key={index} value={item.name.toLowerCase()}>
                            {item.name}
                        </option>
                    ))}
                </select>
                <input type="number" id="offering_amount" name="quantity" min="1" max="99" value={offeringItemAmt < 0 ? "" : offeringItemAmt} onChange={(e) => { setOfferingItemAmt(e.target.value); UpdateRequestingItemData(e.target.value); }}/>
                <div/><div/>
                <div className={styles.transaction_line}>
                    <div className={`${styles.last_column} ${styles.right_align}`}>+{Math.round(offeringFee * offeringItemAmt * 100) / 100}</div>
                </div>
            </div>
            <div className={styles.popup_section}>
                { userOfferingAmountOwned >= Number(offeringItemAmt) + offeringFee*Number(offeringItemAmt)
                    ? <button className={styles.create_button} onClick={UpdatePost}>Save</button>
                    : <button className={styles.create_button} disabled>Missing items {"(" + userOfferingAmountOwned + " owned)"}</button>}
                <div className={styles.checkbox}>
                    <label htmlFor="negotiate_edit">Will Negotiate</label>
                    <input type="checkbox" defaultChecked={viewingPost.isNegotiable > 0} id="negotiate_edit" name="negotiate_edit" onChange={(e) => { setIsNegotiable(e.target.checked ? 1 : 0); }}/>
                </div>
            </div>
        </Popup>
    );

    const ApproveTransaction = async () => {
        const requestFee = requestingFee * requestingAmt;
        const offerFee = Math.round((offeringFee * offeringAmt) * 100) / 100;
        const response = await axios.post("http://localhost:5000/transactions/approve-transaction", { 
            userId: user.user_id, 
            transactionId: viewingTransaction.transaction_id, 
            isPrimary: viewingTransaction.ownsPrimaryPost,
            primaryFee: viewingTransaction.ownsPrimaryPost ? offerFee : requestFee,
            secondaryFee: viewingTransaction.ownsPrimaryPost ? requestFee : offerFee,
        });
        if(!response.data.status) {
            setErrorMsg('Failed to approve transaction.');
            return;
        }

        setShowViewTransactionPopup(false);
        setViewingTransaction([]);
        RefreshAllDashboards();
    }

    const SubmitHash = async () => {
        if(enteredHash !== hash) {
            setErrorMsg('Invalid code.');
            return;
        }
        const response = await axios.post("http://localhost:5000/transactions/confirm-hash", { 
            userId: user.user_id, 
            transactionId: viewingTransaction.transaction_id, 
            isPrimary: viewingTransaction.ownsPrimaryPost,
        });
        if(!response.data.status) {
            setErrorMsg('Failed to submit hash.');
            return;
        }

        setShowViewTransactionPopup(false);
        setViewingTransaction([]);
        RefreshAllDashboards();
    }

    const AdjustOfferingFeeByName = async (value) => {
        const pickedItem = allItems.find(item => item.name.toLowerCase() === value.toLowerCase());

        setOfferingFee(pickedItem?.transfer_cost ?? 0);

        const userInventoryResponse = await axios.post("http://localhost:5000/items/get-inventory", { userId: user.user_id });
        const itemInInventory = userInventoryResponse.data.items.find(inventoryItem => inventoryItem.item_id === pickedItem.item_id);
        
        setUserOfferingAmountOwned(itemInInventory ? itemInInventory.item_amount : 0);
        const num = Number(offeringItemAmt);
        setUserHasAmount(itemInInventory && itemInInventory.item_amount >= num + pickedItem?.transfer_cost*num);
    }

    const SetTransactionItems = async () => {
        const temp_fee = allItems.find(item => item.name === workingTransaction?.offering_item_name)?.transfer_cost;
        setOfferingFee(temp_fee);
        setRequestingFee(allItems.find(item => item.name === workingTransaction?.requesting_item_name)?.transfer_cost);

        const userInventoryResponse = await axios.post("http://localhost:5000/items/get-inventory", { userId: user.user_id });

        const itemInInventory = userInventoryResponse.data.items.find(inventoryItem => inventoryItem.item_id === workingTransaction?.offering_item_id);
        
        setUserOfferingAmountOwned(itemInInventory ? itemInInventory.item_amount : 0);
        setUserHasAmount(itemInInventory && itemInInventory.item_amount >= offeringAmt + temp_fee*offeringAmt);
    }

    useEffect(() => {
        if(viewingTransaction.primary_post?.requesting_item_id && viewingTransaction.secondary_post?.offering_item_id) {
            SetTransactionItems();
        }
    }, [viewingTransaction]); // eslint-disable-line react-hooks/exhaustive-deps

    const workingTransaction = viewingTransaction.ownsPrimaryPost ? viewingTransaction.primary_post : viewingTransaction.secondary_post;
    const hash = viewingTransaction.ownsPrimaryPost ? viewingTransaction.hash_code?.substring(0, 8) : viewingTransaction.hash_code?.substring(8, 16);
    const userHasApproved = (viewingTransaction?.ownsPrimaryPost && viewingTransaction?.primary_approved) || (!viewingTransaction?.ownsPrimaryPost && viewingTransaction?.secondary_approved);
    const offeringAmt = viewingTransaction?.ownsPrimaryPost ? viewingTransaction?.proposing_primary_offer_amt ?? workingTransaction?.offering_amount : viewingTransaction?.proposing_primary_request_amt ?? workingTransaction?.offering_amount; //viewingTransaction.proposing_primary_offer_amt ?? workingTransaction?.offering_amount;
    const requestingAmt = viewingTransaction?.ownsPrimaryPost ? viewingTransaction.proposing_primary_request_amt ?? workingTransaction?.requesting_amount : viewingTransaction.proposing_primary_offer_amt ?? workingTransaction?.requesting_amount; //viewingTransaction.proposing_primary_request_amt ?? workingTransaction?.requesting_amount;
    const postCreator = user.user_id === workingTransaction?.posting_user_id;
    const viewTransactionPopup = (
        <Popup trigger={setShowViewTransactionPopup}>
            <div className={styles.post_popup}>
                <h2>Transaction Details</h2>
                {viewingTransaction.state <= 0 && viewingTransaction.proposing_post_id && viewingTransaction.proposing_post_id !== workingTransaction.post_id && <p><strong>Other party has proposed:</strong></p>}
                <div className={styles.error_message}>{errorMsg}</div>
                <div className={styles.transaction_line}>
                    <div>Offering Item:</div>
                    <div>{workingTransaction?.offering_item_name}</div> 
                    <div className={styles.right_align}>x {offeringAmt}</div>
                </div>
                <div className={styles.transaction_line}>
                    <div className={`${styles.last_column} ${styles.right_align}`}>+{Math.round(offeringFee * offeringAmt * 100) / 100}</div>
                </div>
                <div className={styles.transaction_line}>
                    <div>Requesting Item: </div>
                    <div>{workingTransaction?.requesting_item_name}</div> 
                    <div className={styles.right_align}>x {requestingAmt}</div>
                </div>
                <div className={styles.transaction_line}>
                    <div className={`${styles.last_column} ${styles.right_align}`}></div>
                </div>
                {postCreator && viewingTransaction.state > 0 && <div className={styles.transaction_status}>Confirmation code: {hash}</div>}
                {viewingTransaction.isNegotiable > 0 && <p className={styles.transaction_status}>Willing to negotiate.</p>}
                {
                    postCreator // If the user is the one who made the post
                    ?   <div className={styles.button_group}>
                            {
                                userHasAmount || viewingTransaction.state > 0
                                ? !userHasApproved && viewingTransaction.state < 1
                                    ? <button className={`${styles.button} ${styles.edit_button}`} onClick={() => { ApproveTransaction(); }}>Approve</button>
                                    : viewingTransaction.state < 1 && <button className={`${styles.button}`} disabled>Approved</button>
                                : <button className={`${styles.button}`} disabled>Missing items</button>
                            }
                            
                            {viewingTransaction.primary_post?.is_negotiable > 0 && viewingTransaction.secondary_post?.is_negotiable > 0 && viewingTransaction.state < 1 && !userHasApproved &&
                                <button className={`${styles.button}`} onClick={() => { setProposingOfferAmount(workingTransaction?.offering_amount); setProposingRequestAmount(workingTransaction?.requesting_amount); setShowViewTransactionPopup(false); setShowNewTransactionProposalPopup(true); CheckOwnedValues(workingTransaction?.offering_amount);}}>Make Proposal</button>
                            }
                        </div>
                    :   <div className={styles.button_group}>
                            {
                                viewingTransaction.state > 0
                                ?   userHasApproved ? <p className={styles.transaction_status}>Awaiting other party's confirmation.</p>
                                    : <>
                                        <div>
                                            <label className={styles.transaction_status}>Enter code from partner:</label>
                                            <input type="text" placeholder={"Type code here"} maxLength={8} onChange={(e) => { setEnteredHash(e.target.value); }} />
                                        </div>
                                        <button className={`${styles.button}`} onClick={() => { SubmitHash(); }}>Submit</button>
                                    </>
                                :   !userHasApproved ? <p className={styles.transaction_status}>Awaiting partner's approval.</p> : <p className={styles.transaction_status}>Awaiting other party's approval.</p>
                            }
                        </div>
                }
            </div>
        </Popup>
    );

    const SendProposal = async () => {
        const proposingPostId = viewingTransaction.ownsPrimaryPost ? viewingTransaction.primary_post.post_id : viewingTransaction.secondary_post.post_id;
        const response = await axios.post("http://localhost:5000/transactions/make-proposal", {
            userId: user.user_id,
            transactionId: viewingTransaction.transaction_id,
            proposingPostId: proposingPostId,
            proposingRequestAmount: viewingTransaction?.ownsPrimaryPost ? proposingRequestAmount : proposingOfferAmount,
            proposingOfferAmount: viewingTransaction?.ownsPrimaryPost ? proposingOfferAmount : proposingRequestAmount,
            isPrimary: viewingTransaction.ownsPrimaryPost
        });
        if(!response.data.status) {
            setErrorMsg('Failed to make proposal.');
            return;
        }

        setShowNewTransactionProposalPopup(false);
        setViewingTransaction([]);
        RefreshAllDashboards();
    }

    const CheckOwnedValues = async (value) => {
        value = Number(value);
        const temp_fee = allItems.find(item => item.name === workingTransaction?.offering_item_name)?.transfer_cost;

        const userInventoryResponse = await axios.post("http://localhost:5000/items/get-inventory", { userId: user.user_id });

        const itemInInventory = userInventoryResponse.data.items.find(inventoryItem => inventoryItem.item_id === workingTransaction?.offering_item_id);

        console.log(`${itemInInventory.item_amount} >= ${value} + ${temp_fee}*${value}`)
        setUserHasOfferAmount(itemInInventory && itemInInventory.item_amount >= value + temp_fee*value);
        setOfferingFee(temp_fee);
    }

    const newTransactionProposalPopup = (
        <Popup trigger={setShowNewTransactionProposalPopup}>
            <div className={styles.post_popup}>
                <h2>New Proposal</h2>
                <div className={styles.error_message}>{errorMsg}</div>
                <div className={styles.popup_section}>
                    <label htmlFor="offering_item_list_label">Offering Item: </label>
                    <label htmlFor="offering_item_list_item">{workingTransaction?.offering_item_name}</label>
                    <input type="number" id="offering_amount_edit" name="quantity" min="1" max={userOfferingAmountOwned} value={proposingOfferAmount} defaultValue={workingTransaction?.offering_amount} onChange={(e) => { setProposingOfferAmount(e.target.value); CheckOwnedValues(e.target.value); }}/>
                </div>
                <div>
                    <div className={`${styles.last_column} ${styles.right_align}`}>+{Math.round(offeringFee * proposingOfferAmount * 100) / 100}</div>
                </div>
                <div className={styles.popup_section}>
                    <label htmlFor="requesting_item_list_label">Requesting Item:</label>
                    <label htmlFor="requesting_item_list_item">{workingTransaction?.requesting_item_name}</label>
                    <input type="number" id="requesting_amount_edit" name="quantity" min="1" max="99" value={proposingRequestAmount} defaultValue={workingTransaction?.requesting_amount} onChange={(e) => { setProposingRequestAmount(e.target.value); }}/>
                </div>
                <div className={styles.popup_section}>
                    {userHasOfferAmount
                     ? <button className={styles.create_button} onClick={SendProposal}>Send Proposal</button>
                     : <button className={styles.create_button} disabled>Missing items {"(" + userOfferingAmountOwned + " owned)"}</button>}
                    <button className={styles.create_button} onClick={() => { setProposingOfferAmount(workingTransaction?.offering_amount); setProposingRequestAmount(workingTransaction?.requesting_amount); }}>Revert</button>
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
                        <button onClick={() => { setShowCreatePostPopup(true); }}>Create New Post</button>
                    </div>
        }
    };

    const matchPostsContainer = (
        <div className={styles.post_container}>
            {viewPosts.length <= 0 && <div className={styles.no_posts}>No posts to show</div>}
            {viewPosts.map(function(post, i) {
                return <Post key={i} id={post.post_id} type={"match"} data={post} setData={setViewingPost} setShowPopup={setShowMatchPostPopup} />;
            })}
        </div>
    );

    const myPostsContainer = (
        <div className={styles.post_container}>
            {myPosts.length <= 0 && <div className={styles.no_posts}>No posts to show</div>}
            {myPosts.map(function(post, i) {
                return <Post key={i} isUsers={true} type={"post"} id={post.post_id} data={post} setData={setViewingPost} setShowPopup={setShowViewPostPopup} />;
            })}
        </div>
    );

    const myTransactionsContainer = (
        <div className={styles.post_container}>
            {myTransactions.length <= 0 && <div className={styles.no_posts}>No transactions made</div>}
            {myTransactions.map(function(transaction, i) {
                return <Transaction key={i} user={user} type={"transaction"} id={transaction.post_id} data={transaction} setData={setViewingTransaction} setShowPopup={setShowViewTransactionPopup} />;
            })}
        </div>
    );

    return (
        <>
            <Header user={props.user} setUser={props.setUser} showDashLink={false} />
            {showViewPostPopup && viewPostPopup}
            {showMatchPostPopup && matchPostPopup}
            {showCreatePostPopup && createPostPopup}
            {showEditPostPopup && editPostPopup}
            {showViewTransactionPopup && viewTransactionPopup}
            {showNewTransactionProposalPopup && newTransactionProposalPopup}
            <main className={styles.main}>
                <div className={styles.heading}>
                    <h1>Welcome to your dashboard, {props.user.email}!</h1>
                    {headerButton()}
                </div>
                <div className={styles.dashboards}>
                    <div className={`${styles.dashboard} ${styles.view_posts}`}>
                        <h1>Your Offers</h1>
                        {matchPostsContainer}
                    </div>
                    <div className={`${styles.dashboard} ${styles.my_posts}`}>
                        <h1>Your Posts</h1>
                        {myPostsContainer}
                    </div>
                    <div className={`${styles.dashboard} ${styles.all_posts}`}>
                        <h1>Your Transactions</h1>
                        {myTransactionsContainer}
                    </div>
                </div>
            </main>
            <Footer />
        </>
    );
}