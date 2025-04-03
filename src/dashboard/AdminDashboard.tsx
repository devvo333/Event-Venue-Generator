import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '@hooks/useAuth'
import { supabase } from '@config/supabase'

// Components
import DashboardHeader from '@components/dashboard/DashboardHeader'
import DashboardSidebar from '@components/dashboard/DashboardSidebar'

// Types
interface Stats {
  total_users: number
  total_venues: number
  total_layouts: number
  total_assets: number
  pending_approvals: number
}

interface RecentActivity {
  id: string
  user_email: string
  action: string
  resource_type: string
  resource_name: string
  created_at: string
}

const AdminDashboard = () => {
  const { user, signOut } = useAuth()
  const [stats, setStats] = useState<Stats>({
    total_users: 0,
    total_venues: 0,
    total_layouts: 0,
    total_assets: 0,
    pending_approvals: 0
  })
  const [activities, setActivities] = useState<RecentActivity[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchStats()
    fetchRecentActivity()
  }, [])

  const fetchStats = async () => {
    try {
      // In a real app, these would be aggregated database queries
      // For now, we'll just fetch the counts of each table
      
      const [usersResponse, venuesResponse, layoutsResponse, assetsResponse, approvalsResponse] = await Promise.all([
        supabase.from('profiles').select('id', { count: 'exact', head: true }),
        supabase.from('venues').select('id', { count: 'exact', head: true }),
        supabase.from('layouts').select('id', { count: 'exact', head: true }),
        supabase.from('assets').select('id', { count: 'exact', head: true }),
        supabase.from('assets').select('id', { count: 'exact', head: true }).eq('status', 'pending')
      ])
      
      setStats({
        total_users: usersResponse.count || 0,
        total_venues: venuesResponse.count || 0,
        total_layouts: layoutsResponse.count || 0,
        total_assets: assetsResponse.count || 0,
        pending_approvals: approvalsResponse.count || 0
      })
    } catch (error) {
      console.error('Error fetching admin stats:', error)
    }
  }

  const fetchRecentActivity = async () => {
    try {
      setLoading(true)

      // In a real app, you'd have an activity_log table
      // This is a placeholder implementation
      const { data, error } = await supabase
        .from('activity_logs')
        .select(`
          id,
          created_at,
          action,
          resource_type,
          resource_name,
          profiles:user_id (email)
        `)
        .order('created_at', { ascending: false })
        .limit(10)

      if (error) throw error
      
      // Transform the data to match our interface
      const formattedActivities = data?.map(item => ({
        id: item.id,
        user_email: item.profiles?.email || 'Unknown user',
        action: item.action,
        resource_type: item.resource_type,
        resource_name: item.resource_name,
        created_at: item.created_at
      })) || []
      
      setActivities(formattedActivities)
    } catch (error) {
      console.error('Error fetching activity logs:', error)
      // For demo purposes, generate some sample data
      setActivities([
        {
          id: '1',
          user_email: 'john@example.com',
          action: 'created',
          resource_type: 'venue',
          resource_name: 'Downtown Conference Hall',
          created_at: new Date().toISOString()
        },
        {
          id: '2',
          user_email: 'sarah@example.com',
          action: 'updated',
          resource_type: 'layout',
          resource_name: 'Garden Wedding Setup',
          created_at: new Date(Date.now() - 3600000).toISOString()
        },
        {
          id: '3',
          user_email: 'mike@example.com',
          action: 'uploaded',
          resource_type: 'asset',
          resource_name: 'Chiavari Chair',
          created_at: new Date(Date.now() - 7200000).toISOString()
        }
      ])
    } finally {
      setLoading(false)
    }
  }

  const formatTime = (dateString: string) => {
    const date = new Date(dateString)
    return new Intl.DateTimeFormat('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      month: 'short',
      day: 'numeric'
    }).format(date)
  }

  return (
    <div className="flex h-screen bg-gray-100">
      <DashboardSidebar userRole="admin" />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <DashboardHeader title="Admin Dashboard" user={user} signOut={signOut} />
        
        <main className="flex-1 overflow-y-auto p-4">
          {/* Platform Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
            <div className="bg-white p-4 rounded-lg shadow-sm">
              <h3 className="text-gray-500 text-sm">Total Users</h3>
              <p className="text-2xl font-bold">{stats.total_users}</p>
            </div>
            
            <div className="bg-white p-4 rounded-lg shadow-sm">
              <h3 className="text-gray-500 text-sm">Total Venues</h3>
              <p className="text-2xl font-bold">{stats.total_venues}</p>
            </div>
            
            <div className="bg-white p-4 rounded-lg shadow-sm">
              <h3 className="text-gray-500 text-sm">Total Layouts</h3>
              <p className="text-2xl font-bold">{stats.total_layouts}</p>
            </div>
            
            <div className="bg-white p-4 rounded-lg shadow-sm">
              <h3 className="text-gray-500 text-sm">Total Assets</h3>
              <p className="text-2xl font-bold">{stats.total_assets}</p>
            </div>
            
            <div className="bg-white p-4 rounded-lg shadow-sm">
              <h3 className="text-gray-500 text-sm">Pending Approvals</h3>
              <div className="flex justify-between items-center">
                <p className="text-2xl font-bold">{stats.pending_approvals}</p>
                {stats.pending_approvals > 0 && (
                  <Link 
                    to="/asset-approval" 
                    className="text-xs px-2 py-1 bg-red-50 text-red-500 rounded-full"
                  >
                    Review
                  </Link>
                )}
              </div>
            </div>
          </div>
          
          {/* Quick Actions */}
          <div className="mb-8">
            <h2 className="text-lg font-semibold mb-3">Quick Actions</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Link to="/users" className="card p-4 flex items-center space-x-3 hover:shadow-md transition-shadow">
                <div className="rounded-full bg-blue-100 p-2">
                  <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-medium">Manage Users</h3>
                  <p className="text-sm text-gray-500">View and edit user accounts</p>
                </div>
              </Link>
              
              <Link to="/asset-approval" className="card p-4 flex items-center space-x-3 hover:shadow-md transition-shadow">
                <div className="rounded-full bg-green-100 p-2">
                  <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-medium">Review Assets</h3>
                  <p className="text-sm text-gray-500">Approve pending assets</p>
                </div>
              </Link>
              
              <Link to="/analytics" className="card p-4 flex items-center space-x-3 hover:shadow-md transition-shadow">
                <div className="rounded-full bg-purple-100 p-2">
                  <svg className="w-5 h-5 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-medium">Platform Analytics</h3>
                  <p className="text-sm text-gray-500">View usage statistics</p>
                </div>
              </Link>
            </div>
          </div>
          
          {/* Recent Activity */}
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="p-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold">Recent Activity</h2>
            </div>
            
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      User
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Action
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Resource
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Time
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {loading ? (
                    <tr>
                      <td colSpan={4} className="px-6 py-4 text-center text-sm text-gray-500">
                        Loading activity data...
                      </td>
                    </tr>
                  ) : activities.length > 0 ? (
                    activities.map((activity) => (
                      <tr key={activity.id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {activity.user_email}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {activity.action}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          <span className="capitalize">{activity.resource_type}:</span> {activity.resource_name}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {formatTime(activity.created_at)}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={4} className="px-6 py-4 text-center text-sm text-gray-500">
                        No recent activity found
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            
            <div className="px-4 py-3 bg-gray-50 text-right">
              <Link to="/activity" className="text-sm text-primary font-medium hover:underline">
                View All Activity →
              </Link>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}

export default AdminDashboard 