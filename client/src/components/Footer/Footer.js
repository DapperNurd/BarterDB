import React, {useState} from 'react';
import styles from './Footer.module.css';

function Footer() {
    return (
        <footer className={styles.footer}>
            &copy; { new Date().getFullYear() } Ben Bonus, Davin Lewis • Built with NodeJS & Express
        </footer>
    );
}

export default Footer;