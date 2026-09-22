
import { useState } from 'react';
import { Link, useAsyncError, useNavigate } from 'react-router-dom';
import axios from 'axios'
import './Register.css'
import API from '../../service/Api';


function Register() {
    const nevigate = useNavigate();
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const [loding, setLoding] = useState("");
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("")

    const handleRegister = async (e) => {
        
        e.preventDefault();
        setError("");
        setSuccess("");
        setLoding(true);

        try {
            const response = await axios .post(
                "http://localhost:8000/api/auth/register",
                {
                    name: name,
                    email: email,
                    password: password
                }
            );

            console.log(response.data);

            setSuccess("Register Successfully");

            setTimeout(() => {
                nevigate("/login")
            }, 1000)

        } catch (error) {   

            console.log(error)

            if (error.response) {
                setError(error.response.data.detail ||
                    "Registration Failed"
                )
            }
            else {
                setError("Cannot connect to the server");
            }
        }
        finally {
            setLoding(false)
        }
    }




    return (

        <div className='loginDiv'>
            <h1>Create New Account</h1>

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

            <form method="post" id="LoginForm" onSubmit={handleRegister}>
                <input
                    type="text"
                    placeholder="Enter Your Name"
                    value={name}
                    onChange={(e) =>
                        setName(e.target.value)
                    }
                    required

                />
                <input type="email"
                    placeholder="Enter Your Email"
                    value={email}
                    onChange={(e) =>
                        setEmail(e.target.value)
                    }

                    required />
                <input type="text"
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) =>
                        setPassword(e.target.value)
                    }
                    required />



                <button type="submit" disabled={loding}>

                    {loding
                        ? "Creating account..."
                        : "Register"
                    }
                </button>
                <p className='CreateAccountLink'> Already Create Account &nbsp;
                    <Link to="/login">
                        Sign Up
                    </Link>


                </p>


            </form>
        </div>


    )
}
export default Register;