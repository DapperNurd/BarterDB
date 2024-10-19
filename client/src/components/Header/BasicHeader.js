import React from 'react';
import { Link } from 'react-router-dom';

import headerStyles from './Header.module.css';

export default function BasicHeader() {

    // Basic Header shows only the BarterDB logo and no links or account icons
    // - Is for use on login/register pages

    return (
        <header className={headerStyles.header}>
            <div className={headerStyles.title}>
                <Link to="/" className={headerStyles.header_logo}>BarterDB</Link>
            </div>
        </header>
    );
}