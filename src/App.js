import LoginPage from "./components/LoginPage"
import HomePage from "./components/HomePage"
import ResetPass from "./components/ResetPass";

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
            <Route path="reset" element={<ResetPass />} />
        </Routes>     
      </BrowserRouter>
    </div>
  )
}

export default App;
