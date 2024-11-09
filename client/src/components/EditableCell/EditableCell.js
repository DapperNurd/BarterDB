import React, { useEffect, useState } from 'react'
import styles from './EditableCell.module.css';

export default function EditableCell({ getValue, row, column, table }) {

    const initialValue = getValue();
    
    const [value, setValue] = useState(initialValue);

    useEffect(() => {
        setValue(initialValue);
    }, [initialValue]);

    const onBlur = () => {
        table.options.meta?.updateData(row, column, value);
    }

    return (
        <>
            <input
                className={styles.input}
                value={value}
                onBlur={onBlur}
                onChange={e => {
                    setValue(e.target.value);
                }}
            />
        </>
    );
}