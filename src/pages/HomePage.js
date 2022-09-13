import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { app, auth } from '../components/utils/firebase';
import { doc, getDoc, getFirestore} from "firebase/firestore";

export default function HomePage() {
    const navigate = useNavigate();

    const db = getFirestore(app);

    const [userMessage, setUserMessage] = useState("");
    
    const LogOut = async (e)=>{
        auth.signOut();
        navigate("/");
      
    }

    const Requests = async (e)=>{
        const docRef = doc(db, "users", auth.currentUser.email);
        const docSnap = await getDoc(docRef);
        if(docSnap.data().role === "manager") {
            navigate("/requests");
        }
        else {
            setUserMessage("You do not have access.");
        }  
    }

    return (
        <div>
            <h1 className="text-center">Home Page</h1>
            <p1>Logged In User: {auth.currentUser.email}</p1>
            <button onClick={LogOut}>Log Out</button>
            <button onClick={Requests}>Requests</button>
            <p1>Message: {userMessage}</p1>
        </div>
        
    )
    
}