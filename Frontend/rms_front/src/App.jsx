// import react library/components
import { useEffect, useState } from 'react'
import './App.css'
import Toasters from './components/Toasters'
import {BrowserRouter as Router, Route, Routes } from 'react-router-dom'


// Importing components
import Login from './components/Login'
import Register from './components/Register'
import ProtectedRoute from './components/ProtectedRoute'
<<<<<<< HEAD
<<<<<<< HEAD
import Product from './components/Products'
import Home from './components/Home'
import ProductPage from './components/ProductPage';
import Forgot from './components/Forgot'
import Reset from './components/Reset'
=======
=======
>>>>>>> 3541a7437bf7e6550ae9264cab7c018047376f6a
import Home from './components/Home'

import Navbar from './components/Navbar'  
import Product from './components/Products'
import Sellers from "./components/Sellers";
import ProductPage from './components/ProductPage';
import Forgot from './components/Forgot'
import Reset from './components/Reset'
import Package from './components/Package'
import PackagePage from './components/PackagePage'
<<<<<<< HEAD
>>>>>>> main
=======
>>>>>>> 3541a7437bf7e6550ae9264cab7c018047376f6a

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
<<<<<<< HEAD
<<<<<<< HEAD
        <Route path='/product' element={<Product/>}/>
        <Route path='/product/:id' element={<ProductPage/>}/>
        <Route path="/forgot-password/" element={<Forgot />} />
        <Route path="/reset-password/" element={<Reset />} />
=======
=======
>>>>>>> 3541a7437bf7e6550ae9264cab7c018047376f6a
         <Route path='/package' element={<Package/>}/>
        <Route path='/package/:id' element={<PackagePage/>}/>
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
          <Route
            path="/seller"
            element={
              <ProtectedLayout onLogout={handleLogout}>
                <Sellers />
              </ProtectedLayout>
            }
          />
       
<<<<<<< HEAD
>>>>>>> main
=======
        <Route path="/forgot-password/" element={<Forgot />} />
        <Route path="/reset-password/" element={<Reset />} />
>>>>>>> 3541a7437bf7e6550ae9264cab7c018047376f6a
      </Routes>
    </Router>
  )
}

export default App
