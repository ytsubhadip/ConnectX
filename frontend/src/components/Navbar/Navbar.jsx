import React from "react";
import { Link, useNavigate } from "react-router-dom";
import "./Navbar.css";

function Navbar() {

  const navigate = useNavigate();

  // Get logged-in user
  const user = JSON.parse(localStorage.getItem("user"));


  const handleLogout = () => {

    localStorage.removeItem("user");

    navigate("/login");
  };


  return (
    <header className="navbar-wrapper">

      <nav className="capsule-nav">

        {/* Left Side */}
        <div className="nav-left">

          <Link
            to="/"
            className="nav-logo"
            aria-label="ConnectX Home"
          >

           

            <span className="logo-text">
              ConnectX
            </span>

          </Link>


          <div className="nav-links">

            {user && (
              <>
                <Link to="/dashboard" className="nav-link">
                  Dashboard
                </Link>

                 <Link to="/document" className="nav-link">
                  My Document
                </Link>
               
              </>
            )}

          </div>

        </div>


        {/* Right Side */}
        <div className="nav-right">

          {!user ? (

            <>
              <Link
                to="/login"
                className="btn-contact"
              >
                Login
              </Link>

              <Link
                to="/register"
                className="btn-get-started-glow"
              >
                Get Started
              </Link>
            </>

          ) : (

            <>
              <Link
                to="/profile"
                className="profile-button"
              >

                <div className="profile-avatar">
                  {user.user.name?.charAt(0).toUpperCase()}
                </div>

                <span>
                  {user.name}
                </span>

              </Link>

              <button
                onClick={handleLogout}
                className="btn-contact"
              >
                Logout
              </button>
            </>

          )}

        </div>

      </nav>

    </header>
  );
}

export default Navbar;