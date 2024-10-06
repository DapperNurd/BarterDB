import React, {useState} from 'react';
import './Header.css';

import { Link } from 'react-router-dom';

export default function Header() {
    return (
        <header className="header">
            <div className="title">
                <Link to="/" className="header_logo">BarterDB</Link>
            </div>

            <nav className="nav">
                <ul>
                    <li key="home"><Link to="/" className="nav-item">Home</Link></li>
                    <li key="about"><Link to="/about" className="nav-item">About</Link></li>
                    <li key="contact"><Link to="/contact" className="nav-item">Contact</Link></li>
                </ul>
            </nav>

            <div className="header_buttons">
                <button className="header_button">Sign In</button>
            </div>
        </header>
    );
}