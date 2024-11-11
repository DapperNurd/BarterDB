import './App.css';
import { Routes, Route, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import axios from 'axios';
import { Navigate } from 'react-router-dom';

import Home from './pages/Home/Home';
import Signin from './pages/Signin/Signin';
import Signup from './pages/Signup/Signup';
import Dashboard from './pages/Dashboard/Dashboard';
import AdminUserDashboard from './pages/Admin/AdminUserDashboard/AdminUserDashboard';
import AccountSettings from './pages/Account/AccountSettings/AccountSettings';
import AccountPartnership from './pages/Account/AccountPartnership/AccountPartnership';
import AccountInventory from './pages/Account/AccountInventory/AccountInventory';
import Error from './pages/Error/Error';
import AdminItemDashboard from './pages/Admin/AdminItemDashboard/AdminItemDashboard';
import AdminTransactionDashboard from './pages/Admin/AdminTransactionDashboard/AdminTransactionDashboard';

export default function App() {

	axios.defaults.withCredentials = true;

    const [user, setUser] = useState(null);
	const [isLoading, setIsLoading] = useState(true);

    let navigate = useNavigate();

    useEffect(() => {
		const getLoginStatus = async () => {
			try {
				// Basically, the session stores two values: whether they are logged in, and if so, their userId.
				// Then, we use that userId to get the user's info from the database.
				// This is so info that might change on a whim is not saved in the otherwise static session.
				const session = await axios.get("http://localhost:5000/users/login");
				const userResult = await axios.post("http://localhost:5000/users/get-user", { userId: session.data.userId });
				if(!userResult.data.message) {
					if(userResult.data.user.access_level < 0) {
						console.log("user is suspended");
						axios.get("http://localhost:5000/users/logout").then((response) => {
							setUser(null);
							navigate("/login");
							return;
						});
					}

					setUser(userResult.data.user);
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
					
					<Route path="/dashboard/admin" element={user ? <AdminUserDashboard user={user} setUser={setUser} /> : <Navigate to="/login"/>} />
					<Route path="/dashboard/admin/items" element={user ? <AdminItemDashboard user={user} setUser={setUser} /> : <Navigate to="/login"/>} />
					<Route path="/dashboard/admin/transactions" element={user ? <AdminTransactionDashboard user={user} setUser={setUser} /> : <Navigate to="/login"/>} />
					
					<Route path="/account" element={user ? <AccountSettings user={user} setUser={setUser} /> : <Navigate to="/login"/>} />
					<Route path="/account/partnership" element={user ? <AccountPartnership user={user} setUser={setUser} /> : <Navigate to="/login"/>} />
					<Route path="/account/inventory" element={user ? <AccountInventory user={user} setUser={setUser} /> : <Navigate to="/login"/>} />
					<Route path="*" element={<Error />} />
				</Routes>
			</div>
		</>
	);
}
