import axios from 'axios';
import { useEffect, useState } from 'react';

import Header from "../../components/Header/Header";
import Footer from "../../components/Footer/Footer";

import styles from "./Signup.module.css";

export default function Signup() {

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    
    const [signinStatus, setSigninStatus] = useState(" "); // This is an white-space char, so the auto height still considers it.

    const register = () => {
		if(email === "" || password === "") {
			setSigninStatus("Please fill in all required (*) fields."); // this is a temp notification thing
			return;
		}

		axios.post("http://localhost:5000/register", {
			email: email,
			password: password,
		})
		.then((response) => {
			setSigninStatus(response.data.message ?? " ");
		})
		.catch((error) => {
			console.error("There was an error with the registration request:", error);
		});;
    }

    return (
        <>
            <Header />
            <main className={styles.main}>
				<div className={styles.section}>
				<div className={styles.header}>
						<h1>Sign Up</h1>
						<div className={styles.status}>{signinStatus}</div>
					</div>

					<label>Email</label>
					<input 
						type="email"
						placeholder='Email'
						onChange = {(e) => {
							setEmail(e.target.value);
						}} 
					/>

					<label>Password</label>
					<input 
						type="password"
						placeholder='Password'
						onChange = {(e) => {
							setPassword(e.target.value);
						}} 
					/>

					<button onClick={register}>Register</button>
				</div>
            </main>
            <Footer />
        </>
    );
}