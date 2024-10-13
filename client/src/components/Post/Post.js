import React, {useState} from 'react';
import styles from './Post.module.css';

export default function Post(props) {

    const ClickButton = () => {
        console.log(props.id);
        if(props.setShowPopup) {
            props.setData({
                offering: props.data.offering_item_name,
                offeringAmount: props.data.offering_amount,
                requesting: props.data.requesting_item_name,
                requestingAmount: props.data.requesting_amount,
                isNegotiable: props.data.isNegotiable,
                createdAt: props.data.created_at
            })
            props.setShowPopup(true);
        }
    }

    return props.data && (
        <button className={styles.post} onClick={ClickButton}>
            <div>
                Offering Item: <span className={styles.item}>{props.data.offering_item_name}</span> {props.data.offering_amount > 1? "x" + props.data.offering_amount : ""}
            </div>
            <div>
                Requesting Item: <span className={styles.item}>{props.data.requesting_item_name}</span> {props.data.requesting_amount > 1 ? "x" + props.data.requesting_amount : ""}
            </div>
            {props.data.isNegotiable > 0 && <div>Willing to negotiate.</div>}
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