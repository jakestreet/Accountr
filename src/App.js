import LoginPage from "./pages/LoginPage"
import HomePage from "./pages/HomePage"
import EditProfilePage from "./pages/EditProfilePage"
import ProfilePage from "./pages/ProfilePage"
import ResetPage from "./pages/ResetPage"
import QuestionsPage from "./pages/QuestionsPage"
import ForgotPage from "./pages/ForgotPage"
import UsersPage from "./pages/UsersPage"
import EventLogPage from "./pages/EventLogPage"
import PrivateRoutes from "./components/PrivateRoutes"

import './App.css';
import 'mdb-react-ui-kit/dist/css/mdb.min.css';
import { Routes, Route, BrowserRouter } from "react-router-dom";
import NavBar from "./components/NavBar";
import { AuthProvider } from "./contexts/AuthContext";

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <NavBar />
        <Routes>
            <Route index element={<LoginPage />} />
            <Route path="forgot-password" element={<ForgotPage />} />
            <Route path="reset-password" element={<ResetPage />} />
            <Route path="answer-questions" element={<QuestionsPage />} />
            <Route element={<PrivateRoutes/>}>
              <Route path="home" element={<HomePage />} />
              <Route path="edit-profile" element={<EditProfilePage />} />
              <Route path="profile" element={<ProfilePage />} />
              <Route path="users" element={<UsersPage />} />
              <Route path="event-log" element={<EventLogPage />} />
            </Route>   
        </Routes>     
      </BrowserRouter>
    </AuthProvider>

  )
}

export default App;
