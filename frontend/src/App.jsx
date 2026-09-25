import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Login from './pages/Auth/Login';
import Register from './pages/Auth/Register';
import Dashboard from './pages/User/Dashboard';
import Navbar from './components/Navbar/Navbar';
import Home from './pages/Home/Home';
import Profile from './pages/Profile/Profile';
import Subscription from './pages/Subscription/Subscription';
import Wallet from './pages/Wallet/Wallet';

import ProtactRoute from './components/ProtectRoute/ProtactRoute';

function App() {
  return (

    <BrowserRouter>
      <Routes>

        <Route path='/' element={<Home />} />

        <Route path='/login' element={
          <>

            <Login />
          </>
        } />
        <Route path='/register' element={
          <>

            <Register />
          </>
        } />
        <Route path='/dashboard' element={
          <ProtactRoute>
            <Dashboard />
          </ProtactRoute>


        } />

        <Route
          path='/profile'
          element={
            <ProtactRoute>
              <Navbar />
              <Profile />
            </ProtactRoute>
          }
        />

        <Route
          path='/subscription'
          element={
            <ProtactRoute>
              <Navbar />
              <Subscription />
            </ProtactRoute>
          }
        />
        <Route
          path='/wallet'
          element={
            <ProtactRoute>
              <Navbar />
              <Wallet/>
            </ProtactRoute>
          }
        />

      </Routes>

    </BrowserRouter>
  )
}

export default App;