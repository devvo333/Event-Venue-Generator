import React, { useState, useEffect } from 'react';
import { NextPage } from 'next';
import Head from 'next/head';
import SimpleLayout from '../components/layouts/SimpleLayout';
import BudgetEstimator from '../components/events/BudgetEstimator';
import { EventType, EventRequirements } from '../utils/requirementsChecker';
import { BudgetBreakdown } from '../utils/budgetEstimator';

const BudgetEstimationPage: NextPage = () => {
  const [eventType, setEventType] = useState<EventType>(EventType.WEDDING);
  const [attendeeCount, setAttendeeCount] = useState<number>(100);
  const [savedRequirements, setSavedRequirements] = useState<EventRequirements | null>(null);
  const [savedBudget, setSavedBudget] = useState<BudgetBreakdown | null>(null);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  
  // Load saved requirements and budget when event type changes
  useEffect(() => {
    // In a real application, this would be an API call
    // For demo purposes, we're using localStorage
    const loadSavedData = () => {
      try {
        // Load saved requirements
        const savedReqs = localStorage.getItem(`event_requirements_demo`);
        if (savedReqs) {
          const parsedReqs = JSON.parse(savedReqs);
          setSavedRequirements(parsedReqs);
          setEventType(parsedReqs.eventType);
          setAttendeeCount(parsedReqs.attendeeCount);
        }
        
        // Load saved budget
        const savedBudgetData = localStorage.getItem(`event_budget_demo`);
        if (savedBudgetData) {
          const parsedBudget = JSON.parse(savedBudgetData);
          setSavedBudget(parsedBudget);
        }
      } catch (error) {
        console.error('Error loading saved data:', error);
      }
    };
    
    loadSavedData();
  }, []);
  
  // Handle saving budget
  const handleSaveBudget = (budget: BudgetBreakdown) => {
    setSaveStatus('saving');
    
    // In a real application, this would be an API call to save to your backend
    // Simulating API call with timeout
    setTimeout(() => {
      try {
        // Save to local state (in production this would save to a database)
        setSavedBudget(budget);
        
        // Store in localStorage for demo purposes
        localStorage.setItem(`event_budget_demo`, JSON.stringify(budget));
        
        setSaveStatus('saved');
        
        // Reset status after 3 seconds
        setTimeout(() => {
          setSaveStatus('idle');
        }, 3000);
      } catch (error) {
        console.error('Error saving budget:', error);
        setSaveStatus('error');
      }
    }, 1000);
  };
  
  return (
    <>
      <Head>
        <title>Budget Estimation | Event Venue Generator</title>
        <meta name="description" content="Estimate and manage your event budget with our comprehensive budgeting tool" />
      </Head>
      
      <SimpleLayout title="Budget Estimation" description="Calculate and optimize your event budget based on requirements and industry standards">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-6">Event Budget Estimation</h1>
            <p className="text-lg text-gray-600 max-w-3xl">
              Plan your event budget with confidence. Our budget estimation tool provides detailed cost 
              breakdowns based on event type, attendee count, and requirements. Compare your budget with 
              industry averages and make informed decisions.
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
                  disabled={!!savedRequirements}
                >
                  {Object.values(EventType).map((type) => (
                    <option key={type} value={type}>
                      {type.replace('_', ' ').charAt(0).toUpperCase() + type.replace('_', ' ').slice(1).toLowerCase()}
                    </option>
                  ))}
                </select>
                {savedRequirements && (
                  <p className="mt-1 text-xs text-gray-500">
                    Using event type from your saved requirements
                  </p>
                )}
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
                  disabled={!!savedRequirements}
                />
                {savedRequirements && (
                  <p className="mt-1 text-xs text-gray-500">
                    Using attendee count from your saved requirements
                  </p>
                )}
              </div>
            </div>
            
            <div className="mt-4">
              {savedRequirements ? (
                <div className="bg-green-50 border border-green-100 rounded-md p-3">
                  <div className="flex">
                    <svg className="h-5 w-5 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <div>
                      <p className="text-sm font-medium text-green-800">
                        Using your saved requirements list
                      </p>
                      <p className="text-sm text-green-700 mt-1">
                        Your budget is based on {savedRequirements.requirements.length} requirements from your event plan.
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="bg-yellow-50 border border-yellow-100 rounded-md p-3">
                  <div className="flex">
                    <svg className="h-5 w-5 text-yellow-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                    </svg>
                    <div>
                      <p className="text-sm font-medium text-yellow-800">
                        No requirements list found
                      </p>
                      <p className="text-sm text-yellow-700 mt-1">
                        Creating a budget estimate based on event type and attendee count. For a more accurate budget, create a <a href="/event-requirements" className="text-yellow-700 underline">requirements checklist</a> first.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
            
            <div className="mt-4 flex justify-end">
              {saveStatus === 'saved' && (
                <div className="mr-4 flex items-center text-green-600">
                  <svg className="h-5 w-5 mr-1" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span>Budget saved successfully!</span>
                </div>
              )}
              
              {saveStatus === 'error' && (
                <div className="mr-4 flex items-center text-red-600">
                  <svg className="h-5 w-5 mr-1" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                  <span>Error saving budget</span>
                </div>
              )}
            </div>
          </div>
          
          {/* Budget estimator component */}
          <BudgetEstimator
            eventType={eventType}
            attendeeCount={attendeeCount}
            requirements={savedRequirements?.requirements || []}
            savedBudget={savedBudget || undefined}
            onSave={handleSaveBudget}
            className="mb-8"
          />
          
          {/* Informational section */}
          <div className="bg-gray-50 rounded-lg p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">About Budget Estimation</h2>
            
            <div className="prose max-w-none">
              <p>
                Accurate budget planning is crucial for successful event execution. Our budget estimator 
                uses industry standards and data to provide realistic cost projections based on your event 
                type, location, time of year, and specific requirements.
              </p>
              
              <h3>How Our Budget Estimator Works</h3>
              
              <p>
                The budget estimation system considers several factors:
              </p>
              
              <ul>
                <li><strong>Event Type:</strong> Different events have different cost structures</li>
                <li><strong>Attendee Count:</strong> More guests mean higher costs for catering, seating, etc.</li>
                <li><strong>Region:</strong> Costs vary significantly by geographic location</li>
                <li><strong>Season:</strong> Peak seasons (summer, holidays) typically cost more</li>
                <li><strong>Venue Size:</strong> Larger venues generally have higher rental costs</li>
                <li><strong>Duration:</strong> Longer events require more staff time and resources</li>
                <li><strong>Amenities:</strong> Additional services increase overall costs</li>
              </ul>
              
              <p>
                When you create a detailed event requirements checklist, our system generates a more 
                precise budget by analyzing each specific requirement and its associated costs.
              </p>
              
              <div className="p-4 border border-blue-100 rounded-md bg-blue-50 my-4">
                <h3 className="text-blue-800 font-medium">Budgeting Tips</h3>
                <ul className="mt-2 text-blue-700 space-y-1">
                  <li>Allocate 15-20% of your budget as a contingency for unexpected expenses</li>
                  <li>Consider seasonality when scheduling - off-peak dates can save 20-30%</li>
                  <li>Prioritize spending on items that impact guest experience the most</li>
                  <li>Get multiple quotes from vendors for major expense categories</li>
                  <li>Track actual expenses against your budget throughout the planning process</li>
                </ul>
              </div>
              
              <p>
                Remember that this tool provides estimates based on industry averages. Your actual costs may 
                vary based on specific vendors, quality levels, and negotiated rates. Always get detailed 
                quotes for significant expenses.
              </p>
            </div>
          </div>
        </div>
      </SimpleLayout>
    </>
  );
};

export default BudgetEstimationPage; 