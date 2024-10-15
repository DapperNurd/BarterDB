import axios from 'axios';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import BasicHeader from "../../components/Header/BasicHeader";
import Footer from "../../components/Footer/Footer";

import styles from "./Signin.module.css";

import { Link } from 'react-router-dom';

export default function Signin(props) {

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const [loginStatus, setLoginStatus] = useState(" "); // This is an white-space char, so the auto height still considers it.

	let navigate = useNavigate();
	axios.defaults.withCredentials = true;

    const login = async () => {
		if(email === "" || password === "") {
			setLoginStatus("Please fill in all required (*) fields."); // this is a temp notification thing
			return;
		}

		await axios.post("http://localhost:5000/users/login", {
			email: email,
			password: password,
		}, { withCredentials: true })
		.then(async (response) => {
			setLoginStatus(response.data.message ?? response.data.userId);
			if(!response.data.message) {
				const user = await axios.post("http://localhost:5000/users/get-user", { userId: response.data.userId });
				if(!user.data.message) {
					props.setUser(user.data.user);
				}
				navigate("/dashboard");
			}
		})
		.catch((error) => {
			setLoginStatus(" ");
		});
    }

	useEffect(() => {
		axios.get("http://localhost:5000/users/login").then((response) => {
			if(response.data.loggedIn === true) {
				setLoginStatus(response.data.userId);
			}
		});
	}, []);

    return (
        <>
            <BasicHeader />
            <main className={styles.main}>
				<div className={styles.section}>
					<div className={styles.header}>
						<h1>Login</h1>
						<div className={styles.status}>{loginStatus}</div>
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

					<button onClick={login}>Login</button>
					
					<div className={styles.link}><Link to="/signup">Don't have an account? Sign up</Link></div>
				</div>
            </main>
            <Footer />
        </>
    );
}