import './App.css';
import { Routes, Route } from 'react-router-dom';
import { useState, useEffect } from 'react';
import axios from 'axios';
import { Navigate } from 'react-router-dom';

import Home from './pages/Home/Home';
import Signin from './pages/Signin/Signin';
import Signup from './pages/Signup/Signup';
import Dashboard from './pages/Dashboard/Dashboard';
import Account from './pages/Account/Account';
import Error from './pages/Error/Error';

function App() {

	axios.defaults.withCredentials = true;

    const [loginStatus, setLoginStatus] = useState(false);
	const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
		const getLoginStatus = async () => {
			try {
				const response = await axios.get("http://localhost:5000/login");
				setLoginStatus(response.data.loggedIn);
				setIsLoading(false);
			}
			catch(err) {
				console.error("Error occurred:", err);
				setIsLoading(false);
			}
		}
        getLoginStatus();
    }, []);

	{isLoading && <div>Loading...</div>}
  
	return !isLoading && (
		<>
			<div className="container">
				<Routes>
					<Route index element={<Home />} />
					<Route path="/home" element={<Home />} />
					<Route path="/signin" element={loginStatus ? <Navigate to="/dashboard"/> : <Signin />} />
					<Route path="/signup" element={loginStatus ? <Navigate to="/dashboard"/> : <Signup />} />
					<Route path="/dashboard" element={loginStatus ? <Dashboard /> : <Navigate to="/"/>} />
					<Route path="/account" element={loginStatus ? <Account /> : <Navigate to="/"/>} />
					<Route path="*" element={<Error />} />
				</Routes>
			</div>
		</>
	);
}

export default App;
