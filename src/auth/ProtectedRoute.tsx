import { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { UserRole } from '../api/users';

interface ProtectedRouteProps {
  children: ReactNode;
  allowedRoles?: UserRole[];
}

/**
 * A wrapper component for routes that require authentication
 * and optional role-based authorization
 */
const ProtectedRoute = ({ children, allowedRoles }: ProtectedRouteProps) => {
  const { user, profile, loading, profileLoading } = useAuth();
  const location = useLocation();

  // Show loading state while auth is being determined
  if (loading || profileLoading) {
    return (
      <div className="flex items-center justify-center w-full h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  // If not authenticated, redirect to login
  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // If we need role-based access control and have a profile
  if (allowedRoles && profile) {
    // Check if user's role is in the allowed roles
    if (!allowedRoles.includes(profile.role)) {
      // Redirect to dashboard if user doesn't have the required role
      return <Navigate to="/dashboard" replace />;
    }
  }

  // If all checks pass, render the children
  return <>{children}</>;
};

export default ProtectedRoute; 