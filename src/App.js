import LoginPage from "./pages/LoginPage"
import HomePage from "./pages/HomePage"
import ResetPage from "./pages/ResetPage";
import RequestsPage from "./pages/RequestsPage"

import './App.css';
import 'mdb-react-ui-kit/dist/css/mdb.min.css';
import { BrowserRouter, Routes, Route } from "react-router-dom";
import NavBar from "./components/NavBar";

function App() {
  return (
    <div>
      <BrowserRouter>
        <NavBar />
        <Routes>
            <Route index element={<LoginPage />} />
            <Route path="home" element={<HomePage />} />
            <Route path="reset" element={<ResetPage />} />
            <Route path="users" element={<RequestsPage />} />
        </Routes>     
      </BrowserRouter>
    </div>
  )
}

export default App;
