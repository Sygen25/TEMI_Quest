import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import Quiz from './pages/Quiz';
import Profile from './pages/Profile';
import Notifications from './pages/Notifications';
import AdminPanel from './pages/AdminPanel';
import Settings from './pages/Settings';
import { UserProvider } from './contexts/UserContext';

function App() {
    return (
        <BrowserRouter>
            <UserProvider>
                <Routes>
                    <Route path="/" element={<Dashboard />} />
                    <Route path="/profile" element={<Profile />} />
                    <Route path="/quiz/:topic" element={<Quiz />} />
                    <Route path="/notifications" element={<Notifications />} />
                    <Route path="/admin" element={<AdminPanel />} />
                    <Route path="/settings" element={<Settings />} />
                    <Route path="*" element={<Navigate to="/" />} />
                </Routes>
            </UserProvider>
        </BrowserRouter>
    );
}

export default App;
