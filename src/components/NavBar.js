import { auth, app } from '../components/utils/firebase';
import { doc, getDoc, getFirestore} from "firebase/firestore";
import { useNavigate, useLocation } from 'react-router-dom';
import { useState } from 'react'
import { useAuth } from '../contexts/AuthContext';
import { MDBDropdown, MDBDropdownMenu, MDBDropdownToggle, MDBDropdownItem } from 'mdb-react-ui-kit';
import Avatar from '@mui/material/Avatar';
export default function NavBar() {

    const db = getFirestore(app);
    const navigate = useNavigate();
    const location = useLocation();
    const [homeNav, setHomeNav] = useState("");
    const [usersNav, setUsersNav] = useState("");
    const [eventLogNav, setEventLogNav] = useState("");
    const [profileNav, setProfileNav] = useState("");
    const [haveInfo, setHaveInfo] = useState(false);
    const { currentUser, logout, currentRole, setCurrentRole, setCurrentUserInfo, setPassExpirationDays, passExpirationDays } = useAuth();

    const HomeNavigate = async (e)=>{
        e.preventDefault();
        navigate("/home");
    }

    const ProfileNavigate = async (e)=>{
        e.preventDefault();
        navigate("/profile");
    }

    const EditProfileNavigate = async (e)=>{
        e.preventDefault();
        navigate("/edit-profile");
    }

    const EventLogNavigate = async (e)=>{
        e.preventDefault();
        navigate("/event-log");
    }
    

    const GetRole = async (e)=>{
        if(auth.currentUser && haveInfo === false) {
            const docRef = doc(db, "users", auth.currentUser.displayName);
            const docSnap = await getDoc(docRef);
            const userInfo = {
                firstName: docSnap.data().firstname,
                lastName: docSnap.data().lastname,
                address: docSnap.data().address,
                dob: docSnap.data().dob
            }
            const days = await GetPasswordExpiration(docSnap.data().passwordExpiration);
            setPassExpirationDays(days);
            setCurrentUserInfo(userInfo)
            setCurrentRole(docSnap.data().role);
            setHaveInfo(true)
        }   
    }
    
    function GetPasswordExpiration(passwordExpiration) {
        const MyDate = new Date();
        const currentYear = String(MyDate.getFullYear());
        const currentMonth = ('0' + (MyDate.getMonth()+1)).slice(-2);
        const currentDay = ('0' + (MyDate.getDate())).slice(-2);
        const currentDate = new Date(currentYear + "-" + currentMonth + "-" + currentDay);
        const passwordExpirationDate = new Date(passwordExpiration);
                
        const oneDay = 1000 * 60 * 60 * 24;
        const diffInTime = passwordExpirationDate.getTime() - currentDate.getTime();
        
        return Math.round(diffInTime / oneDay);
      }

    function RenderPasswordExpirationNotif() {
        if(passExpirationDays <= 3) {
            return (
                <span className="navbar-text">
                Password Expires in {passExpirationDays} days
                </span>
            )
        }
    }

    const RenderProfilePicture = (e)=>{
        if(auth.currentUser) {
            return (
                <Avatar src={currentUser.photoURL} />
            )
        }
       

    }

    const UsersNavigate = async (e)=>{
        e.preventDefault();
        if(currentRole === "Admin") {
            navigate("/users");
        }
    }

    const LogOut = async (e)=>{
        logout();
        navigate("/");
    }


    function RenderNav() {
        
        if(location.pathname === "/home"  && homeNav !== "nav-link active")
        {
            setHomeNav("nav-link active");
            setUsersNav("nav-link");
            setEventLogNav("nav-link");
            setProfileNav("nav-link");
        }
        
        if(location.pathname === "/users" && usersNav !== "nav-link active")
        {
            setHomeNav("nav-link");
            setUsersNav("nav-link active");
            setEventLogNav("nav-link");
            setProfileNav("nav-link");
        }

        if(location.pathname === "/event-log" && eventLogNav !== "nav-link active")
        {
            setHomeNav("nav-link");
            setUsersNav("nav-link");
            setEventLogNav("nav-link active");
            setProfileNav("nav-link");
        }

        if(location.pathname === "/profile" && profileNav !== "nav-link active")
        {
            setHomeNav("nav-link");
            setUsersNav("nav-link");
            setEventLogNav("nav-link");
            setProfileNav("nav-link active");
        }

        if(location.pathname === "/edit-profile" && profileNav !== "nav-link active")
        {
            setHomeNav("nav-link");
            setUsersNav("nav-link");
            setEventLogNav("nav-link");
            setProfileNav("nav-link active");
        }

        
        
        if(location.pathname !== "/" && location.pathname !== "/forgot-password" && location.pathname !== "/reset-password" && location.pathname !== "/answer-questions") {
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
                        {RenderUsersTab()}
                        {RenderEventLogTab()}
                        <li className="nav-item">
                        {/* eslint-disable-next-line*/}
                        <a className={profileNav} onClick={ProfileNavigate} href="" aria-current="page">Profile</a>
                        </li>
                    </ul>
                    <div className="gap-2 d-flex">
                        {RenderPasswordExpirationNotif()}
                        {RenderProfilePicture()}
                        <span className="navbar-text">
                        {currentUser && currentUser.displayName}
                        </span>
                        <MDBDropdown>
                            <MDBDropdownToggle style={{background: 'rgba(41,121,255,1)'}}>Options</MDBDropdownToggle>
                            <MDBDropdownMenu>
                                <MDBDropdownItem onClick={EditProfileNavigate} link>Edit Profile</MDBDropdownItem>
                                <MDBDropdownItem onClick={LogOut} link>Log Out</MDBDropdownItem>
                            </MDBDropdownMenu>
                        </MDBDropdown>
                    </div>
                    </div>
                </div>
            )
        }
    }

    function RenderUsersTab() {
        if(currentUser) {
            if(currentRole === "Admin") {
                return (
                    <li className="nav-item">
                    {/* eslint-disable-next-line*/}
                    <a className={usersNav} onClick={UsersNavigate} href="">Users</a>
                    </li>
                )
            }
        } 
    }

    function RenderEventLogTab() {
        if(currentUser) {
            if(currentRole === "Admin") {
                return (
                    <li className="nav-item">
                    {/* eslint-disable-next-line*/}
                    <a className={eventLogNav} onClick={EventLogNavigate} href="">Event Log</a>
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