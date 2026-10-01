import { Navigate, Outlet } from "react-router-dom";

function AdminRoute(){
    const storeUser = localStorage.getItem("user");

    if(!storeUser){
        return <Navigate to="/login" replace/>;
    }

    let user;

    try{
        user = JSON.parse(storeUser);
    }
    catch{
        localStorage.removeItem("user");
        return <Navigate to="/login" replace/>;
    }

    if(user?.role !== "admin"){
        return <Navigate to="/dashboard" replace/>;
    }

    return <Outlet/>;
}

export default AdminRoute;