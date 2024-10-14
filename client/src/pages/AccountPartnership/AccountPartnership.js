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

    const [showConfirmRemovePopup, setShowConfirmRemovePopup] = useState(false);
    const [showRequestPopup, setShowRequestPopup] = useState(false);
    const [existingRequestPopup, setExistingRequestPopup] = useState(false);
    const [acceptOverridingRequestPopup, setAcceptOverridingRequestPopup] = useState(false);
    const [acceptRequestPopup, setAcceptRequestPopup] = useState(false);

    const [errorMsg, setErrorMsg] = useState('');

    // useEffect(() => {
    //     setErrorMsg("");
    //     setRequestingEmail('');
    // }, [showRequestPopup]);

    const RemoveParter  = async () => {
        const response = await axios.post("http://localhost:5000/partnerships/deletepartner", { userId: user.user_id });
        if(response.data.message) {
            console.log("Failed to remove partner.");
            return;
        }
        setPartner(null);
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
        const userExistsResponse = await axios.post("http://localhost:5000/users/checkuserexists", { userId: user.user_id, email: requestingEmail });
        if(!userExistsResponse.data.status) {
            setErrorMsg('User with email does not exist.');
            return;
        }

        // Check if the request being made already exists
        const requestExistsResponse = await axios.post("http://localhost:5000/requests/checkrequestexists", { userId: user.user_id, requestedUserId: userExistsResponse.data.user.user_id });
        if(requestExistsResponse.data.status) {
            setErrorMsg('Request already exists.');
            return;
        }

        // Check if the request being made already exists as an incoming request
        const incomingRequestExists = await axios.post("http://localhost:5000/requests/checkrequestexists", { userId: userExistsResponse.data.user.user_id, requestedUserId: user.user_id });
        if(incomingRequestExists.data.status) {
            setShowRequestPopup(false);
            setExistingRequestPopup(true); // show a popup to accept the request
            return;
        }

         // After all checks, actually create the request
         const finalResponse = await axios.post("http://localhost:5000/requests/createrequest", { userId: user.user_id, requestedUserId: userExistsResponse.data.user.user_id });
         if(!finalResponse.data.status) {
             setErrorMsg('User with email does not exist.');
             return;
         }

        fetchRequests();
        setShowRequestPopup(false);
    }

    const AcceptRequest = async () => {
        
    }

    const removePartnerPopupObj = (
        <Popup trigger={setShowConfirmRemovePopup}> 
            <h2>Remove Parter</h2>
            <h3 className={styles.popup_msg}>Are you sure you want to remove your partner?<br/>This will delete all posts under current partnership.<br/><br/>Click the button below to confirm and end the partnership.</h3>
            <button className={styles.remove_button} onClick={RemoveParter}>Confirm</button>
        </Popup>
    );

    const requestPartnerPopupObj = (
        <Popup trigger={setShowRequestPopup}> 
            <h2 className={styles.popup_title}>Send Partner Request</h2>
            <div className={styles.error_message}>{errorMsg}</div>
            <div className={styles.request_popup}>
                <label htmlFor='email' className={styles.required}>E-mail</label>
                <input type='email' id='email' name='email' onChange={(e) => setRequestingEmail(e.target.value)} />
                <button className={styles.send_button} onClick={SendRequest}>Send</button>
            </div>
        </Popup>
    );

    const acceptExistingRequestPopupObj = (
        <Popup trigger={setExistingRequestPopup}> 
            <h2 className={styles.popup_title}>Existing Request Found</h2>
            <div className={styles.error_message}>{errorMsg}</div>
            <div className={styles.request_popup}>
                <p>You tried to create a partnership request for a user who has already sent you a request.<br/><br/>Do you want to accept <span className={styles.highlight}>{requestingEmail}'{requestingEmail.endsWith('s') ? '' : 's'}</span> request?</p>
                <button className={styles.send_button} onClick={AcceptRequest}>Accept Request</button>
            </div>
        </Popup>
    );

    const acceptOverridingRequestPopupObj = (
        <Popup trigger={setExistingRequestPopup}> 
            <h2 className={styles.popup_title}>Accept Request</h2>
            <div className={styles.error_message}>{errorMsg}</div>
            <div className={styles.request_popup}>
                <p>You have selected to accept <span className={styles.highlight}>{requestingEmail}'{requestingEmail.endsWith('s') ? '' : 's'}</span> request.<br/><br/>Do you want to accept?</p>
                <p>NOTE: This will remove your current partner and all existing posts you have in your partnership!</p>
                <button className={styles.send_button} onClick={AcceptRequest}>Accept Request</button>
            </div>
        </Popup>
    );

    const acceptRequestPopupObj = (
        <Popup trigger={setExistingRequestPopup}> 
            <h2 className={styles.popup_title}>Existing Request Found</h2>
            <div className={styles.error_message}>{errorMsg}</div>
            <div className={styles.request_popup}>
            <p>You have selected to accept <span className={styles.highlight}>{requestingEmail}'{requestingEmail.endsWith('s') ? '' : 's'}</span> request.<br/><br/>Do you want to accept?</p>
            <button className={styles.send_button} onClick={AcceptRequest}>Accept Request</button>
            </div>
        </Popup>
    );

    const fetchPartner = async () => {
        try {
            const response = await axios.post("http://localhost:5000/partnerships/getpartner", { userId: user.user_id });
                if(!response.data.message) {
                setPartner(response.data.partner);
            }
        } catch (error) {
            console.error(error);
        }
    }
    const fetchRequests = async () => {
        try {
            const response = await axios.post("http://localhost:5000/requests/getincomingrequests", { userId: user.user_id });
            if(!response.data.message) {
                setIncomingRequests(response.data.incoming);
            }
            const response2 = await axios.post("http://localhost:5000/requests/getoutgoingrequests", { userId: user.user_id });
            if(!response2.data.message) {
                setOutgoingRequests(response2.data.outgoing);
            }
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
            {showConfirmRemovePopup && removePartnerPopupObj /* Popup that shows when removing your partner */ }
            {showRequestPopup && requestPartnerPopupObj /* Popup that shows when creating a partner request */ }
            {existingRequestPopup && acceptExistingRequestPopupObj /* Popup that shows when you accept an existing request (when making a request) */ }
            {acceptOverridingRequestPopup && acceptOverridingRequestPopupObj /* Popup that shows when you accept a request but you already have a partner */ }
            {acceptRequestPopup && acceptRequestPopupObj /* Popup that shows when you accept a request */ }
            <Header user={props.user} setUser={props.setUser} />
            <main className={styles.main}>
                <AccountSidebar user={props.user} setUser={props.setUserr} />
                <section>
                    <h1>Partner</h1>
                    <div className={styles.partner_section}>
                        <p>Current Partner: {partner ? partner.email : "Unassigned."}</p>
                        {!partner && <button className={styles.add_request_button} onClick={() => { setShowRequestPopup(true); }}>Request by E-mail</button>}
                        {partner && <button className={styles.remove_button} onClick={() => { setShowConfirmRemovePopup(true); }}>Remove Partner</button>}
                    </div>
                    <div className={styles.requests_section}>
                        <div>
                            <h2>Incoming Requests</h2>
                            {incomingRequests.map(function(request, i) {
                                return <div className={styles.request} key={i}>
                                            <p>{request.requesting_user_email}</p>
                                       </div>;
                            })}
                        </div>
                        {!partner && 
                            <div>
                                <h2>Outgoing Requests</h2>
                                {outgoingRequests.map(function(request, i) {
                                    return <div className={styles.request} key={i}>
                                                <p>{request.requested_user_email}</p>
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