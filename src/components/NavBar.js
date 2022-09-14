import { MDBBtn } from 'mdb-react-ui-kit';
import { auth, app } from '../components/utils/firebase';
import { doc, getDoc, getFirestore} from "firebase/firestore";
import { useNavigate, useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react'
import { Alert } from '@mui/material';
import IconButton from '@mui/material/IconButton';
import Collapse from '@mui/material/Collapse';
import CloseIcon from '@mui/icons-material/Close';
export default function NavBar() {

    const db = getFirestore(app);
    const navigate = useNavigate();
    const location = useLocation();
    const [homeNav, setHomeNav] = useState("");
    const [usersNav, setUsersNav] = useState("");
    const [alertStatus, setAlertStatus] = useState("");
    const [open, setOpen] = useState(true);

    const HomeNavigate = async (e)=>{
        e.preventDefault();
        navigate("/home");
    }

    const UsersNavigate = async (e)=>{
        e.preventDefault();
        const docRef = doc(db, "users", auth.currentUser.email);
        const docSnap = await getDoc(docRef);
        if(docSnap.data().role === "Manager") {
            navigate("/users");
        }
        else {
            setAlertStatus("Only managers and administrators can access users.");
            setOpen(true);
        }  
    }

    const SendAlert = (e)=>{
        if(alertStatus !== "") {
          return (
            <Collapse in={open}>
              <Alert severity="warning"
                action={
                  <IconButton
                    aria-label="close"
                    color="inherit"
                    size="small"
                    onClick={() => {
                      setOpen(false);
                    }}
                  >
                    <CloseIcon fontSize="inherit" />
                  </IconButton>
                }
                sx={{ mb: 2 }}
              >
                {alertStatus}
              </Alert>
            </Collapse>
          )
        } 
    }

    const LogOut = async (e)=>{
        auth.signOut();
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
                        <li className="nav-item">
                        {/* eslint-disable-next-line*/}
                        <a className={usersNav} onClick={UsersNavigate} href="">Users</a>
                        </li>
                    </ul>
                    <div className="gap-2 d-flex">
                        <span className="navbar-text">
                            {auth.currentUser.email}
                        </span>
                        <MDBBtn onClick={LogOut} className="mb-0 w-5 btn-rounded">Log Out</MDBBtn>
                    </div>
                    </div>
                </div>
            )
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
            {SendAlert()}
            
        </div>       
        
    )
}