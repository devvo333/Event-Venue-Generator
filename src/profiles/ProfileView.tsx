import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { getUserProfile } from '../api/users';
import type { UserProfile } from '../api/users';

const ProfileView = () => {
  const { id } = useParams<{ id: string }>();
  const { profile: currentUserProfile } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const isOwnProfile = id === currentUserProfile?.id || !id;
  const profileId = isOwnProfile ? currentUserProfile?.id : id;

  useEffect(() => {
    const fetchProfile = async () => {
      if (!profileId) {
        setLoading(false);
        return;
      }
      
      try {
        const { profile, error } = await getUserProfile(profileId);
        
        if (error) {
          throw error;
        }
        
        setProfile(profile);
      } catch (err: any) {
        console.error('Error fetching profile:', err);
        setError(err.message || 'Failed to load profile');
      } finally {
        setLoading(false);
      }
    };
    
    fetchProfile();
  }, [profileId]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative">
        <span className="block sm:inline">{error}</span>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded relative">
        <span className="block sm:inline">Profile not found</span>
      </div>
    );
  }

  return (
    <div className="bg-white shadow overflow-hidden sm:rounded-lg">
      <div className="px-4 py-5 sm:px-6 flex justify-between items-center">
        <div>
          <h3 className="text-lg leading-6 font-medium text-gray-900">User Profile</h3>
          <p className="mt-1 max-w-2xl text-sm text-gray-500">Personal details and account information</p>
        </div>
        {isOwnProfile && (
          <Link
            to="/profile/edit"
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Edit Profile
          </Link>
        )}
      </div>
      <div className="border-t border-gray-200">
        <dl>
          <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
            <dt className="text-sm font-medium text-gray-500">Full name</dt>
            <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{profile.full_name || 'Not provided'}</dd>
          </div>
          <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
            <dt className="text-sm font-medium text-gray-500">Email address</dt>
            <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{profile.email}</dd>
          </div>
          <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
            <dt className="text-sm font-medium text-gray-500">Role</dt>
            <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
              {profile.role === 'venue_owner' && 'Venue Owner'}
              {profile.role === 'stager' && 'Event Stager'}
              {profile.role === 'admin' && 'Administrator'}
            </dd>
          </div>
          {profile.company && (
            <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">Company</dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{profile.company}</dd>
            </div>
          )}
          <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
            <dt className="text-sm font-medium text-gray-500">Member since</dt>
            <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
              {new Date(profile.created_at).toLocaleDateString()}
            </dd>
          </div>
        </dl>
      </div>
    </div>
  );
};

export default ProfileView; 