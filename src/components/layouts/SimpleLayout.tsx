import React from 'react';
import Head from 'next/head';
import { useAuth } from '../../hooks/useAuth';

interface SimpleLayoutProps {
  children: React.ReactNode;
  title?: string;
  description?: string;
}

const SimpleLayout: React.FC<SimpleLayoutProps> = ({ 
  children, 
  title = 'Event Venue Generator',
  description = 'Create and manage event venues with our powerful planning tools',
}) => {
  const { user, signOut } = useAuth();
  
  return (
    <div className="min-h-screen flex flex-col">
      <Head>
        {title && <title>{title}</title>}
        {description && <meta name="description" content={description} />}
      </Head>
      
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex">
              <div className="flex-shrink-0 flex items-center">
                <a href="/" className="text-blue-600 font-bold text-xl">
                  Event Venue Generator
                </a>
              </div>
              
              <nav className="hidden sm:ml-6 sm:flex sm:space-x-8">
                <a
                  href="/venues"
                  className="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium"
                >
                  Venues
                </a>
                <a
                  href="/canvas"
                  className="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium"
                >
                  Canvas
                </a>
                <a
                  href="/venue-capacity"
                  className="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium"
                >
                  Capacity Calculator
                </a>
                <a
                  href="/event-requirements"
                  className="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium"
                >
                  Requirements
                </a>
                <a
                  href="/budget-estimation"
                  className="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium"
                >
                  Budget
                </a>
                <a
                  href="/vendor-directory"
                  className="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium"
                >
                  Vendors
                </a>
                <a
                  href="/booking-management"
                  className="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium"
                >
                  Bookings
                </a>
                <a
                  href="/activity-dashboard"
                  className="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium"
                >
                  Activity
                </a>
              </nav>
            </div>
            
            <div className="flex items-center">
              {user ? (
                <div className="ml-3 relative flex items-center space-x-4">
                  <span className="text-sm text-gray-700">{user.email}</span>
                  <button
                    onClick={() => signOut()}
                    className="text-sm text-gray-500 hover:text-gray-700"
                  >
                    Sign out
                  </button>
                </div>
              ) : (
                <div className="space-x-4">
                  <a
                    href="/login"
                    className="text-sm text-gray-500 hover:text-gray-700"
                  >
                    Log in
                  </a>
                  <a
                    href="/signup"
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
                  >
                    Sign up
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>
      
      <main className="flex-grow">
        {children}
      </main>
      
      <footer className="bg-white border-t border-gray-200">
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          <div className="md:flex md:items-center md:justify-between">
            <div className="text-center md:text-left">
              <p className="text-sm text-gray-500">
                &copy; {new Date().getFullYear()} Event Venue Generator. All rights reserved.
              </p>
            </div>
            <div className="mt-4 flex justify-center md:mt-0">
              <div className="flex space-x-6">
                <a href="/terms" className="text-sm text-gray-500 hover:text-gray-700">
                  Terms of Service
                </a>
                <a href="/privacy" className="text-sm text-gray-500 hover:text-gray-700">
                  Privacy Policy
                </a>
                <a href="/contact" className="text-sm text-gray-500 hover:text-gray-700">
                  Contact
                </a>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default SimpleLayout; 