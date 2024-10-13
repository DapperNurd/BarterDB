import axios from 'axios';
import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';

import BasicHeader from "../../components/Header/BasicHeader";
import Footer from "../../components/Footer/Footer";

// Note that this shares styles with Signin.js
import styles from "../Signin/Signin.module.css";

export default function Signup(props) {

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    
    const [signinStatus, setSigninStatus] = useState(" "); // This is an white-space char, so the auto height still considers it.

    let navigate = useNavigate();
	axios.defaults.withCredentials = true;

    const register = () => {
		if(email === "" || password === "") {
			setSigninStatus("Please fill in all required (*) fields."); // this is a temp notification thing
			return;
		}

		axios.post("http://localhost:5000/api/register", {
			email: email,
			password: password,
		})
		.then(async (response) => {
			setSigninStatus(response.data.message ?? " ");
			if(response.data.message !== "Email already exists.") { // This is super janky but it works?
				await axios.post("http://localhost:5000/api/login", {
					email: email,
					password: password,
				})
				.then(async (response2) => {
					if(!response2.data.message) {
						const user = await axios.post("http://localhost:5000/api/getuser", { userId: response2.data.userId });
						if(!user.data.message) {
							props.setUser(user.data.user);
						}
						navigate("/dashboard");
					}
				})
				.catch((error) => {
				});
			}	
		})
		.catch((error) => {
			console.error("There was an error with the registration request:", error);
		});;
    }

    return (
        <>
            <BasicHeader />
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

					<div className={styles.link}><Link to="/login">Already have an account? Login</Link></div>
				</div>
            </main>
            <Footer />
        </>
    );
}