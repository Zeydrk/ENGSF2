// import react library/components
import { useEffect, useState } from 'react'
import './App.css'
import {BrowserRouter as Router, Route, Routes } from 'react-router-dom'

// Importing components
import Login from './components/Login'
import Register from './components/Register'
import ProtectedRoute from './components/ProtectedRoute'
import Home from './components/Home'

import Navbar from './components/Navbar'  
import Product from './components/Products'
import ProductPage from './components/ProductPage';

const ProtectedLayout = ({ children, onLogout }) => (
  <>
    <Navbar onLogout={onLogout} />
    {children}
  </>
);

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(() =>  {
    return localStorage.getItem('isLoggedIn') === 'true';
  });

  // learn what is useEffecr later
  // useEffect(() => {
  //   const loggedIn = localStorage.getItem('isLoggedIn') == "true";
  //   setIsLoggedIn(loggedIn);
  // }, [])


  // Handler for login state change
  const handleLogin = () => {
    setIsLoggedIn(true);
    localStorage.setItem('isLoggedIn', 'true');
  }

  // Handler for logout state change
  const handleLogout = () => {
    setIsLoggedIn(false);
    localStorage.removeItem("isLoggedIn");
  }


  return (
    
    <Router>
      <Routes>
        {/* Public route */}
        <Route path="/login" element={<Login onLogin={handleLogin}/>} />
        <Route path="/register" element={<Register />} />
        {/* Protected routes are here */}
        <Route path="/" element=
          {
            <ProtectedRoute isAuthenticated={isLoggedIn}>
              <Home />
            </ProtectedRoute>
          }/>
        <Route
            path="/product"
            element={
              <ProtectedLayout onLogout={handleLogout}>
                <Product />
              </ProtectedLayout>
            }
          />
        <Route
            path="/product/:id"
            element={
              <ProtectedLayout onLogout={handleLogout}>
                <ProductPage />
              </ProtectedLayout>
            }
          />
      </Routes>
    </Router>
  )
}

export default App
