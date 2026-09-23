import { BrowserRouter, Routes, Route} from 'react-router-dom'
import Login from './pages/Auth/Login';
import Register from './pages/Auth/Register';
import Dashboard from './pages/User/Dashboard';
import Navbar from './components/Navbar/Navbar';
import Home from './pages/Home/Home';

import ProtactRoute from './components/protactRoute';


function App(){
    return(
      
      <BrowserRouter>
        <Routes>

            <Route path='/' element={<Home/>}/>

            <Route path='/login' element={
              <>
              <Navbar/>
              <Login/>
              </>
              }/>
            <Route path='/register' element={ 
              <>
              <Navbar/>
              <Register/>
              </>
              }/>
            <Route path='/dashboard' element={
              <ProtactRoute>
                 <Dashboard/>
              </ProtactRoute>
             
              
              }/>

        </Routes>
        
      </BrowserRouter>
    )
}

export default App;