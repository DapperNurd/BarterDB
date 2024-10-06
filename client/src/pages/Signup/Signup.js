import axios from 'axios';
import { useEffect, useState } from 'react';

import Header from "../../components/Header/Header";
import Footer from "../../components/Footer/Footer";

import "./Signup.css";

export default function Signup() {

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    
    const register = () => {
        if(email === "" || password === "") {
          alert("Please fill in all fields"); // this is a temp notification thing
          return;
        }

      axios.post("http://localhost:5000/register", {
        email: email,
        password: password,
      }).then((response) => {
        console.log(response);
      });
    }

    return (
        <>
            <Header />
            <main className="main">
                <h1>Signup</h1>
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
                <button onClick={register}>Register</button>
            </main>
            <Footer />
        </>
    );
}