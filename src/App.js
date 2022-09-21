import LoginPage from "./pages/LoginPage"
import HomePage from "./pages/HomePage"
import ResetPage from "./pages/ResetPage"
import ForgotPage from "./pages/ForgotPage"
import UsersPage from "./pages/UsersPage"
import PrivateRoutes from "./components/PrivateRoutes"

import './App.css';
import 'mdb-react-ui-kit/dist/css/mdb.min.css';
import { Routes, Route, HashRouter } from "react-router-dom";
import NavBar from "./components/NavBar";
import { AuthProvider } from "./contexts/AuthContext";

function App() {
  return (
    <AuthProvider>
      <HashRouter>
        <NavBar />
        <Routes>
            <Route index element={<LoginPage />} />
            <Route path="forgot-password" element={<ForgotPage />} />
            <Route path="reset-password" element={<ResetPage />} />
            <Route element={<PrivateRoutes/>}>
              <Route path="home" element={<HomePage />} />
              <Route path="users" element={<UsersPage />} />
            </Route>   
        </Routes>     
      </HashRouter>
    </AuthProvider>

  )
}

export default App;
