import axios from 'axios';
import { useEffect, useState } from 'react';

import Header from "../../components/Header/Header";
import Footer from "../../components/Footer/Footer";

import "./Signin.css";

import { Link } from 'react-router-dom';

export default function Signin() {

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const [loginStatus, setLoginStatus] = useState("");
    
    const login = () => {
      if(email === "" || password === "") {
        alert("Please fill in all fields"); // this is a temp notification thing
        return;
      }

      axios.post("http://localhost:5000/login", {
        email: email,
        password: password,
      }).then((response) => {
        console.log(response);
        setLoginStatus(response.data.message);
      }).catch((error) => {
        console.error("Error occurred:", error);
      });
    }

    return (
        <>
            <Header />
            <main className="main">
                <h1>Sign In</h1>
                
                <label>Email</label>
                <input 
                  type="email"
                  placeholder='Email'
                  onChange = {(e) => {
                    setEmail(e.target.value);
                  }} 
                />
                
                <br/>
                
                <label>Password</label>
                <input 
                  type="password"
                  placeholder='Password'
                  onChange = {(e) => {
                    setPassword(e.target.value);
                  }} 
                />
                <br/>

                <button onClick={login}>Register</button>
                
                <div className="text_link"><Link to="/signup">Create an Account</Link></div>

                <h1>{loginStatus}</h1>
                
            </main>
            <Footer />
        </>
    );
}