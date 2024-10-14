import './App.css';
import { Routes, Route } from 'react-router-dom';
import { useState, useEffect } from 'react';
import axios from 'axios';
import { Navigate } from 'react-router-dom';

import Home from './pages/Home/Home';
import Signin from './pages/Signin/Signin';
import Signup from './pages/Signup/Signup';
import Dashboard from './pages/Dashboard/Main/Dashboard';
import ActiveDashboard from './pages/Dashboard/Active/ActiveDashboard';
import HistoryDashboard from './pages/Dashboard/History/HistoryDashboard';
import PostsDashboard from './pages/Dashboard/Posts/PostsDashboard';
import AccountSettings from './pages/AccountSettings/AccountSettings';
import AccountPartnership from './pages/AccountPartnership/AccountPartnership';
import Error from './pages/Error/Error';

function App() {

	axios.defaults.withCredentials = true;

    const [user, setUser] = useState(null);
	const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
		const getLoginStatus = async () => {
			try {
				// Basically, the session stores two values: whether they are logged in, and if so, their userId.
				// Then, we use that userId to get the user's info from the database.
				// This is so info that might change on a whim is not saved in the otherwise static session.
				const session = await axios.get("http://localhost:5000/users/login");
				const user = await axios.post("http://localhost:5000/users/getuser", { userId: session.data.userId });
				if(!user.data.message) {
					setUser(user.data.user);
				}
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
					<Route path="/dashboard" element={user ? <Dashboard user={user} setUser={setUser} /> : <Navigate to="/login"/>} />
					<Route path="/dashboard/posts" element={user ? <PostsDashboard user={user} setUser={setUser} /> : <Navigate to="/login"/>} />
					<Route path="/dashboard/active" element={user ? <ActiveDashboard user={user} setUser={setUser} /> : <Navigate to="/login"/>} />
					<Route path="/dashboard/history" element={user ? <HistoryDashboard user={user} setUser={setUser} /> : <Navigate to="/login"/>} />
					<Route path="/account" element={user ? <AccountSettings user={user} setUser={setUser} /> : <Navigate to="/login"/>} />
					<Route path="/account/partnership" element={user ? <AccountPartnership user={user} setUser={setUser} /> : <Navigate to="/login"/>} />
					<Route path="*" element={<Error />} />
				</Routes>
			</div>
		</>
	);
}

export default App;
