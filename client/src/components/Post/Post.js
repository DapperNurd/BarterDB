import React, {useState} from 'react';
import styles from './Post.module.css';

export default function Post(props) {

    const OpenPost = () => {
        if(props.setShowPopup) {
            console.log(props.data);
            props.setData({
                post_id: props.data.post_id,
                offering: props.data.offering_item_name,
                offeringAmount: props.data.offering_amount,
                requesting: props.data.requesting_item_name,
                requestingAmount: props.data.requesting_amount,
                isNegotiable: props.data.is_negotiable,
                createdAt: props.data.created_at
            })
            console.log(props.data.is_negotiable);
            props.setShowPopup(true);
        }
    }

    return props.data && (
        <button className={styles.post} onClick={OpenPost}>
            <div className={styles.post_line}>
                <div className={styles.post_label}>Offering Item:</div>
                <div className={`${styles.post_item} ${styles.offering_item}`}>{props.data.offering_item_name}</div>
                <div className={styles.post_amt}>{props.data.offering_amount > 1? "x" + props.data.offering_amount : ""}</div>
            </div>
            <div className={styles.post_line}>
                <div className={styles.post_label}>Requesting Item:</div>
                <div className={`${styles.post_item} ${styles.requesting_item}`}>{props.data.requesting_item_name}</div>
                <div className={styles.post_amt}>x{props.data.requesting_amount}</div>
            </div>
            {props.data.is_negotiable > 0 && <div className={styles.post_line}><em>Willing to negotiate.</em></div>}
            <div> Created on: 
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
        </button>
    );
}