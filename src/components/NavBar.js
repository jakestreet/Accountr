import { auth, app } from '../components/utils/firebase';
import { doc, getDoc, getFirestore} from "firebase/firestore";
import { useNavigate, useLocation } from 'react-router-dom';
import { useState } from 'react'
import { useAuth } from '../contexts/AuthContext';
import { MDBDropdown, MDBDropdownMenu, MDBDropdownToggle, MDBDropdownItem, MDBTooltip } from 'mdb-react-ui-kit';
import Avatar from '@mui/material/Avatar';
import Calendar from 'react-calendar';
import '../styling/Calendar.css'
import Popover from '@mui/material/Popover';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';

export default function NavBar() {

    const db = getFirestore(app);
    const navigate = useNavigate();
    const location = useLocation();
    const [homeNav, setHomeNav] = useState("");
    const [usersNav, setUsersNav] = useState("");
    const [eventLogNav, setEventLogNav] = useState("");
    const [profileNav, setProfileNav] = useState("");
    const [accountsNav, setAccountsNav] = useState("");
    const [haveInfo, setHaveInfo] = useState(false);
    const { currentUser, logout, currentRole, setCurrentRole, setCurrentUserInfo, setPassExpirationDays, passExpirationDays } = useAuth();
    const [anchorEl, setAnchorEl] = useState(null);

    const handleClick = (event) => {
        setAnchorEl(event.currentTarget);
    };

    const handleClose = () => {
        setAnchorEl(null);
    };

    const open = Boolean(anchorEl);
    const id = open ? 'simple-popover' : undefined;

    const HomeNavigate = async (e)=>{
        e.preventDefault();
        navigate("/home");
    }

    const ProfileNavigate = async (e)=>{
        e.preventDefault();
        navigate("/profile");
    }

    const EventLogNavigate = async (e)=>{
        e.preventDefault();
        navigate("/event-log");
    }
    
    const AccountsNavigate = async (e)=>{
        e.preventDefault();
        navigate("/accounts");
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
                <div className='d-flex justify-content-center'>
                    <Avatar src={currentUser.photoURL} />
                </div>
                
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
            setAccountsNav("nav-link");
        }
        
        if(location.pathname === "/users" && usersNav !== "nav-link active")
        {
            setHomeNav("nav-link");
            setUsersNav("nav-link active");
            setEventLogNav("nav-link");
            setProfileNav("nav-link");
            setAccountsNav("nav-link");
        }

        if(location.pathname === "/event-log" && eventLogNav !== "nav-link active")
        {
            setHomeNav("nav-link");
            setUsersNav("nav-link");
            setEventLogNav("nav-link active");
            setProfileNav("nav-link");
            setAccountsNav("nav-link");
        }

        if(location.pathname === "/profile" && profileNav !== "nav-link active")
        {
            setHomeNav("nav-link");
            setUsersNav("nav-link");
            setEventLogNav("nav-link");
            setProfileNav("nav-link active");
            setAccountsNav("nav-link");
        }

        if(location.pathname === "/edit-profile" && profileNav !== "nav-link active")
        {
            setHomeNav("nav-link");
            setUsersNav("nav-link");
            setEventLogNav("nav-link");
            setProfileNav("nav-link active");
            setAccountsNav("nav-link");
        }

        if(location.pathname === "/accounts" && accountsNav !== "nav-link active")
        {
            setHomeNav("nav-link");
            setUsersNav("nav-link");
            setEventLogNav("nav-link");
            setProfileNav("nav-link");
            setAccountsNav("nav-link active")
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
                    <div className="collapse navbar-collapse" id="navbarText" style={{display: "flex", justifyContent: "space-between"}}>
                        <div className="gap-2 d-flex" style={{flexGrow: 1, flexBasis: 0}}>
                            <MDBDropdown>
                            <MDBTooltip tag='a' placement="auto" title="View profile options">
                                <MDBDropdownToggle floating className='mx-auto' style={{background: 'rgba(255,255,255,1)'}}>
                                {RenderProfilePicture()}
                                </MDBDropdownToggle>
                            </MDBTooltip>
                                
                                <MDBDropdownMenu>
                                <MDBTooltip tag='a' placement="auto" title="View profile">
                                    <MDBDropdownItem onClick={ProfileNavigate} link>Profile</MDBDropdownItem>
                                </MDBTooltip>
                                <MDBTooltip tag='a' placement="auto" title="Log out of this account">
                                    <MDBDropdownItem onClick={LogOut} link>Log Out</MDBDropdownItem>
                                </MDBTooltip>
                                    
                                </MDBDropdownMenu>
                            </MDBDropdown>
                            <span className="navbar-text">
                            {currentUser && currentUser.displayName + " | "}
                            </span>
                            {RenderPasswordExpirationNotif()}
                            <MDBTooltip tag='a' placement="auto" title="View calendar">
                                <Button size="small" aria-describedby={id} variant="contained" style={{backgroundColor: 'rgba(41,121,255,1)'}} onClick={handleClick} className="me-2 mt-1">
                                    <CalendarMonthIcon/>{new Date().toLocaleDateString()}
                                </Button>
                            </MDBTooltip>
                            
                            <Popover
                                id={id}
                                open={open}
                                anchorEl={anchorEl}
                                onClose={handleClose}
                                anchorOrigin={{
                                vertical: 'bottom',
                                horizontal: 'left',
                                }}
                            >
                                <Typography sx={{ p: 2 }}><Calendar/></Typography>
                            </Popover>
                        </div>
                        <ul className="navbar-nav">
                            <li className="nav-item">
                            {/* eslint-disable-next-line*/}
                            <a className={homeNav} onClick={HomeNavigate} href="" aria-current="page" style={{fontSize: 20}}>Home</a>
                            </li>
                            {RenderUsersTab()}
                            {RenderEventLogTab()}
                            <li className="nav-item">
                            {/* eslint-disable-next-line*/}
                            <a className={accountsNav} onClick={AccountsNavigate} href="" aria-current="page" style={{fontSize: 20}}>Accounts</a>
                            </li>
                        </ul>
                        <div style={{display: "flex", justifyContent: "flex-end", flexGrow: 1, flexBasis: 0}}>
                            <img
                                src='/images/logo.png'
                                className="rounded-pill"
                                alt="Accountr"
                                width="175"
                            />
                        </div>
                    </div>
                </div>
            )
        }
        else {
            return (
                <div className="container-fluid">
                    <div className="collapse navbar-collapse" id="navbarText" style={{display: "flex", justifyContent: "space-between"}}>
                        <div style={{flexGrow: 1, flexBasis: 0}}>
                            <MDBTooltip tag='a' placement="auto" title="View calendar" className="mt-1">
                                <Button size="small" aria-describedby={id} variant="contained" style={{backgroundColor: 'rgba(41,121,255,1)'}} onClick={handleClick} className="me-2 mt-1">
                                <CalendarMonthIcon/>{new Date().toLocaleDateString()}
                                </Button>
                            </MDBTooltip>
                            <Popover
                                id={id}
                                open={open}
                                anchorEl={anchorEl}
                                onClose={handleClose}
                                anchorOrigin={{
                                vertical: 'bottom',
                                horizontal: 'left',
                                }}
                            >
                                <Typography sx={{ p: 2 }}><Calendar/></Typography>
                            </Popover>
                        </div>
                        <div>
                            <h2>Login</h2>
                        </div>
                        <div style={{display: "flex", justifyContent: "flex-end", flexGrow: 1, flexBasis: 0}}>
                            <img
                                src='/images/logo.png'
                                className="rounded-pill"
                                alt="Accountr"
                                width="175"
                            />
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
                    <a className={usersNav} onClick={UsersNavigate} href="" style={{fontSize: 20}}>Users</a>
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
                    <a className={eventLogNav} onClick={EventLogNavigate} href="" style={{fontSize: 20}}>Event Log</a>
                    </li>
                )
            }
        } 
    }

    return (
        <div>
            <nav className="navbar navbar-expand-lg navbar-light bg-light">
                <div className="container-fluid justify-content-between">
                    {/* eslint-disable-next-line*/}
                    {RenderNav()}       
                </div>  
            </nav> 
        </div>       
        
    )
}