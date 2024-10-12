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

    const [user, setUser] = useState(null);
	const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
		const getLoginStatus = async () => {
			try {
				const response = await axios.get("http://localhost:5000/api/login");
				setUser(response.data.user);
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
					<Route index element={<Home user={user} setUser={setUser}/>} />
					<Route path="/home" element={<Home user={user} setUser={setUser} />} />
					<Route path="/login" element={user ? <Navigate to="/dashboard"/> : <Signin  user={user} setUser={setUser}/>} />
					<Route path="/signup" element={user ? <Navigate to="/dashboard"/> : <Signup user={user} setUser={setUser} />} />
					<Route path="/dashboard" element={user ? <Dashboard user={user} setUser={setUser} /> : <Navigate to="/"/>} />
					<Route path="/account" element={user ? <Account user={user} setUser={setUser} /> : <Navigate to="/"/>} />
					<Route path="*" element={<Error />} />
				</Routes>
			</div>
		</>
	);
}

export default App;
