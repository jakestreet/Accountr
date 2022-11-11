import LoginPage from "./pages/LoginPage";
import HomePage from "./pages/HomePage";
import EditProfilePage from "./pages/EditProfilePage";
import ProfilePage from "./pages/ProfilePage";
import ResetPage from "./pages/ResetPage";
import QuestionsPage from "./pages/QuestionsPage";
import ForgotPage from "./pages/ForgotPage";
import UsersPage from "./pages/UsersPage";
import EventLogPage from "./pages/EventLogPage";
import AccountsPage from "./pages/AccountsPage";
import JournalPage from "./pages/JournalPage";
import PrivateRoutes from "./components/PrivateRoutes";
import NewNavBar from "./components/NewNavBar";

import "./App.css";
import "mdb-react-ui-kit/dist/css/mdb.min.css";
import { Routes, Route, BrowserRouter } from "react-router-dom";
import NavBar from "./components/NavBar";
import { AuthProvider } from "./contexts/AuthContext";

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <NewNavBar />
        <Routes>
          <Route index element={<LoginPage />} />
          <Route path="forgot-password" element={<ForgotPage />} />
          <Route path="reset-password" element={<ResetPage />} />
          <Route path="answer-questions" element={<QuestionsPage />} />
          <Route element={<PrivateRoutes />}>
            <Route path="home" element={<div style={{marginLeft: 24}}><HomePage /></div>} />
            <Route path="edit-profile" element={<div style={{marginLeft: 24}}><EditProfilePage /></div>} />
            <Route path="profile" element={<div style={{marginLeft: 24}}><ProfilePage  /></div>} />
            <Route path="users" element={<div style={{marginLeft: 55}}><UsersPage /></div>} />
            <Route path="event-log" element={<div style={{marginLeft: 55}}><EventLogPage /></div>} />
            <Route path="accounts" element={<div style={{marginLeft: 55}}><AccountsPage /></div>} />
            <Route path="journal" element={<div style={{marginLeft: 24}}><JournalPage /></div>} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
