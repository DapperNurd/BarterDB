import React from 'react';
import { Link } from 'react-router-dom';

import headerStyles from './Header.module.css';

export default function BasicHeader() {

    return (
        <header className={headerStyles.header}>
            <div className={headerStyles.title}>
                <Link to="/" className={headerStyles.header_logo}>BarterDB</Link>
            </div>
        </header>
    );
}