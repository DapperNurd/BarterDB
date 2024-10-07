import React, {useState} from 'react';
import headerStyles from './Header.module.css';
import navStyles from './Nav.module.css';
import headerButtonsStyles from './Header_Buttons.module.css';

import { Link } from 'react-router-dom';

export default function Header() {
    return (
        <header className={headerStyles.header}>
            <div className={headerStyles.title}>
                <Link to="/" className={headerStyles.header_logo}>BarterDB</Link>
            </div>

            <nav className={navStyles.nav}>
                <ul>
                    <li key="home"><Link to="/">Home</Link></li>
                    <li key="about"><Link to="/about">About</Link></li>
                    <li key="contact"><Link to="/contact">Contact</Link></li>
                </ul>
            </nav>

            <div className={headerButtonsStyles.header_buttons}>
                <Link to="/signin" className={headerButtonsStyles.header_button}>Sign In</Link>
            </div>
        </header>
    );
}