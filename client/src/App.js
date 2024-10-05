import './App.css';
import axios from 'axios';
import { useEffect, useState } from 'react';
import Header from './components/Header';
import Footer from './components/Footer';

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

        <Header />
        
        <main className="main">
          {listOfPosts.map((value, key) => {return <div>{value.email}</div>})}
          {/* <%- body %> */}
        </main>

        <Footer />

    </div>
  );
}

export default App;
