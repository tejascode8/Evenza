import React, { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const ProtectedRoute = ({ children, adminOnly = false }) => {
    const { user, loading } = useContext(AuthContext);

    // If AuthContext is still loading the user state from localStorage
    if (loading) {
        return (
            <div className="text-center py-20 text-xl font-semibold">
                Loading...
            </div>
        );
    }

    // If user is not authenticated, redirect to login page
    if (!user) {
        return <Navigate to="/login" replace />;
    }

    // If route is admin only and user is not an admin, redirect to user dashboard
    if (adminOnly && user.role !== 'admin') {
        return <Navigate to="/dashboard" replace />;
    }

    return children;
};

export default ProtectedRoute;
