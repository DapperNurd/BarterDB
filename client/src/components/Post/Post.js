import React, {useState} from 'react';
import styles from './Post.module.css';

export default function Post(props) {

    const isUsers = props.isUsers ?? false;

    const OpenPost = () => {
        if(props.setShowPopup) {
            props.setData({
                post_id: props.data.post_id,
                offering: props.data.offering_item_name,
                offeringAmount: props.data.offering_amount,
                requesting: props.data.requesting_item_name,
                requestingAmount: props.data.requesting_amount,
                isNegotiable: props.data.is_negotiable,
                createdAt: props.data.created_at,
                updatedAt: props.data.updated_at,
                matchPost: props.data.matching_post_id
            })

            props.setShowPopup(true);
        }
    }

    const date = () => {
        if(props.data.created_at == props.data.updated_at) {
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
            {props.data.is_negotiable > 0 && <div className={styles.post_line}><em>{isUsers ? "Willing to negotiate." : "Negotiating."}</em></div>}
            {date()}
        </button>
    );
}