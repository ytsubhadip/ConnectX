import {Navigate} from 'react-router-dom'

function ProtactRoute({children}){

    const user = localStorage.getItem('user');
    if(! user){
         return <Navigate to="/login" replace />;
    }
    return children;


}
export default ProtactRoute;