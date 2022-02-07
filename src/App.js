import './App.css';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom'
import Chat from './Chat';
import Login from './Login';
import Header from './Header';
import Home from './Home'


function App() {

  return (
    <div className='App'>
      <Router>
        <Header />
        <Routes>
          <Route path='/' element={<Home />}/>
          <Route path='/login' element={<Login />}/>
          <Route path='/chat' element={<Chat />}/>
        </Routes>
      </Router>
    </div>
    
  );
}

export default App;
