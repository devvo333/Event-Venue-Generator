import React, { useState, useEffect } from 'react';
import { NextPage } from 'next';
import Head from 'next/head';
import SimpleLayout from '../components/layouts/SimpleLayout';
import BookingCalendar from '../components/events/BookingCalendar';
import BookingForm from '../components/events/BookingForm';
import { 
  Booking, 
  BookingStatus, 
  PaymentStatus,
  Customer,
  generateDemoBookings,
  formatBookingStatus,
  calculateBookingStats,
  filterBookings,
  updateBookingStatus
} from '../utils/bookingManager';
import { EventType } from '../utils/requirementsChecker';
import { generateDemoVendors } from '../utils/vendorManager';

interface VenueOption {
  id: string;
  name: string;
  location: string;
  capacity: number;
}

const BookingManagementPage: NextPage = () => {
  // State
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [isCreatingBooking, setIsCreatingBooking] = useState<boolean>(false);
  const [isEditingBooking, setIsEditingBooking] = useState<boolean>(false);
  const [newBookingDate, setNewBookingDate] = useState<Date | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<BookingStatus | ''>('');
  const [eventTypeFilter, setEventTypeFilter] = useState<EventType | ''>('');
  const [vendors, setVendors] = useState<any[]>([]);
  const [venues, setVenues] = useState<VenueOption[]>([]);
  const [bookingStats, setBookingStats] = useState<{
    totalBookings: number;
    confirmedBookings: number;
    pendingBookings: number;
    totalRevenue: number;
    averageBookingValue: number;
    upcomingBookings: number;
    cancellationRate: number;
  }>({
    totalBookings: 0,
    confirmedBookings: 0,
    pendingBookings: 0,
    totalRevenue: 0,
    averageBookingValue: 0,
    upcomingBookings: 0,
    cancellationRate: 0
  });
  
  // Load demo data on mount
  useEffect(() => {
    // Generate demo bookings
    const demoBookings = generateDemoBookings(15);
    setBookings(demoBookings);
    
    // Calculate booking stats
    setBookingStats(calculateBookingStats(demoBookings));
    
    // Generate demo vendors
    const demoVendors = generateDemoVendors(10);
    setVendors(demoVendors);
    
    // Create demo venues
    setVenues([
      {
        id: 'venue_1',
        name: 'Grand Ballroom',
        location: 'Downtown',
        capacity: 500
      },
      {
        id: 'venue_2',
        name: 'Garden Pavilion',
        location: 'Westside',
        capacity: 300
      },
      {
        id: 'venue_3',
        name: 'Conference Center',
        location: 'Business District',
        capacity: 800
      },
      {
        id: 'venue_4',
        name: 'Beach Resort',
        location: 'Coastal Area',
        capacity: 400
      },
      {
        id: 'venue_5',
        name: 'Mountain Retreat',
        location: 'Highland',
        capacity: 250
      },
    ]);
  }, []);
  
  // Filter bookings based on search term and filters
  const filteredBookings = filterBookings(bookings, {
    status: statusFilter as BookingStatus | undefined,
    eventType: eventTypeFilter as EventType | undefined,
    searchTerm
  });
  
  // Handle booking selection
  const handleSelectBooking = (booking: Booking) => {
    setSelectedBooking(booking);
    setIsCreatingBooking(false);
    setIsEditingBooking(false);
  };
  
  // Handle add booking
  const handleAddBooking = (date: Date) => {
    setNewBookingDate(date);
    setIsCreatingBooking(true);
    setSelectedBooking(null);
    setIsEditingBooking(false);
  };
  
  // Handle edit booking
  const handleEditBooking = () => {
    if (selectedBooking) {
      setIsEditingBooking(true);
      setIsCreatingBooking(false);
    }
  };
  
  // Handle booking form submission
  const handleBookingSubmit = (booking: Booking) => {
    if (isEditingBooking) {
      // Update existing booking
      setBookings(prevBookings => 
        prevBookings.map(b => b.id === booking.id ? booking : b)
      );
      setSelectedBooking(booking);
    } else {
      // Add new booking
      setBookings(prevBookings => [...prevBookings, booking]);
      setSelectedBooking(booking);
    }
    
    // Reset state
    setIsCreatingBooking(false);
    setIsEditingBooking(false);
    setNewBookingDate(null);
    
    // Update booking stats
    setBookingStats(calculateBookingStats([...bookings, booking]));
  };
  
  // Handle booking cancellation
  const handleCancelBooking = () => {
    if (selectedBooking) {
      const cancelledBooking = updateBookingStatus(
        selectedBooking,
        BookingStatus.CANCELLED,
        'Cancelled by user'
      );
      
      // Update bookings
      setBookings(prevBookings => 
        prevBookings.map(b => b.id === cancelledBooking.id ? cancelledBooking : b)
      );
      
      // Update selected booking
      setSelectedBooking(cancelledBooking);
      
      // Update booking stats
      setBookingStats(calculateBookingStats(
        bookings.map(b => b.id === cancelledBooking.id ? cancelledBooking : b)
      ));
    }
  };
  
  // Handle booking confirmation
  const handleConfirmBooking = () => {
    if (selectedBooking) {
      const confirmedBooking = updateBookingStatus(
        selectedBooking,
        BookingStatus.CONFIRMED,
        'Confirmed by user'
      );
      
      // Update bookings
      setBookings(prevBookings => 
        prevBookings.map(b => b.id === confirmedBooking.id ? confirmedBooking : b)
      );
      
      // Update selected booking
      setSelectedBooking(confirmedBooking);
      
      // Update booking stats
      setBookingStats(calculateBookingStats(
        bookings.map(b => b.id === confirmedBooking.id ? confirmedBooking : b)
      ));
    }
  };
  
  // Format currency
  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };
  
  // Format date
  const formatDate = (date: Date): string => {
    return new Date(date).toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };
  
  // Format time
  const formatTime = (date: Date): string => {
    return new Date(date).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };
  
  // Get venue name by ID
  const getVenueName = (venueId: string): string => {
    const venue = venues.find(v => v.id === venueId);
    return venue ? venue.name : 'Unknown Venue';
  };
  
  // Render booking details panel
  const renderBookingDetails = () => {
    if (!selectedBooking) {
      return (
        <div className="p-6 text-center">
          <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <h3 className="mt-2 text-sm font-medium text-gray-900">No booking selected</h3>
          <p className="mt-1 text-sm text-gray-500">
            Select a booking from the calendar to view details or click a date to create a new booking.
          </p>
        </div>
      );
    }
    
    return (
      <div className="overflow-auto h-full">
        {/* Booking details header */}
        <div className="border-b border-gray-200 bg-white px-6 py-4">
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-lg font-medium text-gray-900">{selectedBooking.eventName}</h2>
              <p className="text-sm text-gray-500">
                {formatDate(selectedBooking.startDate)} - {formatDate(selectedBooking.endDate)}
              </p>
            </div>
            
            <div className="flex space-x-2">
              {selectedBooking.status !== BookingStatus.CONFIRMED && selectedBooking.status !== BookingStatus.CANCELLED && (
                <button
                  type="button"
                  onClick={handleConfirmBooking}
                  className="inline-flex items-center px-3 py-1.5 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                >
                  Confirm
                </button>
              )}
              
              {selectedBooking.status !== BookingStatus.CANCELLED && (
                <button
                  type="button"
                  onClick={handleCancelBooking}
                  className="inline-flex items-center px-3 py-1.5 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Cancel
                </button>
              )}
              
              <button
                type="button"
                onClick={handleEditBooking}
                className="inline-flex items-center px-3 py-1.5 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Edit
              </button>
            </div>
          </div>
        </div>
        
        {/* Booking details content */}
        <div className="px-6 py-4">
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div>
              <h3 className="text-sm font-medium text-gray-500">Status</h3>
              <p className={`mt-1 text-sm font-medium ${
                selectedBooking.status === BookingStatus.CONFIRMED ? 'text-green-600' :
                selectedBooking.status === BookingStatus.CANCELLED ? 'text-red-600' :
                selectedBooking.status === BookingStatus.PENDING ? 'text-yellow-600' :
                'text-blue-600'
              }`}>
                {formatBookingStatus(selectedBooking.status)}
              </p>
            </div>
            
            <div>
              <h3 className="text-sm font-medium text-gray-500">Event Type</h3>
              <p className="mt-1 text-sm text-gray-900">
                {selectedBooking.eventType.replace('_', ' ').charAt(0).toUpperCase() + 
                 selectedBooking.eventType.replace('_', ' ').slice(1).toLowerCase()}
              </p>
            </div>
            
            <div>
              <h3 className="text-sm font-medium text-gray-500">Venue</h3>
              <p className="mt-1 text-sm text-gray-900">
                {getVenueName(selectedBooking.venueId)}
              </p>
            </div>
            
            <div>
              <h3 className="text-sm font-medium text-gray-500">Attendees</h3>
              <p className="mt-1 text-sm text-gray-900">{selectedBooking.attendeeCount}</p>
            </div>
            
            <div>
              <h3 className="text-sm font-medium text-gray-500">Total Amount</h3>
              <p className="mt-1 text-sm text-gray-900">{formatCurrency(selectedBooking.totalAmount)}</p>
            </div>
            
            <div>
              <h3 className="text-sm font-medium text-gray-500">Deposit</h3>
              <p className="mt-1 text-sm text-gray-900">{formatCurrency(selectedBooking.depositAmount)}</p>
            </div>
          </div>
          
          <div className="mb-6">
            <h3 className="text-sm font-medium text-gray-500 mb-2">Schedule</h3>
            <div className="border rounded-md">
              <div className="border-b px-4 py-2 flex items-center justify-between text-xs text-gray-500 bg-gray-50">
                <span>Start Time</span>
                <span>End Time</span>
              </div>
              
              <div className="px-4 py-2 flex items-center justify-between">
                <span className="text-sm text-gray-900">{formatDate(selectedBooking.startDate)} {formatTime(selectedBooking.startDate)}</span>
                <span className="text-sm text-gray-900">{formatDate(selectedBooking.endDate)} {formatTime(selectedBooking.endDate)}</span>
              </div>
              
              {selectedBooking.timeBlocks && selectedBooking.timeBlocks.length > 0 && (
                <div className="border-t">
                  <div className="px-4 py-2 text-sm font-medium text-gray-900">Time Blocks</div>
                  
                  {selectedBooking.timeBlocks.map(block => (
                    <div key={block.id} className="px-4 py-2 border-t flex items-center justify-between">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{block.title}</div>
                        {block.description && <div className="text-xs text-gray-500">{block.description}</div>}
                      </div>
                      <div className="text-xs text-gray-500">
                        {formatTime(new Date(block.startTime))} - {formatTime(new Date(block.endTime))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
          
          <div className="mb-6">
            <h3 className="text-sm font-medium text-gray-500 mb-2">Customer Information</h3>
            <div className="border rounded-md p-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="text-xs text-gray-500">Name</h4>
                  <p className="text-sm text-gray-900">{selectedBooking.customer?.name}</p>
                </div>
                
                <div>
                  <h4 className="text-xs text-gray-500">Organization</h4>
                  <p className="text-sm text-gray-900">{selectedBooking.customer?.organization || '-'}</p>
                </div>
                
                <div>
                  <h4 className="text-xs text-gray-500">Email</h4>
                  <p className="text-sm text-gray-900">{selectedBooking.customer?.email}</p>
                </div>
                
                <div>
                  <h4 className="text-xs text-gray-500">Phone</h4>
                  <p className="text-sm text-gray-900">{selectedBooking.customer?.phone}</p>
                </div>
              </div>
            </div>
          </div>
          
          {selectedBooking.specialRequirements && (
            <div className="mb-6">
              <h3 className="text-sm font-medium text-gray-500 mb-2">Special Requirements</h3>
              <div className="border rounded-md p-4 text-sm text-gray-900">
                {selectedBooking.specialRequirements}
              </div>
            </div>
          )}
          
          {selectedBooking.internalNotes && (
            <div className="mb-6">
              <h3 className="text-sm font-medium text-gray-500 mb-2">Internal Notes</h3>
              <div className="border rounded-md p-4 bg-yellow-50 text-sm text-gray-900">
                {selectedBooking.internalNotes}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };
  
  return (
    <>
      <Head>
        <title>Booking Management | Event Venue Generator</title>
        <meta name="description" content="Manage event bookings, schedules, and customer information" />
      </Head>
      
      <SimpleLayout title="Booking Management" description="Schedule and manage event bookings">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          {/* Dashboard stats */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-8">
            <div className="bg-white shadow rounded-lg p-4">
              <div className="flex items-center">
                <div className="flex-shrink-0 bg-blue-500 rounded-md p-3">
                  <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Total Bookings</dt>
                    <dd>
                      <div className="text-lg font-medium text-gray-900">{bookingStats.totalBookings}</div>
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
            
            <div className="bg-white shadow rounded-lg p-4">
              <div className="flex items-center">
                <div className="flex-shrink-0 bg-green-500 rounded-md p-3">
                  <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Confirmed Bookings</dt>
                    <dd>
                      <div className="text-lg font-medium text-gray-900">{bookingStats.confirmedBookings}</div>
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
            
            <div className="bg-white shadow rounded-lg p-4">
              <div className="flex items-center">
                <div className="flex-shrink-0 bg-yellow-500 rounded-md p-3">
                  <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Pending Bookings</dt>
                    <dd>
                      <div className="text-lg font-medium text-gray-900">{bookingStats.pendingBookings}</div>
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
            
            <div className="bg-white shadow rounded-lg p-4">
              <div className="flex items-center">
                <div className="flex-shrink-0 bg-indigo-500 rounded-md p-3">
                  <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Total Revenue</dt>
                    <dd>
                      <div className="text-lg font-medium text-gray-900">{formatCurrency(bookingStats.totalRevenue)}</div>
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
          
          <div className="flex flex-col lg:flex-row">
            {/* Left column - Calendar and filters */}
            <div className={`w-full ${isCreatingBooking || isEditingBooking ? 'lg:w-1/2' : 'lg:w-2/3'} lg:pr-4 mb-6 lg:mb-0`}>
              {/* Search and filter bar */}
              <div className="bg-white p-4 rounded-lg shadow mb-4">
                <div className="flex flex-wrap gap-4">
                  <div className="w-full md:w-auto flex-1">
                    <label htmlFor="search" className="sr-only">Search</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <svg className="h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <input
                        id="search"
                        name="search"
                        className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                        placeholder="Search bookings"
                        type="search"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                      />
                    </div>
                  </div>
                  
                  <div className="w-full md:w-auto">
                    <label htmlFor="status-filter" className="sr-only">Status</label>
                    <select
                      id="status-filter"
                      name="status-filter"
                      className="block w-full py-2 pl-3 pr-10 border border-gray-300 rounded-md leading-5 bg-white focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value as BookingStatus | '')}
                    >
                      <option value="">All Statuses</option>
                      {Object.values(BookingStatus).map((status) => (
                        <option key={status} value={status}>
                          {formatBookingStatus(status)}
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  <div className="w-full md:w-auto">
                    <label htmlFor="event-type-filter" className="sr-only">Event Type</label>
                    <select
                      id="event-type-filter"
                      name="event-type-filter"
                      className="block w-full py-2 pl-3 pr-10 border border-gray-300 rounded-md leading-5 bg-white focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                      value={eventTypeFilter}
                      onChange={(e) => setEventTypeFilter(e.target.value as EventType | '')}
                    >
                      <option value="">All Event Types</option>
                      {Object.values(EventType).map((type) => (
                        <option key={type} value={type}>
                          {type.replace('_', ' ').charAt(0).toUpperCase() + type.replace('_', ' ').slice(1).toLowerCase()}
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  <button
                    type="button"
                    onClick={() => setIsCreatingBooking(true)}
                    className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    <svg className="-ml-1 mr-2 h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
                    </svg>
                    New Booking
                  </button>
                </div>
              </div>
              
              {/* Calendar */}
              <BookingCalendar
                bookings={filteredBookings}
                onSelectBooking={handleSelectBooking}
                onAddBooking={handleAddBooking}
                className="h-full"
              />
            </div>
            
            {/* Right column - Details or form */}
            <div className={`w-full ${isCreatingBooking || isEditingBooking ? 'lg:w-1/2' : 'lg:w-1/3'} lg:pl-4 bg-white rounded-lg shadow`}>
              {isCreatingBooking && (
                <BookingForm
                  venues={venues}
                  vendors={vendors}
                  onSubmit={handleBookingSubmit}
                  onCancel={() => setIsCreatingBooking(false)}
                />
              )}
              
              {isEditingBooking && selectedBooking && (
                <BookingForm
                  existingBooking={selectedBooking}
                  venues={venues}
                  vendors={vendors}
                  onSubmit={handleBookingSubmit}
                  onCancel={() => setIsEditingBooking(false)}
                />
              )}
              
              {!isCreatingBooking && !isEditingBooking && renderBookingDetails()}
            </div>
          </div>
        </div>
      </SimpleLayout>
    </>
  );
};

export default BookingManagementPage; 