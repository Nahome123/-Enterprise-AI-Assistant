import { Routes, Route } from "react-router-dom";

import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import Documents from "./pages/Documents";
import Chat from "./pages/Chat";
import Tickets from "./pages/Tickets";
import ProtectedRoute from "./components/ProtectedRoute";
import Layout from "./components/Layout";

function App() {
    return (
        <Routes>
            <Route path="/" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route element={<ProtectedRoute />}>
                <Route element={<Layout />}>
                    <Route path="/dashboard" element={<Dashboard />} />
                    <Route path="/documents" element={<Documents />} />
                    <Route path="/chat" element={<Chat />} />
                    <Route path="/tickets" element={<Tickets />} />
                </Route>
            </Route>
        </Routes>
    );
}

export default App;
