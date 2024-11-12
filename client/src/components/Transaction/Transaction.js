import React, {useEffect, useState} from 'react';
import styles from './Transaction.module.css';
import axios from 'axios';

export default function Transaction(props) {

    let user = props.user;

    const [ownsPrimaryPost, setOwnsPrimaryPost] = useState(false);

    const [primaryPost, setPrimaryPost] = useState({});
    const [secondaryPost, setSecondaryPost] = useState({});

    const CheckOwnership = async () => {
        const ownershipResponse = await axios.post("http://localhost:5000/posts/get-post-owner", { userId: user.user_id, postId: props.data.primary_post_id });
        if(ownershipResponse.data.isOwner) {
            setOwnsPrimaryPost(true);
        }
    }

    const GetPosts = async () => {
        const primaryPostResponse = await axios.post("http://localhost:5000/posts/get-post", { postId: props.data.primary_post_id });
        if(primaryPostResponse.data.message) {
            console.log('Error: Failed to get primary post.');
            return;
        }
        setPrimaryPost(primaryPostResponse.data.post);

        const secondaryPostResponse = await axios.post("http://localhost:5000/posts/get-post", { postId: props.data.secondary_post_id });
        if(secondaryPostResponse.data.message) {
            console.log('Error: Failed to get secondary post.');
            return;
        }
        setSecondaryPost(secondaryPostResponse.data.post);
    }

    useEffect(() => {
        CheckOwnership();
        GetPosts();
    }, []); // eslint-disable-line react-hooks/exhaustive-deps

    // ----------- props.data example --------------
    // created_at: "2024-11-11T00:33:59.000Z"
    // hash_code: "0000000000000000"
    // primary_post_id: 89
    // proposing_primary_offer_amt: null
    // proposing_primary_request_amt: null
    // proposing_user_id: null
    // secondary_post_id: 87
    // state: 0
    // primary_approved: 0
    // secondary_approved: 0
    // transaction_id: 6
    // updated_at: "2024-11-11T00:33:59.000Z"

    const OpenPost = () => {
        if(props.setShowPopup) {
            props.setData({
                transaction_id: props.data.transaction_id,
                primary_post: primaryPost,
                secondary_post: secondaryPost,
                hash_code: props.data.hash_code,
                state: props.data.state,
                primary_approved: props.data.primary_approved,
                secondary_approved: props.data.secondary_approved,
                proposing_post_id: props.data.proposing_post_id,
                proposing_primary_request_amt: props.data.proposing_primary_request_amt,
                proposing_primary_offer_amt: props.data.proposing_primary_offer_amt,
                createdAt: props.data.created_at,
                updatedAt: props.data.updated_at,
                ownsPrimaryPost: ownsPrimaryPost,
            })

            props.setShowPopup(true);
        }
    }

    const date = () => {
        if(props.data.created_at === props.data.updated_at) {
            return  <div> Created at: 
                        <time>{
                            new Date(props.data.created_at).toLocaleDateString('en-US', { 
                                year: 'numeric', 
                                month: 'long', // Full month name
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                            })
                        }</time>
                    </div>
        }
        else {
            return  <div> Updated at: 
                        <time>{
                            new Date(props.data.updated_at).toLocaleDateString('en-US', { 
                                year: 'numeric', 
                                month: 'long', // Full month name
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                            })
                        }</time>
                    </div>
        }
    }

    // const hash = ownsPrimaryPost ? props.data.hash_code.substring(0, 8) : props.data.hash_code.substring(8, 16);

    const userHasApproved = (ownsPrimaryPost && props.data.primary_approved) || (!ownsPrimaryPost && props.data.secondary_approved);

    const workingTransaction = ownsPrimaryPost ? primaryPost : secondaryPost;

    const offeringAmt = ownsPrimaryPost ? props.data.proposing_primary_offer_amt ?? workingTransaction.offering_amount : props.data.proposing_primary_request_amt ?? workingTransaction?.offering_amount;
    const requestingAmt = ownsPrimaryPost ? props.data.proposing_primary_request_amt ?? workingTransaction.requesting_amount : props.data.proposing_primary_offer_amt ?? workingTransaction?.requesting_amount;

    const negotiating = primaryPost.is_negotiable > 0 && secondaryPost.is_negotiable > 0;

    return props.data && (
        <button className={styles.post} onClick={OpenPost}>
            {negotiating && props.data.state <= 0 && props.data.proposing_post_id && props.data.proposing_post_id !== workingTransaction.post_id && <div className={styles.post_line}><em>NEW PROPOSAL</em></div>}
            <div className={styles.post_line}>
                <div className={styles.post_label}>Trading:</div>
                <div className={`${styles.post_item} ${styles.offering_item}`}>{workingTransaction.offering_item_name}</div>
                <div className={styles.post_amt}>x{offeringAmt}</div>
            </div>
            <div className={styles.post_line}>
                <div className={styles.post_label}>For:</div>
                <div className={`${styles.post_item} ${styles.requesting_item}`}>{workingTransaction.requesting_item_name}</div>
                <div className={styles.post_amt}>x{requestingAmt}</div>
            </div>
            {negotiating && <div className={styles.post_line}><em>Negotiating.</em></div>}
            {props.data.state <= 0 && <div className={styles.post_line}><em>{(!userHasApproved) ? "Awaiting your approval." : "Awaiting other party's approval."}</em></div>}
            {/* {date()} */}
        </button>
    );
}