import React from 'react';
import { NextPage } from 'next';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { useAuth } from '../hooks/useAuth';
import SimpleLayout from '../components/SimpleLayout';
import ActivityHistoryPanel from '../activity/ActivityHistoryPanel';
import ActivityAnalyticsDashboard from '../activity/ActivityAnalyticsDashboard';

const ActivityDashboardPage: NextPage = () => {
  const { session, profileLoading } = useAuth();
  const router = useRouter();
  const isAuthenticated = !!session;
  const isLoading = profileLoading;

  // Redirect to login if not authenticated
  React.useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login?redirect=/activity-dashboard');
    }
  }, [isAuthenticated, isLoading, router]);

  if (isLoading) {
    return (
      <SimpleLayout>
        <div className="flex justify-center items-center h-96">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      </SimpleLayout>
    );
  }

  if (!isAuthenticated) {
    return null; // Will redirect
  }

  return (
    <>
      <Head>
        <title>Activity Dashboard | Event Venue Generator</title>
        <meta name="description" content="Track your activity and usage analytics" />
      </Head>

      <SimpleLayout>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Activity Dashboard</h1>
            <p className="mt-2 text-gray-600">
              Track your activity and view analytics to understand your usage patterns.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column - Analytics */}
            <div className="lg:col-span-2">
              <ActivityAnalyticsDashboard className="mb-8" />
              
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-xl font-medium mb-4">Activity Benefits</h2>
                <div className="space-y-4">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <svg className="h-6 w-6 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div className="ml-3">
                      <h3 className="text-sm font-medium text-gray-900">Track Your Progress</h3>
                      <p className="mt-1 text-sm text-gray-500">
                        See your most frequent actions and understand your usage patterns.
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <svg className="h-6 w-6 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div className="ml-3">
                      <h3 className="text-sm font-medium text-gray-900">Identify Opportunities</h3>
                      <p className="mt-1 text-sm text-gray-500">
                        Discover features you might not be using to their full potential.
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <svg className="h-6 w-6 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div className="ml-3">
                      <h3 className="text-sm font-medium text-gray-900">Optimize Your Workflow</h3>
                      <p className="mt-1 text-sm text-gray-500">
                        Use insights about your most active times to plan your work more effectively.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Right Column - Activity History */}
            <div className="lg:col-span-1">
              <ActivityHistoryPanel className="mb-8" showFilters={true} maxItems={50} />
              
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-xl font-medium mb-4">Activity Privacy</h2>
                <p className="text-sm text-gray-600 mb-4">
                  Your activity data is kept private and is only used to enhance your experience with the Event Venue Generator.
                </p>
                <div className="text-sm text-gray-600">
                  <p className="mb-2">Activity tracking includes:</p>
                  <ul className="list-disc pl-5 space-y-1">
                    <li>Canvas editing actions</li>
                    <li>Asset management</li>
                    <li>Layout saves and exports</li>
                    <li>Venue creation and updates</li>
                    <li>Tool usage patterns</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </SimpleLayout>
    </>
  );
};

export default ActivityDashboardPage; 