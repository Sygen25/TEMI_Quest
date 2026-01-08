import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import Quiz from './pages/Quiz';
import Profile from './pages/Profile';
import Notifications from './pages/Notifications';
import AdminPanel from './pages/AdminPanel';
import Settings from './pages/Settings';
import History from './pages/History';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Analytics from './pages/Analytics';
import { UserProvider, useUser } from './contexts/UserContext';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
    const { user, loading } = useUser();

    if (loading) {
        return (
            <div className="min-h-screen bg-background-light dark:bg-background-dark flex items-center justify-center">
                <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
            </div>
        );
    }

    if (!user) {
        return <Navigate to="/login" replace />;
    }

    return <>{children}</>;
}

function App() {
    return (
        <BrowserRouter>
            <UserProvider>
                <Routes>
                    <Route path="/login" element={<Login />} />
                    <Route path="/signup" element={<Signup />} />

                    <Route path="/" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
                    <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
                    <Route path="/quiz/:topic" element={<ProtectedRoute><Quiz /></ProtectedRoute>} />
                    <Route path="/notifications" element={<ProtectedRoute><Notifications /></ProtectedRoute>} />
                    <Route path="/history" element={<ProtectedRoute><History /></ProtectedRoute>} />
                    <Route path="/admin" element={<ProtectedRoute><AdminPanel /></ProtectedRoute>} />
                    <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
                    <Route path="/analytics" element={<ProtectedRoute><Analytics /></ProtectedRoute>} />
                    <Route path="*" element={<Navigate to="/" />} />
                </Routes>
            </UserProvider>
        </BrowserRouter>
    );
}

export default App;
