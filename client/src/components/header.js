import React, {useState} from 'react';

function Header() {
    return (
        <>
            <header className="header">
                <a to="/" className="header_logo">BarterDB</a>

                <nav className="nav">
                    <a href="/" className="nav-item">Home</a>
                    <a href="/about" className="nav-item">About</a>
                    <a href="/contact" className="nav-item">Contact</a>
                </nav>

                <div className="header_button">
                    <button className="button">Sign In</button>
                </div>
            </header>
        </>
    );
}

export default Header;