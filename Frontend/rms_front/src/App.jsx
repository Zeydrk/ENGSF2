// import react library/components
import { useEffect, useState } from 'react'
import './App.css'
import Toasters from './components/Toasters'
import {BrowserRouter as Router, Route, Routes } from 'react-router-dom'


// Importing components
import Login from './components/Login/Login'
import Register from './components/Register/Register'
import ProtectedRoute from './components/ProtectedRoute'
import Home from './components/Home'
import Navbar from './components/Navbar'  
import Product from './components/Products'
import Sellers from "./components/Sellers";
import ProductPage from './components/ProductPage';
import Forgot from './components/Login/Forgot'
import Reset from './components/Login/Reset'
import Package from './components/Package'
import PackagePage from './components/PackagePage'

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
              <Navbar/>
              <Home />
            </ProtectedRoute>
          }/>
         <Route path='/package' element={<Package/>}/>
        <Route path='/package/:id' element={<PackagePage/>}/>
        <Route
            path="/product"
            element={
              <ProtectedRoute isAuthenticated={isLoggedIn}>
                <Navbar/>
                <Product />
              </ProtectedRoute>
            }
          />
        <Route
            path="/scan/:id"
            element={
              <ProtectedRoute isAuthenticated={isLoggedIn}>
                <Navbar/>
                <ProductPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/seller"
            element={
              <ProtectedLayout isAuthenticated={isLoggedIn}>
                <Navbar/>
                <Sellers />
              </ProtectedLayout>
            }
          />
        
        <Route path="/forgot-password/" element={<Forgot />} />
        <Route path="/reset-password/" element={<Reset />} />
      </Routes>
    </Router>
  )
}

export default App
