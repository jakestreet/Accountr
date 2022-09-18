import { MDBBtn } from 'mdb-react-ui-kit';
import { auth, app } from '../components/utils/firebase';
import { doc, getDoc, getFirestore} from "firebase/firestore";
import { useNavigate, useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext';
export default function NavBar() {

    const db = getFirestore(app);
    const navigate = useNavigate();
    const location = useLocation();
    const [homeNav, setHomeNav] = useState("");
    const [usersNav, setUsersNav] = useState("");
    const { currentUser, logout, currentRole, setCurrentRole } = useAuth();

    const HomeNavigate = async (e)=>{
        e.preventDefault();
        navigate("/home");
    }

    const GetRole = async (e)=>{
        if(auth.currentUser) {
            const docRef = doc(db, "users", auth.currentUser.email);
            const docSnap = await getDoc(docRef);
            setCurrentRole(docSnap.data().role);
        }
       

    }

    const UsersNavigate = async (e)=>{
        e.preventDefault();
        if(currentRole === "Manager") {
            navigate("/users");
        }
    }

    const LogOut = async (e)=>{
        logout()
        console.log("logged out");
        navigate("/");
    }

    useEffect(() => {
        let ignore = false;
        
        if (!ignore)  if(auth.currentUser === null)
        {
            navigate("/");
        }
        return () => { ignore = true; }
        // eslint-disable-next-line react-hooks/exhaustive-deps
        },[]);


    function RenderNav() {
        
        if(location.pathname === "/home"  && homeNav !== "nav-link active")
        {
            setHomeNav("nav-link active");
            setUsersNav("nav-link");
        }
        
        if(location.pathname === "/users" && usersNav !== "nav-link active")
        {
            setHomeNav("nav-link");
            setUsersNav("nav-link active");
        }
        
        if(location.pathname !== "/" && location.pathname !== "/reset") {
            GetRole();
            return(
                <div className="container-fluid">
                    <button
                    className="navbar-toggler"
                    type="button"
                    data-mdb-toggle="collapse"
                    data-mdb-target="#navbarText"
                    aria-controls="navbarText"
                    aria-expanded="false"
                    aria-label="Toggle navigation"
                    >
                    <i className="fas fa-bars"></i>
                    </button>
                    <div className="collapse navbar-collapse" id="navbarText">
                    <ul className="navbar-nav me-auto mb-2 mb-lg-0">
                        <li className="nav-item">
                        {/* eslint-disable-next-line*/}
                        <a className={homeNav} onClick={HomeNavigate} href="" aria-current="page">Home</a>
                        </li>
                        {/*RenderUsersTab()*/}
                        {RenderUsersTab()}
                    </ul>
                    <div className="gap-2 d-flex">
                        <span className="navbar-text">
                        {currentUser && currentUser.email}
                        </span>
                        <MDBBtn onClick={LogOut} className="mb-0 w-5 btn-rounded">Log Out</MDBBtn>
                    </div>
                    </div>
                </div>
            )
        }
    }

    function RenderUsersTab() {
        if(currentUser) {
            if(currentRole === "Manager") {
                return (
                    <li className="nav-item">
                    {/* eslint-disable-next-line*/}
                    <a className={usersNav} onClick={UsersNavigate} href="">Users</a>
                    </li>
                )
            }
        } 
    }

    return (
        <div>
            <nav className="navbar navbar-expand-lg navbar-light bg-light">
                <div className="container-fluid">
                    {/* eslint-disable-next-line*/}
                    <img
                    src='/images/logo.png'
                    className="rounded-pill"
                    alt="Townhouses and Skyscrapers"
                    width="175"
                    />
                    {RenderNav()}
                </div>  
            </nav> 
        </div>       
        
    )
}