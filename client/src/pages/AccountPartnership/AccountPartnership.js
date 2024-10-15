import React, {useEffect, useState} from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

import Header from "../../components/Header/Header";
import Footer from "../../components/Footer/Footer";
import AccountSidebar from "../../components/AccountSidebar/AccountSidebar";
import Popup from '../../components/Popup/Popup';

import styles from "./AccountPartnership.module.css";

export default function Account(props) {
    
    let user = props.user;
    let navigate = useNavigate();

    const [partner, setPartner] = useState(null);
    const [incomingRequests, setIncomingRequests] = useState([]);
    const [outgoingRequests, setOutgoingRequests] = useState([]);

    const [requestingEmail, setRequestingEmail] = useState('');
    const [requestingId, setRequestingId] = useState(-1);

    const [showRejectRequestPopup, setShowRejectRequestPopup] = useState(false);
    const [showCancelRequestPopup, setShowCancelRequestPopup] = useState(false);
    const [showConfirmRemovePopup, setShowConfirmRemovePopup] = useState(false);
    const [showRequestPopup, setShowRequestPopup] = useState(false);
    const [showExistingRequestPopup, setShowExistingRequestPopup] = useState(false);
    const [showOverridingRequestPopup, setShowOverridingRequestPopup] = useState(false);
    const [showAcceptRequestPopup, setShowAcceptRequestPopup] = useState(false);

    const [errorMsg, setErrorMsg] = useState('');

    useEffect(() => {
        setErrorMsg('');
    }, [showRejectRequestPopup, showCancelRequestPopup, showConfirmRemovePopup, showRequestPopup, showExistingRequestPopup, showOverridingRequestPopup, showAcceptRequestPopup]);

    const RemoveParter  = async () => {
        const response = await axios.post("http://localhost:5000/partnerships/delete-partner", { userId: user.user_id });
        if(response.data.message) {
            setErrorMsg("Failed to remove partner.");
            return;
        }
        setPartner(null);
        CloseAllPopups();
    }

    const SendRequest = async () => {
        if(requestingEmail === '') {
            setErrorMsg('Please fill in all required (*) fields.');
            return;
        }
        if(requestingEmail === user.email) {
            setErrorMsg('You cannot send a request to yourself.');
            return;
        }

        // Check if the requested user actually exists (their email)
        const userExistsResponse = await axios.post("http://localhost:5000/users/check-user-exists", { userId: user.user_id, email: requestingEmail });
        if(!userExistsResponse.data.status) {
            setErrorMsg('User with email does not exist.');
            return;
        }

        // Check if the request being made already exists
        const requestExistsResponse = await axios.post("http://localhost:5000/requests/check-request-exists", { userId: user.user_id, requestedUserId: userExistsResponse.data.user.user_id });
        if(requestExistsResponse.data.status) {
            setErrorMsg('Request already exists.');
            return;
        }

        // Check if the request being made already exists as an incoming request
        const incomingRequestExists = await axios.post("http://localhost:5000/requests/check-request-exists", { userId: userExistsResponse.data.user.user_id, requestedUserId: user.user_id });
        if(incomingRequestExists.data.status) {
            setErrorMsg('');
            setShowRequestPopup(false);
            setShowExistingRequestPopup(true); // show a popup to accept the request
            return;
        }

         // After all checks, actually create the request
         const finalResponse = await axios.post("http://localhost:5000/requests/create-request", { userId: user.user_id, requestedUserId: userExistsResponse.data.user.user_id });
         if(!finalResponse.data.status) {
             setErrorMsg('User with email does not exist.');
             return;
         }

        fetchRequests();
        setShowRequestPopup(false);
    }

    const AcceptRequestByEmail = async () => {
        // Using the check-user-exists because it only returns user_id and email.

        const userExistsResponse = await axios.post("http://localhost:5000/users/check-user-exists", { userId: user.user_id, email: requestingEmail });
        if(!userExistsResponse.data.status) {
            setErrorMsg('Error: Unable to find partner.');
            return;
        }
        setRequestingId(userExistsResponse.data.user.user_id);

        AcceptRequest({id: userExistsResponse.data.user.user_id});
    }

    const AcceptRequest = async (requesting_id) => {
        if(!requesting_id.id || requesting_id.id < 0) {
            if(requestingId < 0) {
                setErrorMsg("Error: Unable to find partner id.");
                return;
            }
            else {
                requesting_id = requestingId;
            }
        }

        // Delete any current parntership
        const deletePartnerResponse = await axios.post("http://localhost:5000/partnerships/delete-partner", { userId: user.user_id });

        // Create the new partnership
        const createPartnershipResponse = await axios.post("http://localhost:5000/partnerships/create-partnership", { user1_id: user.user_id, user2_id: requesting_id });
        if(!createPartnershipResponse.data.status) {
            setErrorMsg("Error: Failed to create partnership.");
            return;
        }
        setPartner(createPartnershipResponse.data.partner);

        // We clear all outgoing request for BOTH users (since they are now partners)
        const test = await axios.post("http://localhost:5000/requests/clear-all-outgoing-requests", { userDeleting: user.user_id, deletingFor: user.user_id });
        const test2 = await axios.post("http://localhost:5000/requests/clear-all-outgoing-requests", { userDeleting: user.user_id, deletingFor: createPartnershipResponse.data.partner.user_id });

        await fetchRequests();
        CloseAllPopups();
    }

    const RemoveRequest = async (requesting_id, requested_id) => {

        const response = await axios.post("http://localhost:5000/requests/delete-request", { requestingUserId: requesting_id, requestedUserId: requested_id });
        if(!response.data.status) {
            setErrorMsg("Error: Failed to remove request.");
            return;
        }

        fetchRequests();
        CloseAllPopups();
    }

    const rejectRequestPopup = (
        <Popup trigger={setShowRejectRequestPopup}> 
            <h2>Reject Request</h2>
            <div className={styles.error_message}>{errorMsg}</div>
            <h3 className={styles.popup_msg}>Are you sure you want to reject the request from <strong>{requestingEmail}</strong>?</h3>
            <button className={`${styles.send_button} ${styles.negative_button}`} onClick={() => { RemoveRequest(requestingId, user.user_id); }}>Confirm</button>
        </Popup>
    );

    const cancelRequestPopup = (
        <Popup trigger={setShowCancelRequestPopup}> 
            <h2>Cancel Request</h2>
            <div className={styles.error_message}>{errorMsg}</div>
            <h3 className={styles.popup_msg}>Are you sure you want to cancel the request to <strong>{requestingEmail}</strong>?</h3>
            <button className={`${styles.send_button} ${styles.negative_button}`} onClick={() => { RemoveRequest(user.user_id, requestingId); }}>Confirm</button>
        </Popup>
    );

    const removePartnerPopup = (
        <Popup trigger={setShowConfirmRemovePopup}> 
            <h2>Remove Parter</h2>
            <div className={styles.error_message}>{errorMsg}</div>
            <h3 className={styles.popup_msg}>Are you sure you want to remove your partner?<br/>This will delete all posts under current partnership.<br/><br/>Click the button below to confirm and end the partnership.</h3>
            <button className={`${styles.send_button} ${styles.positive_button}`} onClick={RemoveParter}>Confirm</button>
        </Popup>
    );

    const requestPartnerPopup = (
        <Popup trigger={setShowRequestPopup}> 
            <h2 className={styles.popup_title}>Send Partner Request</h2>
            <div className={styles.error_message}>{errorMsg}</div>
            <div className={styles.request_popup}>
                <label htmlFor='email' className={styles.required}>E-mail</label>
                <input className={styles.popup_input} type='email' id='email' name='email' onChange={(e) => setRequestingEmail(e.target.value)} />
                <button className={styles.send_button} onClick={SendRequest}>Send</button>
            </div>
        </Popup>
    );

    const acceptExistingRequestPopup = (
        <Popup trigger={setShowExistingRequestPopup}> 
            <h2 className={styles.popup_title}>Existing Request Found</h2>
            <div className={styles.error_message}>{errorMsg}</div>
            <div className={styles.request_popup}>
                <div className={styles.p}>You tried to create a partnership request for a user who has already sent you a request.</div>
                <div className={styles.p}>Do you want to accept the request from <span className={styles.highlight}>{requestingEmail}</span>?</div>
                <button className={styles.send_button} onClick={AcceptRequestByEmail}>Accept Request</button>
            </div>
        </Popup>
    );

    const overridingRequestPopup = (
        <Popup trigger={setShowOverridingRequestPopup}> 
            <h2 className={styles.popup_title}>Accept Request</h2>
            <div className={styles.error_message}>{errorMsg}</div>
            <div className={styles.request_popup}>
                <div className={styles.p}>You have selected to accept the request from <span className={styles.highlight}>{requestingEmail}</span>?</div>
                <div className={styles.p}>NOTE: This will <strong>remove</strong> your current partner and all existing posts you have in your partnership!</div>
                <button className={styles.send_button} onClick={AcceptRequest}>Accept Request</button>
            </div>
        </Popup>
    );

    const acceptRequestPopup = (
        <Popup trigger={setShowAcceptRequestPopup}> 
            <h2 className={styles.popup_title}>Existing Request Found</h2>
            <div className={styles.error_message}>{errorMsg}</div>
            <div className={styles.request_popup}>
                <div>You have selected to accept the request from <span className={styles.highlight}>{requestingEmail}</span>?</div>
                <button className={styles.send_button} onClick={AcceptRequest}>Accept Request</button>
            </div>
        </Popup>
    );

    const CloseAllPopups = () => {
        setShowRejectRequestPopup(false);
        setShowCancelRequestPopup(false);
        setShowConfirmRemovePopup(false);
        setShowRequestPopup(false);
        setShowExistingRequestPopup(false);
        setShowOverridingRequestPopup(false);
        setShowAcceptRequestPopup(false);
        setRequestingId(-1);
        setRequestingEmail('');
    }

    const fetchPartner = async () => {
        try {
            const response = await axios.post("http://localhost:5000/partnerships/get-partner", { userId: user.user_id });
                if(!response.data.message) {
                setPartner(response.data.partner);
            }
        } catch (error) {
            console.error(error);
        }
    }
    const fetchRequests = async () => {
        try {
            const incomingResponse = await axios.post("http://localhost:5000/requests/get-incoming-requests", { userId: user.user_id });

            (!incomingResponse.data.message) ? setIncomingRequests(incomingResponse.data.incoming) : setIncomingRequests([]);

            const outgoingResponse = await axios.post("http://localhost:5000/requests/get-outgoing-requests", { userId: user.user_id });
            (!outgoingResponse.data.message) ? setOutgoingRequests(outgoingResponse.data.outgoing) : setOutgoingRequests([]);

        } catch (error) {
            console.error(error);
        }
    }  

    useEffect(() => {
        if(user.access_level <= 0) {
            navigate("/account");
        } 
        fetchPartner();
        fetchRequests();
    }, []);

    return (
        <>
            {showRejectRequestPopup && rejectRequestPopup /* Popup that shows when you reject an incoming request */ }
            {showCancelRequestPopup && cancelRequestPopup /* Popup that shows when you cancel an outgoing request */ }
            {showConfirmRemovePopup && removePartnerPopup /* Popup that shows when removing your partner */ }
            {showRequestPopup && requestPartnerPopup /* Popup that shows when creating a partner request */ }
            {showExistingRequestPopup && acceptExistingRequestPopup /* Popup that shows when you accept an existing request (when making a request) */ }
            {showOverridingRequestPopup && overridingRequestPopup /* Popup that shows when you accept a request but you already have a partner */ }
            {showAcceptRequestPopup && acceptRequestPopup /* Popup that shows when you accept a request */ }
            <Header user={props.user} setUser={props.setUser} />
            <main className={styles.main}>
                <AccountSidebar user={props.user} setUser={props.setUserr} />
                <section>
                    <h1>Partner</h1>
                    <div className={styles.partner_section}>
                        <p>Current Partner: {partner ? partner.email : "Unassigned."}</p>
                        {!partner && <button className={styles.send_button} onClick={() => { setRequestingEmail(''); setRequestingId(-1); setShowRequestPopup(true); }}>Request by E-mail</button>}
                        {partner && <button className={styles.remove_button} onClick={() => { setShowConfirmRemovePopup(true); }}>Remove Partner</button>}
                    </div>
                    <div className={styles.requests_section}>
                        <div>
                            <h2>Incoming Requests</h2>
                            {incomingRequests.map(function(request, i) {
                                return <div className={styles.request} key={i}>
                                            <div>
                                                <p>{request.requesting_user_email}</p>
                                            </div>
                                            <div className={styles.buttons}>
                                                <button className={styles.positive_button} onClick={() => { setRequestingId(request.requesting_user_id); setRequestingEmail(request.requesting_user_email); (!partner ? setShowAcceptRequestPopup(true) : setShowOverridingRequestPopup(true)); }}>Accept</button>
                                                <button className={styles.negative_button} onClick={() => { setRequestingId(request.requesting_user_id); setRequestingEmail(request.requesting_user_email); setShowRejectRequestPopup(true); }}>Reject</button>
                                            </div>
                                       </div>;
                            })}
                        </div>
                        {!partner && 
                            <div>
                                <h2>Outgoing Requests</h2>
                                {outgoingRequests.map(function(request, i) {
                                    return <div className={styles.request} key={i}>
                                                <p>{request.requested_user_email}</p>
                                                <div className={styles.buttons}>
                                                    <button className={styles.negative_button} onClick={() => { setRequestingId(request.requested_user_id); setRequestingEmail(request.requested_user_email); setShowCancelRequestPopup(true); }}>Cancel</button>
                                                </div>
                                           </div>;
                                })}
                            </div>
                        }
                    </div>      
                </section>
            </main>
            <Footer />
        </>
    );
}