import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';

import headerStyles from './Header.module.css';
import avatarImg from '../../images/avatar.png';

export default function Basic_Header() {

    return (
        <header className={headerStyles.header}>
            <div className={headerStyles.title}>
                <Link to="/" className={headerStyles.header_logo}>BarterDB</Link>
            </div>
        </header>
    );
}