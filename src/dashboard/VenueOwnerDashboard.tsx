import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '@hooks/useAuth'
import { supabase } from '@config/supabase'

// Components
import DashboardHeader from '@components/dashboard/DashboardHeader'
import DashboardSidebar from '@components/dashboard/DashboardSidebar'
import VenueCard from '@components/venues/VenueCard'

// Types
interface Venue {
  id: string
  name: string
  description: string
  cover_image: string
  created_at: string
  layouts_count: number
}

const VenueOwnerDashboard = () => {
  const { user, signOut } = useAuth()
  const [venues, setVenues] = useState<Venue[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchVenues()
  }, [])

  const fetchVenues = async () => {
    try {
      setLoading(true)
      if (!user) return

      const { data, error } = await supabase
        .from('venues')
        .select(`
          id, 
          name, 
          description, 
          cover_image, 
          created_at,
          layouts_count:layouts(count)
        `)
        .eq('owner_id', user.id)
        .order('created_at', { ascending: false })

      if (error) throw error
      setVenues(data || [])
    } catch (error) {
      console.error('Error fetching venues:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex h-screen bg-gray-100">
      <DashboardSidebar userRole="venue_owner" />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <DashboardHeader title="Venue Dashboard" user={user} signOut={signOut} />
        
        <main className="flex-1 overflow-y-auto p-4">
          <div className="mb-8">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold">My Venues</h2>
              <Link to="/venues/create" className="btn btn-primary">
                + Add New Venue
              </Link>
            </div>
            
            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="bg-white rounded-lg shadow-md h-64 animate-pulse"></div>
                ))}
              </div>
            ) : venues.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {venues.map((venue) => (
                  <VenueCard key={venue.id} venue={venue} />
                ))}
              </div>
            ) : (
              <div className="bg-white p-8 rounded-lg shadow-md text-center">
                <h3 className="text-xl font-semibold mb-2">No venues yet</h3>
                <p className="text-gray-600 mb-4">
                  Start by creating your first venue to begin staging events in your space.
                </p>
                <Link to="/venues/create" className="btn btn-primary">
                  Create Your First Venue
                </Link>
              </div>
            )}
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-bold mb-4">Quick Tips for Venue Owners</h2>
            <ul className="space-y-2 text-gray-700">
              <li className="flex items-start">
                <span className="inline-flex items-center justify-center h-6 w-6 rounded-full bg-blue-100 text-blue-500 mr-2">1</span>
                <span>Upload high-quality photos of your empty spaces from multiple angles</span>
              </li>
              <li className="flex items-start">
                <span className="inline-flex items-center justify-center h-6 w-6 rounded-full bg-blue-100 text-blue-500 mr-2">2</span>
                <span>Include accurate space dimensions to help with proper asset sizing</span>
              </li>
              <li className="flex items-start">
                <span className="inline-flex items-center justify-center h-6 w-6 rounded-full bg-blue-100 text-blue-500 mr-2">3</span>
                <span>Add your own asset library with furniture and decorations you offer</span>
              </li>
              <li className="flex items-start">
                <span className="inline-flex items-center justify-center h-6 w-6 rounded-full bg-blue-100 text-blue-500 mr-2">4</span>
                <span>Create sample layouts to showcase your space's versatility</span>
              </li>
            </ul>
          </div>
        </main>
      </div>
    </div>
  )
}

export default VenueOwnerDashboard 