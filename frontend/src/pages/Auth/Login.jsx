
import { Link, useNavigate } from 'react-router-dom';
import {useState} from 'react'
import axios from 'axios';
import './Login.css'
function Login() {

    const nevigate = useNavigate();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    const hangleLogin = async(e)=>{
        e.preventDefault();
        setError("");
        setSuccess("");
        setLoading("");

        try{
            const response = await axios.post(
                 "http://localhost:8000/api/auth/login",{
                    email:email,
                    password : password
                 }
            );

            console.log(response.data);

            // save user info
            localStorage.setItem("user", JSON.stringify(response.data));

            setSuccess("Login Successfully")

            setTimeout(()=>{
                nevigate("/dashboard")
            }, 500)

        }catch(error){
            console.log(error);

            if(error.response){
                setError(
                    error.response.data.detail ||
                    "Invalid Email or Password"
                )
            }
            else if (error.required){
                setError("Cannot connect to the server")
            }
            else{
                setError("something went wrong")
            }
        }
        finally{
            setLoading(false)
        }
    }



    return (

        <div className='loginDiv'>
            <h1>login</h1>

             {error && (
                <p style={{ color: "red" }}>
                    {error}
                </p>
            )}


            {success && (
                <p style={{ color: "green" }}>
                    {success}
                </p>
            )}

            <form method="post" id="LoginForm" onSubmit={hangleLogin}>
                <input type="text" 
                placeholder="Enter your email"
                value={email}
                onChange={(e)=>{
                    setEmail(e.target.value)
                }} 
                required />

                <input type="text" 
                placeholder="Enter your password" 
                value={password}
                onChange={(e)=>{

                    setPassword(e.target.value)
                    
                }}
                required />



                <button type="submit" disabled={loading}>Login</button>

                <p className='CreateAccountLink'> Create an New Account &nbsp;
                    <Link to="/register">
                        Sign Up
                    </Link>
                </p>


            </form>
        </div>


    )
}
export default Login;