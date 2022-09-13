import { useNavigate } from 'react-router-dom';
import { app, auth } from './utils/firebase'

export default function HomePage() {
    const navigate = useNavigate();
    
    const LogOut = async (e)=>{
        auth.signOut();
        navigate("/");
      
    }

    return (
        <div>
            <h1 className="text-center">Home Page</h1>
            <p1>Logged In User: {auth.currentUser.email}</p1>
            <button onClick={LogOut}>Log Out</button>
        </div>
        
    )
    
}