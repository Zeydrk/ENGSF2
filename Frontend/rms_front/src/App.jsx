// import react library/components
import { useState } from 'react'
import './App.css'
import {BrowserRouter as Router, Route, Routes } from 'react-router-dom'

// Importing components
import Login from './components/Login'
import Register from './components/Register'
// import Product from './components/Products'



function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  return (
    
    <Router>
      <Routes>
        {/* Public route */}
        <Route path="/" element={<Login onLogin={() => setIsLoggedIn(true)}/>} />
        <Route path="/register" element={<Register />} />
      </Routes>
    </Router>
  )
}

export default App
