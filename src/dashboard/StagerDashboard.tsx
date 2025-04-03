import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '@hooks/useAuth'
import { supabase } from '@config/supabase'

// Components
import DashboardHeader from '@components/dashboard/DashboardHeader'
import DashboardSidebar from '@components/dashboard/DashboardSidebar'

// Types
interface Layout {
  id: string
  name: string
  venue_name: string
  thumbnail: string
  updated_at: string
}

const StagerDashboard = () => {
  const { user, signOut } = useAuth()
  const [layouts, setLayouts] = useState<Layout[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchLayouts()
  }, [])

  const fetchLayouts = async () => {
    try {
      setLoading(true)
      if (!user) return

      const { data, error } = await supabase
        .from('layouts')
        .select(`
          id, 
          name, 
          thumbnail, 
          updated_at,
          venues:venue_id (name)
        `)
        .eq('creator_id', user.id)
        .order('updated_at', { ascending: false })
        .limit(6)

      if (error) throw error
      
      const formattedLayouts = data?.map(item => ({
        id: item.id,
        name: item.name,
        venue_name: item.venues?.name || 'Custom Space',
        thumbnail: item.thumbnail,
        updated_at: item.updated_at
      })) || []
      
      setLayouts(formattedLayouts)
    } catch (error) {
      console.error('Error fetching layouts:', error)
    } finally {
      setLoading(false)
    }
  }

  // Helper function to format dates
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return new Intl.DateTimeFormat('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: 'numeric'
    }).format(date)
  }

  return (
    <div className="flex h-screen bg-gray-100">
      <DashboardSidebar userRole="stager" />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <DashboardHeader title="Stager Dashboard" user={user} signOut={signOut} />
        
        <main className="flex-1 overflow-y-auto p-4">
          {/* Quick Actions */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <Link to="/editor" className="card p-4 flex items-center space-x-3 hover:shadow-md transition-shadow">
              <div className="rounded-full bg-blue-100 p-2">
                <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
              </div>
              <div>
                <h3 className="font-medium">Start from scratch</h3>
                <p className="text-sm text-gray-500">Upload a room photo and design</p>
              </div>
            </Link>
            
            <Link to="/browse-venues" className="card p-4 flex items-center space-x-3 hover:shadow-md transition-shadow">
              <div className="rounded-full bg-green-100 p-2">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
              <div>
                <h3 className="font-medium">Browse venues</h3>
                <p className="text-sm text-gray-500">Find registered venues to stage</p>
              </div>
            </Link>
            
            <Link to="/assets" className="card p-4 flex items-center space-x-3 hover:shadow-md transition-shadow">
              <div className="rounded-full bg-purple-100 p-2">
                <svg className="w-6 h-6 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
              </div>
              <div>
                <h3 className="font-medium">Manage assets</h3>
                <p className="text-sm text-gray-500">Upload and organize props</p>
              </div>
            </Link>
          </div>
          
          {/* Recent Layouts */}
          <div className="mb-8">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold">Recent Layouts</h2>
              <Link to="/layouts" className="text-primary font-medium">
                View All
              </Link>
            </div>
            
            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="bg-white rounded-lg shadow-md h-64 animate-pulse"></div>
                ))}
              </div>
            ) : layouts.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {layouts.map((layout) => (
                  <div key={layout.id} className="bg-white rounded-lg shadow-md overflow-hidden">
                    <div 
                      className="h-40 bg-cover bg-center" 
                      style={{ 
                        backgroundImage: `url(${layout.thumbnail || '/placeholder-layout.jpg'})` 
                      }}
                    />
                    <div className="p-4">
                      <h3 className="font-semibold">{layout.name}</h3>
                      <p className="text-sm text-gray-600 mb-2">{layout.venue_name}</p>
                      <div className="flex justify-between items-center">
                        <span className="text-xs text-gray-500">
                          {formatDate(layout.updated_at)}
                        </span>
                        <Link 
                          to={`/editor/${layout.id}`} 
                          className="text-sm px-3 py-1 bg-primary bg-opacity-10 text-primary rounded-md hover:bg-opacity-20"
                        >
                          Edit
                        </Link>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-white p-8 rounded-lg shadow-md text-center">
                <h3 className="text-xl font-semibold mb-2">No layouts yet</h3>
                <p className="text-gray-600 mb-4">
                  Start creating your first layout to visualize your event spaces.
                </p>
                <Link to="/editor" className="btn btn-primary">
                  Create Your First Layout
                </Link>
              </div>
            )}
          </div>
          
          {/* Tips for Stagers */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-bold mb-4">Tips for Event Stagers</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-start">
                <span className="inline-flex items-center justify-center h-6 w-6 rounded-full bg-blue-100 text-blue-500 mr-2">1</span>
                <span className="text-sm">
                  <span className="font-medium block">Take clear photos</span>
                  Shoot rooms with good lighting and minimal distortion
                </span>
              </div>
              <div className="flex items-start">
                <span className="inline-flex items-center justify-center h-6 w-6 rounded-full bg-blue-100 text-blue-500 mr-2">2</span>
                <span className="text-sm">
                  <span className="font-medium block">Use reference points</span>
                  Include something of known size in your photos for scale
                </span>
              </div>
              <div className="flex items-start">
                <span className="inline-flex items-center justify-center h-6 w-6 rounded-full bg-blue-100 text-blue-500 mr-2">3</span>
                <span className="text-sm">
                  <span className="font-medium block">Create your asset library</span>
                  Upload furniture and décor items you use frequently
                </span>
              </div>
              <div className="flex items-start">
                <span className="inline-flex items-center justify-center h-6 w-6 rounded-full bg-blue-100 text-blue-500 mr-2">4</span>
                <span className="text-sm">
                  <span className="font-medium block">Save multiple versions</span>
                  Create alternate layouts to present options to clients
                </span>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}

export default StagerDashboard 