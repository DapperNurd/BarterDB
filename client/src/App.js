import './App.css';
import axios from 'axios';
import { useEffect, useState } from 'react';

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
    <div className="App">
      {listOfPosts.map((value, key) => {return <div>{value.email}</div>})}
    </div>
  );
}

export default App;
