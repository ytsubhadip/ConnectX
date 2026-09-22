import { BrowserRouter, Routes, Route} from 'react-router-dom'
import Login from './pages/Auth/Login';
import Register from './pages/Auth/Register';
import Dashboard from './pages/User/Dashboard';
import Navbar from './components/Navbar/Navbar';
import Home from './pages/Home/Home';


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
            <Route path='/dashboard' element={ <Dashboard/>}/>

        </Routes>
        
      </BrowserRouter>
    )
}

export default App;