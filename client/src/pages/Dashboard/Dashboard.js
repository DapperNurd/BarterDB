import Header from "../../components/Header/Header";
import Footer from "../../components/Footer/Footer";

import styles from "./Dashboard.module.css";
import { useEffect, useState } from "react";
import { Navigate  } from 'react-router-dom';
import axios from 'axios';

export default function Dashboard() {

    return (
        <>
            <Header />
            <main className={"main " + styles.main}>
                <h1>Dashboard</h1>
            </main>
            <Footer />
        </>
    );
}