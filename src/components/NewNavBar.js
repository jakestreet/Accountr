import * as React from 'react';
import { styled, useTheme } from '@mui/material/styles';
import Box from '@mui/material/Box';
import MuiDrawer from '@mui/material/Drawer';
import MuiAppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import List from '@mui/material/List';
import CssBaseline from '@mui/material/CssBaseline';
import Typography from '@mui/material/Typography';
import Divider from '@mui/material/Divider';
import IconButton from '@mui/material/IconButton';
import MenuIcon from '@mui/icons-material/Menu';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import InboxIcon from '@mui/icons-material/MoveToInbox';
import MailIcon from '@mui/icons-material/Mail';
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import { AccountBalance, Home, LibraryBooks, People, SyncProblem, NotificationsNoneOutlined, Notifications, Help } from '@mui/icons-material';
import Calendar from "react-calendar";
import { useAuth } from '../contexts/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';
import { auth, app } from "../components/utils/firebase";
import { MDBBtn, MDBDropdown, MDBDropdownItem, MDBDropdownMenu, MDBDropdownToggle, MDBRow, MDBTooltip } from 'mdb-react-ui-kit';
import { Avatar, Button, Modal, Popover, Tooltip } from '@mui/material';
import { doc, getDoc, getFirestore } from 'firebase/firestore';
import RenderHelp from './RenderHelp';

const drawerWidth = 240;

const openedMixin = (theme) => ({
    width: drawerWidth,
    transition: theme.transitions.create('width', {
        easing: theme.transitions.easing.sharp,
        duration: theme.transitions.duration.enteringScreen,
    }),
    overflowX: 'hidden',
});

const closedMixin = (theme) => ({
    transition: theme.transitions.create('width', {
        easing: theme.transitions.easing.sharp,
        duration: theme.transitions.duration.leavingScreen,
    }),
    overflowX: 'hidden',
    width: `calc(${theme.spacing(7)} + 1px)`,
    [theme.breakpoints.up('sm')]: {
        width: `calc(${theme.spacing(8)} + 1px)`,
    },

});

const DrawerHeader = styled('div')(({ theme }) => ({
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: theme.spacing(0, 1),
    // necessary for content to be below app bar
    minHeight: 30,
    // ...theme.mixins.toolbar,
}));

const AppBar = styled(MuiAppBar, {
    shouldForwardProp: (prop) => prop !== 'open',
})(({ theme, open }) => ({
    zIndex: theme.zIndex.drawer + 1,
    backgroundColor: "rgba(41,121,255,1)",
    transition: theme.transitions.create(['width', 'margin'], {
        easing: theme.transitions.easing.sharp,
        duration: theme.transitions.duration.leavingScreen,
    }),
    ...(open && {
        marginLeft: drawerWidth,
        width: `calc(100% - ${drawerWidth}px)`,
        transition: theme.transitions.create(['width', 'margin'], {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.enteringScreen,
        }),
    }),
}));

const Drawer = styled(MuiDrawer, { shouldForwardProp: (prop) => prop !== 'open' })(
    ({ theme, open }) => ({
        width: drawerWidth,
        flexShrink: 0,
        whiteSpace: 'nowrap',
        boxSizing: 'border-box',
        ...(open && {
            ...openedMixin(theme),
            '& .MuiDrawer-paper': openedMixin(theme),
        }),
        ...(!open && {
            ...closedMixin(theme),
            '& .MuiDrawer-paper': closedMixin(theme),
        }),
    }),
);

