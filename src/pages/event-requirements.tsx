import React, { useState, useEffect } from 'react';
import { NextPage } from 'next';
import Head from 'next/head';
import SimpleLayout from '../components/layouts/SimpleLayout';
import EventRequirementsChecklist from '../components/events/EventRequirementsChecklist';
import VendorRequirementMatcher from '../components/vendors/VendorRequirementMatcher';
import { EventType, EventRequirements } from '../utils/requirementsChecker';
import { Vendor, generateDemoVendors } from '../utils/vendorManager';
import { useRouter } from 'next/router';

const EventRequirementsPage: NextPage = () => {
  const router = useRouter();
  
  const [eventType, setEventType] = useState<EventType>(EventType.WEDDING);
  const [attendeeCount, setAttendeeCount] = useState<number>(100);
  const [savedRequirements, setSavedRequirements] = useState<EventRequirements | null>(null);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const [vendors, setVendors] = useState<Vendor[]>([]);
  
  // Load demo vendors
  useEffect(() => {
    // In a real app, this would be an API call to your backend
    const demoVendors = generateDemoVendors(30);
    setVendors(demoVendors);
  }, []);
  
  // Handle saving event requirements
  const handleSaveRequirements = (requirements: EventRequirements) => {
    setSaveStatus('saving');
    
    // In a real application, this would be an API call to save to your backend
    // Simulating API call with timeout
    setTimeout(() => {
      try {
        // Save to local state (in production this would save to a database)
        setSavedRequirements(requirements);
        
        // Store in localStorage for demo purposes
        localStorage.setItem(`event_requirements_demo`, JSON.stringify(requirements));
        
        setSaveStatus('saved');
        
        // Reset status after 3 seconds
        setTimeout(() => {
          setSaveStatus('idle');
        }, 3000);
      } catch (error) {
        console.error('Error saving requirements:', error);
        setSaveStatus('error');
      }
    }, 1000);
  };
  
  // Load saved requirements for the selected event type
  const loadRequirements = () => {
    // In a real application, this would be an API call to your backend
    // For demo purposes, we're using localStorage
    const savedReqs = localStorage.getItem(`event_requirements_demo`);
    
    if (savedReqs) {
      try {
        const parsed = JSON.parse(savedReqs);
        setSavedRequirements(parsed);
        setEventType(parsed.eventType);
        setAttendeeCount(parsed.attendeeCount);
      } catch (error) {
        console.error('Error parsing saved requirements:', error);
      }
    }
  };
  
  // Handle vendor selection
  const handleVendorSelect = (vendor: Vendor) => {
    // Navigate to vendor directory page with selected vendor
    router.push({
      pathname: '/vendor-directory',
      query: { vendorId: vendor.id }
    });
  };
  
  return (
    <>
      <Head>
        <title>Event Requirements Checklist | Event Venue Generator</title>
        <meta name="description" content="Manage your event requirements with our comprehensive checklist tool" />
      </Head>
      
      <SimpleLayout title="Event Requirements Checklist" description="Track all your event requirements to ensure successful planning">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-6">Event Requirements Checklist</h1>
            <p className="text-lg text-gray-600 max-w-3xl">
              Ensure your event has everything it needs with our comprehensive requirements checklist. 
              Track seating, catering, audiovisual needs, and more for a successful event.
            </p>
          </div>
          
          {/* Event configuration */}
          <div className="bg-white rounded-lg shadow-md p-6 mb-8">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Event Configuration</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="event-type" className="block text-sm font-medium text-gray-700 mb-1">
                  Event Type
                </label>
                <select
                  id="event-type"
                  value={eventType}
                  onChange={(e) => setEventType(e.target.value as EventType)}
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                >
                  {Object.values(EventType).map((type) => (
                    <option key={type} value={type}>
                      {type.replace('_', ' ').charAt(0).toUpperCase() + type.replace('_', ' ').slice(1).toLowerCase()}
                    </option>
                  ))}
                </select>
                <p className="mt-1 text-sm text-gray-500">
                  Different event types have specific requirements
                </p>
              </div>
              
              <div>
                <label htmlFor="attendee-count" className="block text-sm font-medium text-gray-700 mb-1">
                  Expected Attendees
                </label>
                <input
                  type="number"
                  id="attendee-count"
                  min="1"
                  value={attendeeCount}
                  onChange={(e) => setAttendeeCount(parseInt(e.target.value) || 1)}
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                />
                <p className="mt-1 text-sm text-gray-500">
                  Attendee count affects requirements such as seating and catering
                </p>
              </div>
            </div>
            
            <div className="mt-4 flex justify-end">
              {saveStatus === 'saved' && (
                <div className="mr-4 flex items-center text-green-600">
                  <svg className="h-5 w-5 mr-1" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span>Requirements saved successfully!</span>
                </div>
              )}
              
              {saveStatus === 'error' && (
                <div className="mr-4 flex items-center text-red-600">
                  <svg className="h-5 w-5 mr-1" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                  <span>Error saving requirements</span>
                </div>
              )}
              
              <button
                type="button"
                onClick={loadRequirements}
                className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <svg className="h-5 w-5 mr-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                </svg>
                Load Saved Requirements
              </button>
            </div>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
            {/* Requirements checklist - larger column */}
            <div className="lg:col-span-2">
              <EventRequirementsChecklist
                eventType={eventType}
                attendeeCount={attendeeCount}
                venueId="demo_venue"
                savedRequirements={savedRequirements}
                onSave={handleSaveRequirements}
              />
            </div>
            
            {/* Vendor matcher - smaller column */}
            <div className="lg:col-span-1">
              <VendorRequirementMatcher
                requirements={savedRequirements?.requirements || []}
                vendors={vendors}
                onVendorSelect={handleVendorSelect}
              />
              
              {/* Budget planning prompt */}
              <div className="mt-6 bg-green-50 rounded-lg p-4 border border-green-100">
                <h3 className="text-lg font-medium text-green-800 mb-2">Need cost estimates?</h3>
                <p className="text-sm text-green-700 mb-3">
                  Use our budget estimation tool to calculate costs based on your requirements.
                </p>
                <a
                  href="/budget-estimation"
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                >
                  Go to Budget Estimator
                </a>
              </div>
            </div>
          </div>
          
          {/* Informational section */}
          <div className="bg-gray-50 rounded-lg p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">About Event Requirements Planning</h2>
            
            <div className="prose max-w-none">
              <p>
                Comprehensive event requirements planning is crucial for successful events. 
                Our checklist helps ensure that nothing is overlooked and provides:
              </p>
              
              <ul>
                <li><strong>Event-specific requirements</strong> tailored to your event type</li>
                <li><strong>Categorized items</strong> for easy organization and delegation</li>
                <li><strong>Priority indicators</strong> to focus on the most important tasks first</li>
                <li><strong>Assignable responsibilities</strong> to keep track of who handles what</li>
                <li><strong>Progress tracking</strong> to visualize completion status</li>
              </ul>
              
              <p>
                For best results, start your requirements checklist at least 3-6 months before your event,
                depending on the size and complexity. Update regularly and share with your planning team.
              </p>
              
              <div className="p-4 border border-blue-100 rounded-md bg-blue-50 my-4">
                <h3 className="text-blue-800 font-medium">Pro Tips</h3>
                <ul className="mt-2 text-blue-700 space-y-1">
                  <li>Connect your requirements checklist with your budget planner for cost tracking</li>
                  <li>Use the venue capacity calculator to ensure your space can accommodate all requirements</li>
                  <li>Share your checklist with vendors to clarify responsibilities</li>
                  <li>Set due dates for critical requirements to stay on track</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </SimpleLayout>
    </>
  );
};

export default EventRequirementsPage; 