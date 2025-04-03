import React, { ReactNode } from 'react';
import Head from 'next/head';
import { useAuth } from '../hooks/useAuth';

interface SimpleLayoutProps {
  children: ReactNode;
  title?: string;
  description?: string;
}

const SimpleLayout: React.FC<SimpleLayoutProps> = ({
  children,
  title = 'Event Venue Generator',
  description = 'Create and manage event venues with our easy-to-use platform',
}) => {
  const { session, profile } = useAuth();
  const isLoggedIn = !!session;

  return (
    <>
      <Head>
        <title>{title}</title>
        <meta name="description" content={description} />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      <div className="min-h-screen flex flex-col">
        {/* Header */}
        <header className="bg-white shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between h-16">
              <div className="flex">
                <div className="flex-shrink-0 flex items-center">
                  <a href="/" className="text-xl font-bold text-blue-600">
                    Event Venue Generator
                  </a>
                </div>
                <nav className="hidden sm:ml-6 sm:flex sm:space-x-8">
                  <a href="/venues" className="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium">
                    Venues
                  </a>
                  <a href="/canvas" className="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium">
                    Canvas
                  </a>
                  <a href="/activity-dashboard" className="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium">
                    Activity
                  </a>
                </nav>
              </div>
              <div className="hidden sm:ml-6 sm:flex sm:items-center">
                {isLoggedIn ? (
                  <div className="flex items-center space-x-4">
                    <span className="text-sm text-gray-700">
                      {profile?.email}
                    </span>
                    <a href="/profile" className="text-gray-500 hover:text-gray-700">
                      Profile
                    </a>
                    <a href="/logout" className="text-gray-500 hover:text-gray-700">
                      Logout
                    </a>
                  </div>
                ) : (
                  <div className="flex items-center space-x-4">
                    <a href="/login" className="text-gray-500 hover:text-gray-700">
                      Login
                    </a>
                    <a href="/signup" className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium">
                      Sign Up
                    </a>
                  </div>
                )}
              </div>
            </div>
          </div>
        </header>

        {/* Main content */}
        <main className="flex-grow bg-gray-50">
          {children}
        </main>

        {/* Footer */}
        <footer className="bg-white">
          <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center">
              <div className="text-sm text-gray-500">
                &copy; {new Date().getFullYear()} Event Venue Generator. All rights reserved.
              </div>
              <div className="flex space-x-6">
                <a href="/terms" className="text-sm text-gray-500 hover:text-gray-700">
                  Terms of Service
                </a>
                <a href="/privacy" className="text-sm text-gray-500 hover:text-gray-700">
                  Privacy Policy
                </a>
                <a href="/contact" className="text-sm text-gray-500 hover:text-gray-700">
                  Contact Us
                </a>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </>
  );
};

export default SimpleLayout; 