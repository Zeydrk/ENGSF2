// import react library/components
import { useState } from 'react'
import './App.css'
import {createBrowserRouter, BrowserRouter as Router, Route, Routes, BrowserRouter } from 'react-router-dom'

// Importing components
import Login from './components/Login'



function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  return (
    
    <Router>
      <Routes>
        {/* Public route */}
        <Route path="/" element={<Login onLogin={() => setIsLoggedIn(true)}/>} />
      </Routes>
    </Router>
  )
}

export default App
