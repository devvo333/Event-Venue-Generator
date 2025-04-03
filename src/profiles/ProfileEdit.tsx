import { useState, useEffect, FormEvent, ChangeEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { updateUserProfile, uploadAvatar } from '../api/users';

const ProfileEdit = () => {
  const { profile, profileLoading } = useAuth();
  const navigate = useNavigate();
  
  const [fullName, setFullName] = useState('');
  const [company, setCompany] = useState('');
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  
  // Initialize form with profile data
  useEffect(() => {
    if (profile) {
      setFullName(profile.full_name || '');
      setCompany(profile.company || '');
      setAvatarPreview(profile.avatar_url || '');
    }
  }, [profile]);
  
  // Handle avatar file selection
  const handleAvatarChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setAvatarFile(file);
      
      // Create a preview URL
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };
  
  // Handle form submission
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    
    if (!profile) {
      return;
    }
    
    setLoading(true);
    setError(null);
    setSuccess(false);
    
    try {
      // If we have a new avatar, upload it first
      if (avatarFile) {
        const { url, error: uploadError } = await uploadAvatar(avatarFile);
        
        if (uploadError) {
          throw new Error('Failed to upload avatar: ' + uploadError.message);
        }
      }
      
      // Update profile data
      const { success, error: updateError } = await updateUserProfile({
        full_name: fullName,
        company,
      });
      
      if (updateError) {
        throw new Error('Failed to update profile: ' + updateError.message);
      }
      
      if (success) {
        setSuccess(true);
        
        // Navigate back to profile view after short delay
        setTimeout(() => {
          navigate('/profile');
        }, 2000);
      }
    } catch (err: any) {
      console.error('Error updating profile:', err);
      setError(err.message || 'An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };
  
  if (profileLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }
  
  if (!profile) {
    return (
      <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded relative">
        <span className="block sm:inline">You need to be logged in to edit your profile</span>
      </div>
    );
  }
  
  return (
    <div className="bg-white shadow overflow-hidden sm:rounded-lg p-6">
      <div className="mb-6">
        <h3 className="text-lg leading-6 font-medium text-gray-900">Edit Profile</h3>
        <p className="mt-1 text-sm text-gray-500">Update your personal information</p>
      </div>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-6">
          <span className="block sm:inline">{error}</span>
        </div>
      )}
      
      {success && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative mb-6">
          <span className="block sm:inline">Profile updated successfully!</span>
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Profile Photo
          </label>
          <div className="mt-2 flex items-center space-x-6">
            <div className="flex-shrink-0">
              <div className="h-24 w-24 rounded-full overflow-hidden bg-gray-100">
                {avatarPreview ? (
                  <img src={avatarPreview} alt="Avatar preview" className="h-full w-full object-cover" />
                ) : (
                  <svg className="h-full w-full text-gray-300" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M24 20.993V24H0v-2.996A14.977 14.977 0 0112.004 15c4.904 0 9.26 2.354 11.996 5.993zM16.002 8.999a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                )}
              </div>
            </div>
            <div>
              <label htmlFor="avatar-upload" className="cursor-pointer bg-white py-2 px-3 border border-gray-300 rounded-md shadow-sm text-sm leading-4 font-medium text-gray-700 hover:bg-gray-50 focus:outline-none">
                Change
              </label>
              <input
                id="avatar-upload"
                name="avatar"
                type="file"
                accept="image/*"
                className="sr-only"
                onChange={handleAvatarChange}
              />
            </div>
          </div>
        </div>
        
        <div>
          <label htmlFor="full-name" className="block text-sm font-medium text-gray-700">
            Full Name
          </label>
          <input
            type="text"
            id="full-name"
            name="fullName"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          />
        </div>
        
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700">
            Email Address
          </label>
          <input
            type="email"
            id="email"
            name="email"
            value={profile.email}
            disabled
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 bg-gray-50 text-gray-500 sm:text-sm"
          />
          <p className="mt-1 text-xs text-gray-500">Email address cannot be changed</p>
        </div>
        
        <div>
          <label htmlFor="company" className="block text-sm font-medium text-gray-700">
            Company or Organization
          </label>
          <input
            type="text"
            id="company"
            name="company"
            value={company}
            onChange={(e) => setCompany(e.target.value)}
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          />
        </div>
        
        <div>
          <label htmlFor="role" className="block text-sm font-medium text-gray-700">
            Role
          </label>
          <input
            type="text"
            id="role"
            name="role"
            value={
              profile.role === 'venue_owner' ? 'Venue Owner' : 
              profile.role === 'stager' ? 'Event Stager' : 'Administrator'
            }
            disabled
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 bg-gray-50 text-gray-500 sm:text-sm"
          />
          <p className="mt-1 text-xs text-gray-500">Contact an administrator to change your role</p>
        </div>
        
        <div className="flex justify-end space-x-3">
          <button
            type="button"
            onClick={() => navigate('/profile')}
            className="py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
          >
            {loading ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ProfileEdit; 