export default function MiniDrawer() {
    const theme = useTheme();
    const [open, setOpen] = React.useState(false);
    const {
        currentUser,
        logout,
        currentPage,
        setCurrentPage,
        currentRole,
        setCurrentRole,
        setCurrentUserInfo,
        setPassExpirationDays,
        passExpirationDays,
        pendingEntries,
        setFilterProvidedEntry,
        setFilterProvidedAdjEntry,
        StyledTooltip
    } = useAuth();
    const navigate = useNavigate();
    const db = getFirestore(app);
    const location = useLocation();
    const [anchorEl, setAnchorEl] = React.useState(null);
    const openCal = Boolean(anchorEl);
    const id = open ? "simple-popover" : undefined;
    const [haveInfo, setHaveInfo] = React.useState(false);
    const [anchorElNotif, setAnchorElNotif] = React.useState(null);
    const openNotif = Boolean(anchorElNotif);
    const idNotif = openNotif ? 'simple-popover' : undefined;
    const [openHelp, setOpenHelp] = React.useState(false);
    const handleOpenHelp = () => setOpenHelp(true);
    const handleCloseHelp = () => setOpenHelp(false);

    const handleClickNotif = (event) => {
        setAnchorElNotif(event.currentTarget);
    };

    const handleCloseNotif = () => {
        setAnchorElNotif(null);
    };

    const handleClick = (event) => {
        setAnchorEl(event.currentTarget);
    };

    const handleClose = () => {
        setAnchorEl(null);
    };

    const handleDrawerOpen = () => {
        setOpen(true);
    };

    const handleDrawerClose = () => {
        setOpen(false);
    };
    const HomeNavigate = async (e) => {
        e.preventDefault();
        navigate("/home");
    };

    const ProfileNavigate = async (e) => {
        e.preventDefault();
        navigate("/profile");
    };

    const EventLogNavigate = async (e) => {
        e.preventDefault();
        navigate("/event-log");
    };

    const AccountsNavigate = async (e) => {
        e.preventDefault();
        navigate("/accounts");
    };

    const JournalNavigate = async (e) => {
        e.preventDefault();
        navigate("/journal");
    };

    const UsersNavigate = async (e) => {
        e.preventDefault();
        if (currentRole === "Admin") {
            navigate("/users");
        }
    };

    const LogOut = async (e) => {
        logout();
        navigate("/");
    };

    const RenderProfilePicture = (e) => {
        if (auth.currentUser) {
            return (
                <div className="d-flex justify-content-center">
                    <Avatar src={currentUser.photoURL} />
                </div>
            );
        }
    };

    function RenderCurrentPage() {
        if (location.pathname === "/home") {
            setCurrentPage("Home")
        }
        else if (location.pathname === "/users") {
            setCurrentPage("Users")
        }
        else if (location.pathname === "/accounts") {
            setCurrentPage("Accounts")
        }
        else if (location.pathname === "/journal") {
            setCurrentPage("Journal")
        }
        else if (location.pathname === "/profile") {
            setCurrentPage("Profile")
        }
        else if (location.pathname === "/edit-profile") {
            setCurrentPage("Edit Profile")
        }
        else if (location.pathname === "/event-log") {
            setCurrentPage("Event Log")
        }
        else if (location.pathname === "/") {
            setCurrentPage("Login")
        }
        else if (location.pathname === "/forgot-password") {
            setCurrentPage("Forgot")
        }
        else if (location.pathname === "/reset-password") {
            setCurrentPage("Reset")
        }
        else if (location.pathname === "/answer-questions") {
            setCurrentPage("Questions")
        }
    }

    const GetRole = async (e) => {
        if (auth.currentUser && haveInfo === false) {
            const docRef = doc(db, "users", auth.currentUser.displayName);
            const docSnap = await getDoc(docRef);
            const userInfo = {
                firstName: docSnap.data().firstname,
                lastName: docSnap.data().lastname,
                address: docSnap.data().address,
                dob: docSnap.data().dob,
            };
            const days = await GetPasswordExpiration(
                docSnap.data().passwordExpiration
            );
            setPassExpirationDays(days);
            setCurrentUserInfo(userInfo);
            setCurrentRole(docSnap.data().role);
            setHaveInfo(true);
        }
    };

    function GetPasswordExpiration(passwordExpiration) {
        const MyDate = new Date();
        const currentYear = String(MyDate.getFullYear());
        const currentMonth = ("0" + (MyDate.getMonth() + 1)).slice(-2);
        const currentDay = ("0" + MyDate.getDate()).slice(-2);
        const currentDate = new Date(
            currentYear + "-" + currentMonth + "-" + currentDay
        );
        const passwordExpirationDate = new Date(passwordExpiration);

        const oneDay = 1000 * 60 * 60 * 24;
        const diffInTime = passwordExpirationDate.getTime() - currentDate.getTime();

        return Math.round(diffInTime / oneDay);
    }

    function RenderPasswordExpirationNotif() {
        if (passExpirationDays <= 3) {
            return (
                <span className="navbar-text" style={{ marginTop: 3 }}>
                    Password Expires in {passExpirationDays} days
                </span>
            );
        }
    }

    function GetIcon(text) {
        if (text === "Home")
            return currentPage === "Home" ? <Home style={{ color: "rgba(41,121,255,1)" }} /> : <Home />
        else if (text === "Users")
            return currentPage === "Users" ? <People style={{ color: "rgba(41,121,255,1)" }} /> : <People />
        else if (text === "Event Log")
            return currentPage === "Event Log" ? <SyncProblem style={{ color: "rgba(41,121,255,1)" }} /> : <SyncProblem />
        else if (text === "Accounts")
            return currentPage === "Accounts" ? <AccountBalance style={{ color: "rgba(41,121,255,1)" }} /> : <AccountBalance />
        else if (text === "Journal")
            return currentPage === "Journal" ? <LibraryBooks style={{ color: "rgba(41,121,255,1)" }} /> : <LibraryBooks />
        else
            return <InboxIcon />
    }

    function NavigatePage(e, destination) {
        if (destination === "Home")
            HomeNavigate(e);
        else if (destination === "Users")
            UsersNavigate(e);
        else if (destination === "Event Log")
            EventLogNavigate(e);
        else if (destination === "Accounts")
            AccountsNavigate(e);
        else if (destination === "Journal")
            JournalNavigate(e);
    }

    React.useEffect(() => {
        GetRole();
    }, [])

    React.useEffect(() => {
        setFilterProvidedEntry();
        setFilterProvidedAdjEntry("");
    }, [navigate, setFilterProvidedEntry, setFilterProvidedAdjEntry])


    return (
        <Box sx={{ display: 'flex' }}>
            <CssBaseline />
            <AppBar position="fixed" open={open}>
                {currentUser !== null ?
                    <Toolbar >
                        <div style={{ flexGrow: 1, flexBasis: 0 }}>
                            <div style={{ display: "flex", alignItems: "center" }}>
                                <IconButton
                                    color="inherit"
                                    aria-label="open drawer"
                                    onClick={handleDrawerOpen}
                                    edge="start"
                                    sx={{
                                        marginRight: 5,
                                        ...(open && { display: 'none' }),
                                    }}
                                >
                                    <MenuIcon />
                                </IconButton>
                                <StyledTooltip
                                    title="View Calendar"
                                    placement='right'
                                    arrow
                                >
                                    <Button
                                        aria-describedby={id}
                                        variant="link"
                                        style={{ color: "rgba(255,255,255,1)", marginLeft: -25 }}
                                        onClick={handleClick}
                                    >
                                        <CalendarMonthIcon />
                                        {new Date().toLocaleDateString()}
                                    </Button>
                                </StyledTooltip>
                                <Popover
                                    id={id}
                                    open={openCal}
                                    anchorEl={anchorEl}
                                    onClose={handleClose}
                                    anchorOrigin={{
                                        vertical: "bottom",
                                        horizontal: "left",
                                    }}
                                >
                                    <Typography sx={{ p: 2 }}>
                                        <Calendar />
                                    </Typography>
                                </Popover>

                            </div>
                        </div>
                        {/* rgba(41,121,255,1) */}
                        <Typography variant="h6" component="div">
                            <img
                                src="/images/logo clear.png"
                                className="rounded-pill"
                                alt="Accountr"
                                width="175"
                            />
                        </Typography>

                        <div
                            style={{
                                display: "flex",
                                justifyContent: "flex-end",
                                flexGrow: 1,
                                flexBasis: 0,
                            }}
                        >
                            <MDBDropdown style={{ display: "flex", alignItems: "center" }}>
                                {RenderPasswordExpirationNotif()}
                                {pendingEntries && currentRole === "Manager" ?
                                    <div style={{ paddingTop: 2 }}>
                                        <StyledTooltip
                                            title="View Notifications"
                                            placement='left'
                                            arrow
                                        >
                                            <IconButton aria-describedby={idNotif} onClick={handleClickNotif} children={<Notifications style={{ color: "white" }} />} />
                                        </StyledTooltip>
                                        <Popover
                                            id={idNotif}
                                            open={openNotif}
                                            anchorEl={anchorElNotif}
                                            onClose={handleCloseNotif}
                                            anchorOrigin={{
                                                vertical: "bottom",
                                                horizontal: "left",
                                            }}
                                        >
                                            <Typography sx={{ p: 2 }}>
                                                You have pending journal entries.
                                            </Typography>
                                        </Popover>

                                    </div> : <div style={{ paddingTop: 2 }}>
                                        <StyledTooltip
                                            title="View Notifications"
                                            placement='left'
                                            arrow
                                        >
                                            <IconButton aria-describedby={idNotif} onClick={handleClickNotif} children={<NotificationsNoneOutlined style={{ color: "white" }} />} />
                                        </StyledTooltip>
                                        <Popover
                                            id={idNotif}
                                            open={openNotif}
                                            anchorEl={anchorElNotif}
                                            onClose={handleCloseNotif}
                                            anchorOrigin={{
                                                vertical: "bottom",
                                                horizontal: "left",
                                            }}
                                        >
                                            <Typography sx={{ p: 2 }}>
                                                You have no notifications.
                                            </Typography>
                                        </Popover>
                                    </div>
                                }
                                <Typography variant="h7" className="mt-1 me-2">
                                    {currentUser && currentUser.displayName}
                                </Typography>
                                    <MDBDropdownToggle
                                        floating
                                        className="mx-auto"
                                        style={{ background: "rgba(255,255,255,1)" }}
                                    >
                                        {RenderProfilePicture()}
                                    </MDBDropdownToggle>
                                <MDBDropdownMenu>
                                        <MDBDropdownItem onClick={ProfileNavigate} link>
                                            Profile
                                        </MDBDropdownItem>
                                        <MDBDropdownItem onClick={LogOut} link>
                                            Log Out
                                        </MDBDropdownItem>
                                </MDBDropdownMenu>
                            </MDBDropdown>
                        </div>
                    </Toolbar> : <Toolbar>
                        <div style={{ display: "flex", alignItems: "center" }}>
                            <Typography variant="h6" component="div">
                                <img
                                    src="/images/logo clear.png"
                                    className="rounded-pill"
                                    alt="Accountr"
                                    width="175"
                                />
                            </Typography>
                        </div>
                    </Toolbar>}
            </AppBar>
            {currentUser !== null ?
                <Drawer variant="permanent" open={open}>
                    <DrawerHeader>
                        <Typography variant="h5" component="div" style={{ marginBottom: 15, marginTop: 15 }}>
                            {currentPage}
                        </Typography>
                        <IconButton onClick={handleDrawerClose}>
                            {theme.direction === 'rtl' ? <ChevronRightIcon /> : <ChevronLeftIcon />}
                        </IconButton>
                    </DrawerHeader>
                    <Divider />
                    <List style={{ flexGrow: 1 }}>
                        {currentRole === "Admin" ?
                            ['Home', 'Users', 'Accounts', 'Journal', 'Event Log'].map((text, index) => (
                                <ListItem key={text} disablePadding sx={{ display: 'block' }}>
                                    <StyledTooltip
                                        title={open ? null : text}
                                        placement='right'
                                        arrow
                                    >
                                        <ListItemButton
                                            sx={{
                                                minHeight: 48,
                                                justifyContent: open ? 'initial' : 'center',
                                                px: 2.5,
                                            }}
                                            onClick={(e) => NavigatePage(e, text)}
                                        >
                                            <ListItemIcon
                                                sx={{
                                                    minWidth: 0,
                                                    mr: open ? 3 : 'auto',
                                                    justifyContent: 'center',
                                                }}
                                            >
                                                {GetIcon(text)}
                                            </ListItemIcon>
                                            <ListItemText primary={text} sx={{ opacity: open ? 1 : 0 }} />
                                        </ListItemButton>
                                    </StyledTooltip>
                                </ListItem>
                            )) :
                            ['Home', 'Accounts', 'Journal'].map((text, index) => (
                                <ListItem key={text} disablePadding sx={{ display: 'block' }}>
                                    <StyledTooltip
                                        title={open ? null : text}
                                        placement='right'
                                        arrow
                                    >
                                        <ListItemButton
                                            sx={{
                                                minHeight: 48,
                                                justifyContent: open ? 'initial' : 'center',
                                                px: 2.5,
                                            }}
                                            onClick={(e) => NavigatePage(e, text)}
                                        >
                                            <ListItemIcon
                                                sx={{
                                                    minWidth: 0,
                                                    mr: open ? 3 : 'auto',
                                                    justifyContent: 'center',
                                                }}
                                            >
                                                {GetIcon(text)}
                                            </ListItemIcon>
                                            <ListItemText primary={text} sx={{ opacity: open ? 1 : 0 }} />
                                        </ListItemButton>
                                    </StyledTooltip>
                                </ListItem>
                            ))
                        }
                    </List>
                    <List>
                        <StyledTooltip
                            title={open ? null : "Help"}
                            placement='right'
                            arrow
                        >
                            <ListItemButton
                                sx={{
                                    minHeight: 48,
                                    justifyContent: open ? 'initial' : 'center',
                                    px: 2.5,
                                }}
                                onClick={() => { handleOpenHelp() }}>
                                <ListItemIcon
                                    sx={{
                                        minWidth: 0,
                                        mr: open ? 3 : 'auto',
                                        justifyContent: 'center',
                                    }}
                                >
                                    <Help style={{ color: "rgba(41,121,255,1)" }} />
                                </ListItemIcon>
                                <ListItemText primary="Help" sx={{ opacity: open ? 1 : 0 }} />
                            </ListItemButton>
                        </StyledTooltip>
                    </List>
                </Drawer> : null}
            <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
                <DrawerHeader />
            </Box>
            {RenderCurrentPage()}
            <Modal
                open={openHelp}
                onClose={handleOpenHelp}
                aria-labelledby="modal-modal-title"
                aria-describedby="modal-modal-description"
            >
                <div class="card">
                    <RenderHelp />
                    <StyledTooltip
                        title="Close"
                        placement='bottom'
                        arrow
                    >
                        <MDBBtn onClick={handleCloseHelp} className="d-md-flex m-auto mt-4" style={{ background: 'rgba(41,121,255,1)' }}>Close</MDBBtn>
                    </StyledTooltip>
                </div>
            </Modal>
        </Box >
    );
}