import {use, useEffect, useState} from 'react';
import{Link} from 'react-router-dom';
import API from '../../service/API';
import './Profile.css';
import axios from 'axios';

function Profile(){

    const [user, setUser] = useState(null)
    const [balance, setBalance] = useState(0)

    useEffect(()=>{
        const userData = localStorage.getItem("user");

        if (userData){
            setUser(JSON.parse(userData))
        }
    },[]);


    useEffect(()=>{
        if(! user) return;

        getWallet();
    },[user]);

    const getWallet = async ()=>{
        try{
            const response = await axios.get(
                "http://localhost:8000/api/subscription/wallet",{
                    params:{
                        user_id:user.user.id
                    }
                }
            );

            setBalance(
                response.data.wallet_ballance
            )

            console.log(response)

        }
        catch(error){
            console.log(error)
        }
    };

    if(!user){
        return(
            <div className="profile-page">
                <h2>Loding Profile.....</h2>
            </div>
        );
    }

    return(

        <div className="profile-page">
            <div className="profile-card">

                {/* profile headder */}
                <div className="profile-header">
                    <div className="profile-image">
                        {user.user.name?.charAt(0)}
                    </div>
                    <h1>
                        {user.user.name}
                    </h1>
                    <p>
                        {user.user.email}
                    </p>
                </div>

                {/* account information */}
                <div className="profile-section">
                    <h1>Account Information</h1>

                    <div className="profile-row">
                        <span>Name</span>
                        <strong>
                            {user.user.name}
                        </strong>
                    </div>

                      <div className="profile-row">
                        <span>Email</span>
                        <strong>
                            {user.user.email}
                        </strong>
                    </div>

                      <div className="profile-row">
                        <span>Role</span>
                        <strong>
                            {user.user.role}
                        </strong>
                    </div>

                    {/* Wallet */}

                    <div className="profile-section">
                        <h2>
                            Wallet
                        </h2>

                        <div className="wallet-box">
                            <span>
                                Current Ballance
                            </span>

                            <strong>
                                {balance} Credits
                            </strong>
                        </div>
                        <Link to="/wallet">
                            View Wallet History
                        </Link>
                    </div>

                </div>


            </div>
        </div>
    )



}
export default Profile;