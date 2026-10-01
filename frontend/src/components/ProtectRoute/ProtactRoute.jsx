// import {Navigate} from 'react-router-dom'

// function ProtactRoute({children}){

//     const user = localStorage.getItem('user');
//     if(! user){
//          return <Navigate to="/login" replace />;
//     }
//     return children;    


// }
// export default ProtactRoute;


import { Navigate } from "react-router-dom";

function ProtactRoute({ children }) {
    let user = null;

    try {
        user = JSON.parse(localStorage.getItem("user") || "null");
    } catch {
        user = null;
    }

    // Not logged in
    if (!user) {
        return <Navigate to="/login" replace />;
    }

    // Admin cannot access user pages
    if (user.role === "admin") {
        return <Navigate to="/admin-dashboard" replace />;
    }

    // Only normal users can access user pages
    if (user.role !== "user") {
        return <Navigate to="/login" replace />;
    }

    return children;
}

export default ProtactRoute;
