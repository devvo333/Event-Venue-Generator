import { useState } from 'react'
import { Link } from 'react-router-dom'
import { User } from '@supabase/supabase-js'

interface DashboardHeaderProps {
  title: string
  user: User | null
  signOut: () => Promise<{ success: boolean; error?: any }>
}

const DashboardHeader = ({ title, user, signOut }: DashboardHeaderProps) => {
  const [dropdownOpen, setDropdownOpen] = useState(false)

  const handleSignOut = async () => {
    await signOut()
  }

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-30">
      <div className="px-6 py-3 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-800">{title}</h1>
        
        <div className="flex items-center space-x-4">
          <Link to="/editor" className="btn btn-primary">
            Create New Layout
          </Link>
          
          <div className="relative">
            <button
              className="flex items-center space-x-2 focus:outline-none"
              onClick={() => setDropdownOpen(!dropdownOpen)}
            >
              <div className="h-8 w-8 rounded-full bg-primary text-white flex items-center justify-center">
                {user?.email?.charAt(0).toUpperCase() || 'U'}
              </div>
              <span className="hidden md:inline">{user?.email}</span>
            </button>
            
            {dropdownOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-40">
                <Link 
                  to="/profile" 
                  className="block px-4 py-2 text-gray-700 hover:bg-gray-100"
                  onClick={() => setDropdownOpen(false)}
                >
                  My Profile
                </Link>
                <Link 
                  to="/settings" 
                  className="block px-4 py-2 text-gray-700 hover:bg-gray-100"
                  onClick={() => setDropdownOpen(false)}
                >
                  Settings
                </Link>
                <button 
                  className="block w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100"
                  onClick={() => {
                    handleSignOut()
                    setDropdownOpen(false)
                  }}
                >
                  Sign Out
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}

export default DashboardHeader 