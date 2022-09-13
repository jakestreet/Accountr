import LoginPage from "./pages/LoginPage"
import HomePage from "./pages/HomePage"
import ResetPage from "./pages/ResetPage";
import RequestsPage from "./pages/RequestsPage"

import './App.css';
import 'mdb-react-ui-kit/dist/css/mdb.min.css';
import { BrowserRouter, Routes, Route } from "react-router-dom";

function App() {
  return (
    <div>
      <h1>SWE Application Domain Project</h1>
      <BrowserRouter>
        <Routes>
            <Route index element={<LoginPage />} />
            <Route path="home" element={<HomePage />} />
            <Route path="reset" element={<ResetPage />} />
            <Route path="requests" element={<RequestsPage />} />
        </Routes>     
      </BrowserRouter>
    </div>
  )
}

export default App;
