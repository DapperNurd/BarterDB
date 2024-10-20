import React, { useState, useEffect } from 'react'
import styles from './EditableCell.module.css';

export default function EditableCell({ getValue }) {
        const initialValue = getValue();
        const [value, setValue] = useState(initialValue);

    return (
        <>
            <input
                className={styles.input}
                value={value}
                onChange={e => {
                    setValue(e.target.value);
                }}
            />
        </>
    );
}