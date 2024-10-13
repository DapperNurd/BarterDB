import React, {useState} from 'react';
import styles from './Footer.module.css';

export default function Footer(props) {
    return (
        <footer className={styles.footer}>
            &copy; { new Date().getFullYear() } Ben Bonus, Davin Lewis • Built with React & ExpressJS        </footer>
    );
}