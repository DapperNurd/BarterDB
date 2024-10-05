import './App.css';
import axios from 'axios';
import { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';

import Home from './pages/Home/Home';
import About from './pages/About/About';
import Contact from './pages/Contact/Contact';
import Error from './pages/Error/Error';

function App() {

  const [listOfPosts, setListOfPosts] = useState([]);
  
  useEffect(() => {
    axios.get('http://localhost:5000/posts')
      .then(response => {
        console.log(response.data);
        setListOfPosts(response.data);
      })
      .catch(err => console.log(err));

  }, []);
  
  return (
    <div className="container">

        <BrowserRouter>
          <Routes>
            <Route index element={<Home />} />
            <Route path="/home" element={<Home />} />
            <Route path="/about" element={<About />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="*" element={<Error />} />
          </Routes>
        </BrowserRouter>

    </div>
  );
}

export default App;
