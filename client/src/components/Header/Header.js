import React, {useState} from 'react';
import './Header.css';

export default function Header() {
    return (
        <header className="header">
            <a to="/" className="header_logo">BarterDB</a>

            <nav className="nav">
                <ul>
                    <li key="home"><a href="/" className="nav-item">Home</a></li>
                    <li key="about"><a href="/about" className="nav-item">About</a></li>
                    <li key="contact"><a href="/contact" className="nav-item">Contact</a></li>
                </ul>
            </nav>

            <div className="header_button">
                <button className="button">Sign In</button>
            </div>
        </header>
    );
}