import { Routes, Route, Navigate } from 'react-router-dom'
import { BrowserRouter } from 'react-router-dom'
import { AuthProvider } from './auth/AuthContext'
import { CollaborationProvider } from './collaboration/CollaborationContext'
import { UserPreferencesProvider } from './preferences/UserPreferencesContext'
import { NotificationProvider } from './notifications/NotificationContext'
import { NotificationToast } from './notifications/NotificationToast'
import { TutorialProvider } from './tutorials/TutorialContext'
import { TutorialTooltip } from './tutorials/TutorialTooltip'
import { editorTutorials } from './tutorials/editorTutorials'

// Auth related components
import Login from './auth/Login'
import Register from './auth/Register'
import ForgotPassword from './auth/ForgotPassword'
import ResetPassword from './auth/ResetPassword'
import ProtectedRoute from './auth/ProtectedRoute'
import { useAuth } from './hooks/useAuth'

// Dashboard layouts
import VenueOwnerDashboard from './dashboard/VenueOwnerDashboard'
import StagerDashboard from './dashboard/StagerDashboard'
import AdminDashboard from './dashboard/AdminDashboard'

// Canvas/Layout components
import EditorPage from './canvas/EditorPage'

// Profile components
import ProfileView from './profiles/ProfileView'
import ProfileEdit from './profiles/ProfileEdit'

// Preferences component
import UserPreferencesPage from './preferences/UserPreferencesPage'

// Venue management components
import VenuesPage from './pages/VenuesPage'
import VenueDetail from './venues/VenueDetail'
import VenueNewPage from './pages/VenueNewPage'
import VenueEditPage from './pages/VenueEditPage'
import VenueShowcasePage from './pages/VenueShowcasePage'

// AR/VR components
import ARViewer from './ar-vr/ARViewer'
import ARDemo from './ar-vr/ARDemo'
import VirtualWalkthrough from './ar-vr/VirtualWalkthrough'
import VRPreview from './ar-vr/VRPreview'

// Marketplace components
import MarketplaceHome from './marketplace/components/MarketplaceHome'
import AssetDetails from './marketplace/components/AssetDetails'

// Main App with routes
function AppRoutes() {
  const { profile, loading } = useAuth()

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-semibold mb-2">Loading Event Venue Generator</h2>
          <div className="animate-pulse h-4 w-48 bg-indigo-600 rounded mx-auto"></div>
        </div>
      </div>
    )
  }

  return (
    <Routes>
      {/* Public routes */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password" element={<ResetPassword />} />
      
      {/* Protected routes */}
      <Route 
        path="/dashboard" 
        element={
          <ProtectedRoute>
            {profile?.role === 'venue_owner' ? (
              <VenueOwnerDashboard />
            ) : profile?.role === 'stager' ? (
              <StagerDashboard />
            ) : profile?.role === 'admin' ? (
              <AdminDashboard />
            ) : (
              <div>Please complete your profile setup</div>
            )}
          </ProtectedRoute>
        } 
      />
      
      <Route 
        path="/editor/:layoutId?" 
        element={
          <ProtectedRoute>
            <EditorPage />
          </ProtectedRoute>
        } 
      />
      
      <Route 
        path="/profile" 
        element={
          <ProtectedRoute>
            <ProfileView />
          </ProtectedRoute>
        } 
      />
      
      <Route 
        path="/profile/edit" 
        element={
          <ProtectedRoute>
            <ProfileEdit />
          </ProtectedRoute>
        } 
      />
      
      <Route 
        path="/preferences" 
        element={
          <ProtectedRoute>
            <UserPreferencesPage />
          </ProtectedRoute>
        } 
      />
      
      {/* Marketplace routes */}
      <Route path="/marketplace" element={<MarketplaceHome />} />
      <Route path="/marketplace/venues" element={<VenueShowcasePage />} />
      <Route path="/marketplace/asset/:assetId" element={<AssetDetails />} />
      <Route path="/marketplace/category/:categoryId" element={<Navigate to="/marketplace" />} />
      <Route path="/marketplace/search" element={<Navigate to="/marketplace" />} />
      <Route path="/marketplace/creators" element={<Navigate to="/marketplace" />} />
      
      {/* AR/VR routes */}
      <Route path="/ar-viewer/:layoutId?" element={<ARViewer />} />
      <Route path="/ar-demo" element={<ARDemo />} />
      <Route path="/virtual-walkthrough/:layoutId?" element={<VirtualWalkthrough />} />
      <Route path="/vr-preview/:layoutId?" element={<VRPreview />} />
      
      {/* Admin-only routes */}
      <Route 
        path="/admin/*" 
        element={
          <ProtectedRoute allowedRoles={['admin']}>
            <AdminDashboard />
          </ProtectedRoute>
        } 
      />
      
      {/* Default redirect */}
      <Route path="*" element={<Navigate to="/dashboard" />} />
    </Routes>
  )
}

// Wrapper with auth provider
function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <NotificationProvider>
          <UserPreferencesProvider>
            <TutorialProvider tutorials={editorTutorials}>
              <CollaborationProvider>
                <div className="min-h-screen bg-gray-50">
                  <NotificationToast />
                  <TutorialTooltip />
                  <AppRoutes />
                </div>
              </CollaborationProvider>
            </TutorialProvider>
          </UserPreferencesProvider>
        </NotificationProvider>
      </AuthProvider>
    </BrowserRouter>
  )
}

export default App 