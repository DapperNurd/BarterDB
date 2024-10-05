import React, {useState} from 'react';
import './Footer.css';

function Footer() {
    return (
        <footer class="footer">
            &copy; { new Date().getFullYear() } Ben Bonus, Davin Lewis • Built with NodeJS & Express
        </footer>
    );
}

export default Footer;