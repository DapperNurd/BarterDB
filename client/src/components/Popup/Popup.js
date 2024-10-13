import React, {useState} from 'react';
import styles from './Popup.module.css';

export default function Popup(props) {

    const [id, setId] = useState(-1);

    return (
        <>
            <button className={styles.popup_bg} onClick={() => { props.trigger(false); }}/> {/* This button is used as the background to close the popup */}
            <div className={styles.popup}>
                <button className={styles.close_button} onClick={() => props.trigger(false)}><img src="/images/close_button.png" alt="Close" width="30px"></img></button>
                {props.children}
            </div>
        </>
    );
}