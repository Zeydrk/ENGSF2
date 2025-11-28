// import react library/components
import { useEffect, useState } from 'react'
import './App.css'
import Toasters from './pages/Toasters'
import {BrowserRouter as Router, Route, Routes } from 'react-router-dom'


// Importing components
import Login from './pages/Login'
import Register from './pages/Register'
import ProtectedRoute from './pages/ProtectedRoute'
import Home from './pages/Home'
import Navbar from './pages/components/navbar'  
import Product from './pages/Products'
import Sellers from "./pages/seller/Sellers";
import ProductPage from './pages/ProductPage';
import Forgot from './pages/Forgot'
import Reset from './pages/Reset'
import Package from './pages/package/Package'


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
      <Toasters/>
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
         <Route path='/package' element={<Package/>}/>
        
        <Route
            path="/product"
            element={
              <ProtectedLayout onLogout={handleLogout}>
                <Product />
              </ProtectedLayout>
            }
          />
        <Route
            path="/scan/:id"
            element={
              <ProtectedLayout onLogout={handleLogout}>
                <ProductPage />
              </ProtectedLayout>
            }
          />
          <Route
            path="/seller"
            element={
              <ProtectedRoute isAuthenticated={isLoggedIn}>
                <Sellers />
              </ProtectedRoute>
            }
          />
        <Route path="/forgot-password/" element={<Forgot />} />
        <Route path="/reset-password/" element={<Reset />} />
      </Routes>
    </Router>
  )
}

export default App
