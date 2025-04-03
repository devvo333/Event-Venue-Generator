import React, { useState, useEffect } from 'react';
import { 
  EventType,
  EventRequirements
} from '../../utils/requirementsChecker';
import {
  Booking,
  BookingStatus,
  PaymentStatus,
  Customer,
  createBooking,
  updateBookingStatus
} from '../../utils/bookingManager';
import { BudgetBreakdown } from '../../utils/budgetEstimator';
import { Vendor, VendorCategory } from '../../utils/vendorManager';

interface VenueOption {
  id: string;
  name: string;
  location?: string;
  capacity?: number;
}

interface BookingFormProps {
  existingBooking?: Booking;
  venues?: VenueOption[];
  vendors?: Vendor[];
  savedRequirements?: EventRequirements;
  savedBudget?: BudgetBreakdown;
  onSubmit: (booking: Booking) => void;
  onCancel?: () => void;
  className?: string;
}

const BookingForm: React.FC<BookingFormProps> = ({
  existingBooking,
  venues = [],
  vendors = [],
  savedRequirements,
  savedBudget,
  onSubmit,
  onCancel,
  className = '',
}) => {
  // Form state
  const [eventName, setEventName] = useState<string>(existingBooking?.eventName || '');
  const [eventType, setEventType] = useState<EventType>(existingBooking?.eventType || EventType.WEDDING);
  const [venueId, setVenueId] = useState<string>(existingBooking?.venueId || '');
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [attendeeCount, setAttendeeCount] = useState<number>(existingBooking?.attendeeCount || 100);
  const [status, setStatus] = useState<BookingStatus>(existingBooking?.status || BookingStatus.INQUIRY);
  const [totalAmount, setTotalAmount] = useState<number>(existingBooking?.totalAmount || 0);
  const [depositAmount, setDepositAmount] = useState<number>(existingBooking?.depositAmount || 0);
  
  // Customer information
  const [customer, setCustomer] = useState<Customer>({
    id: existingBooking?.customer?.id || '',
    name: existingBooking?.customer?.name || '',
    email: existingBooking?.customer?.email || '',
    phone: existingBooking?.customer?.phone || '',
    organization: existingBooking?.customer?.organization || '',
    createdAt: existingBooking?.customer?.createdAt || new Date(),
    updatedAt: existingBooking?.customer?.updatedAt || new Date()
  });
  
  // Additional options
  const [specialRequirements, setSpecialRequirements] = useState<string>(existingBooking?.specialRequirements || '');
  const [internalNotes, setInternalNotes] = useState<string>(existingBooking?.internalNotes || '');
  const [selectedVendorIds, setSelectedVendorIds] = useState<string[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showVendorSelection, setShowVendorSelection] = useState<boolean>(false);
  const [selectedBudget, setSelectedBudget] = useState<boolean>(!!savedBudget);
  const [selectedRequirements, setSelectedRequirements] = useState<boolean>(!!savedRequirements);
  
  // Set dates when existing booking is provided
  useEffect(() => {
    if (existingBooking) {
      setStartDate(formatDateForInput(existingBooking.startDate));
      setEndDate(formatDateForInput(existingBooking.endDate));
      
      // Set selected vendor IDs
      if (existingBooking.vendorBookings) {
        setSelectedVendorIds(existingBooking.vendorBookings.map(vb => vb.vendorId));
      }
    }
  }, [existingBooking]);
  
  // Update total amount when budget changes
  useEffect(() => {
    if (selectedBudget && savedBudget) {
      setTotalAmount(savedBudget.grandTotal);
      setDepositAmount(savedBudget.grandTotal * 0.3); // 30% deposit
    }
  }, [selectedBudget, savedBudget]);
  
  // Helper function to format date for input fields
  const formatDateForInput = (date: Date): string => {
    const d = new Date(date);
    let month = '' + (d.getMonth() + 1);
    let day = '' + d.getDate();
    const year = d.getFullYear();
    let hours = '' + d.getHours();
    let minutes = '' + d.getMinutes();

    if (month.length < 2) month = '0' + month;
    if (day.length < 2) day = '0' + day;
    if (hours.length < 2) hours = '0' + hours;
    if (minutes.length < 2) minutes = '0' + minutes;

    return `${year}-${month}-${day}T${hours}:${minutes}`;
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
  
  // Handle customer field changes
  const handleCustomerChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setCustomer({
      ...customer,
      [name]: value
    });
  };
  
  // Toggle vendor selection
  const handleVendorToggle = (vendorId: string) => {
    setSelectedVendorIds(prevIds => {
      if (prevIds.includes(vendorId)) {
        return prevIds.filter(id => id !== vendorId);
      } else {
        return [...prevIds, vendorId];
      }
    });
  };
  
  // Validate form
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    
    if (!eventName.trim()) {
      newErrors.eventName = 'Event name is required';
    }
    
    if (!venueId) {
      newErrors.venueId = 'Venue is required';
    }
    
    if (!startDate) {
      newErrors.startDate = 'Start date is required';
    }
    
    if (!endDate) {
      newErrors.endDate = 'End date is required';
    } else if (new Date(endDate) <= new Date(startDate)) {
      newErrors.endDate = 'End date must be after start date';
    }
    
    if (!attendeeCount || attendeeCount <= 0) {
      newErrors.attendeeCount = 'Valid attendee count is required';
    }
    
    if (!customer.name.trim()) {
      newErrors.customerName = 'Customer name is required';
    }
    
    if (!customer.email.trim()) {
      newErrors.customerEmail = 'Customer email is required';
    } else if (!/\S+@\S+\.\S+/.test(customer.email)) {
      newErrors.customerEmail = 'Invalid email format';
    }
    
    if (!customer.phone.trim()) {
      newErrors.customerPhone = 'Customer phone is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    // Create or update the booking
    if (existingBooking) {
      // Update existing booking
      const updatedBooking: Booking = {
        ...existingBooking,
        eventName,
        eventType,
        venueId,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        attendeeCount,
        status,
        totalAmount,
        depositAmount,
        customer: {
          ...customer,
          updatedAt: new Date()
        },
        specialRequirements,
        internalNotes,
        budgetBreakdown: selectedBudget ? savedBudget : existingBooking.budgetBreakdown,
        requirementIds: selectedRequirements && savedRequirements ? [savedRequirements.eventId] : existingBooking.requirementIds,
        updatedAt: new Date()
      };
      
      onSubmit(updatedBooking);
    } else {
      // Create new booking
      const newBooking = createBooking(
        eventName,
        eventType,
        venueId,
        customer,
        new Date(startDate),
        new Date(endDate),
        attendeeCount,
        totalAmount,
        depositAmount,
        {
          specialRequirements,
          budgetBreakdown: selectedBudget ? savedBudget : undefined,
          requirementIds: selectedRequirements && savedRequirements ? [savedRequirements.eventId] : undefined
        }
      );
      
      onSubmit(newBooking);
    }
  };
  
  return (
    <div className={`bg-white shadow rounded-lg ${className}`}>
      <div className="p-6 border-b border-gray-200">
        <h2 className="text-xl font-semibold text-gray-800">
          {existingBooking ? 'Edit Booking' : 'Create New Booking'}
        </h2>
        <p className="mt-1 text-sm text-gray-600">
          {existingBooking 
            ? 'Update the details for this event booking' 
            : 'Fill out the form below to create a new event booking'}
        </p>
      </div>
      
      <form onSubmit={handleSubmit} className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Event Details Section */}
          <div className="md:col-span-2">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Event Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="eventName" className="block text-sm font-medium text-gray-700 mb-1">
                  Event Name <span className="text-red-600">*</span>
                </label>
                <input
                  type="text"
                  id="eventName"
                  value={eventName}
                  onChange={(e) => setEventName(e.target.value)}
                  className={`block w-full rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm ${
                    errors.eventName ? 'border-red-300' : 'border-gray-300'
                  }`}
                />
                {errors.eventName && (
                  <p className="mt-1 text-sm text-red-600">{errors.eventName}</p>
                )}
              </div>
              
              <div>
                <label htmlFor="eventType" className="block text-sm font-medium text-gray-700 mb-1">
                  Event Type <span className="text-red-600">*</span>
                </label>
                <select
                  id="eventType"
                  value={eventType}
                  onChange={(e) => setEventType(e.target.value as EventType)}
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                >
                  {Object.values(EventType).map((type) => (
                    <option key={type} value={type}>
                      {type.replace('_', ' ').charAt(0).toUpperCase() + type.replace('_', ' ').slice(1).toLowerCase()}
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <label htmlFor="venueId" className="block text-sm font-medium text-gray-700 mb-1">
                  Venue <span className="text-red-600">*</span>
                </label>
                <select
                  id="venueId"
                  value={venueId}
                  onChange={(e) => setVenueId(e.target.value)}
                  className={`block w-full rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm ${
                    errors.venueId ? 'border-red-300' : 'border-gray-300'
                  }`}
                >
                  <option value="">Select a venue</option>
                  {venues.map((venue) => (
                    <option key={venue.id} value={venue.id}>
                      {venue.name} {venue.capacity ? `(max ${venue.capacity})` : ''}
                    </option>
                  ))}
                </select>
                {errors.venueId && (
                  <p className="mt-1 text-sm text-red-600">{errors.venueId}</p>
                )}
              </div>
              
              <div>
                <label htmlFor="attendeeCount" className="block text-sm font-medium text-gray-700 mb-1">
                  Expected Attendees <span className="text-red-600">*</span>
                </label>
                <input
                  type="number"
                  id="attendeeCount"
                  min="1"
                  value={attendeeCount}
                  onChange={(e) => setAttendeeCount(parseInt(e.target.value))}
                  className={`block w-full rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm ${
                    errors.attendeeCount ? 'border-red-300' : 'border-gray-300'
                  }`}
                />
                {errors.attendeeCount && (
                  <p className="mt-1 text-sm text-red-600">{errors.attendeeCount}</p>
                )}
              </div>
              
              <div>
                <label htmlFor="startDate" className="block text-sm font-medium text-gray-700 mb-1">
                  Start Date & Time <span className="text-red-600">*</span>
                </label>
                <input
                  type="datetime-local"
                  id="startDate"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className={`block w-full rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm ${
                    errors.startDate ? 'border-red-300' : 'border-gray-300'
                  }`}
                />
                {errors.startDate && (
                  <p className="mt-1 text-sm text-red-600">{errors.startDate}</p>
                )}
              </div>
              
              <div>
                <label htmlFor="endDate" className="block text-sm font-medium text-gray-700 mb-1">
                  End Date & Time <span className="text-red-600">*</span>
                </label>
                <input
                  type="datetime-local"
                  id="endDate"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className={`block w-full rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm ${
                    errors.endDate ? 'border-red-300' : 'border-gray-300'
                  }`}
                />
                {errors.endDate && (
                  <p className="mt-1 text-sm text-red-600">{errors.endDate}</p>
                )}
              </div>
              
              {existingBooking && (
                <div>
                  <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">
                    Booking Status
                  </label>
                  <select
                    id="status"
                    value={status}
                    onChange={(e) => setStatus(e.target.value as BookingStatus)}
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  >
                    {Object.values(BookingStatus).map((statusOption) => (
                      <option key={statusOption} value={statusOption}>
                        {statusOption.charAt(0).toUpperCase() + statusOption.slice(1)}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>
          </div>
          
          {/* Customer Information Section */}
          <div className="md:col-span-2">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Customer Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                  Customer Name <span className="text-red-600">*</span>
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={customer.name}
                  onChange={handleCustomerChange}
                  className={`block w-full rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm ${
                    errors.customerName ? 'border-red-300' : 'border-gray-300'
                  }`}
                />
                {errors.customerName && (
                  <p className="mt-1 text-sm text-red-600">{errors.customerName}</p>
                )}
              </div>
              
              <div>
                <label htmlFor="organization" className="block text-sm font-medium text-gray-700 mb-1">
                  Organization
                </label>
                <input
                  type="text"
                  id="organization"
                  name="organization"
                  value={customer.organization || ''}
                  onChange={handleCustomerChange}
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                />
              </div>
              
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                  Email <span className="text-red-600">*</span>
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={customer.email}
                  onChange={handleCustomerChange}
                  className={`block w-full rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm ${
                    errors.customerEmail ? 'border-red-300' : 'border-gray-300'
                  }`}
                />
                {errors.customerEmail && (
                  <p className="mt-1 text-sm text-red-600">{errors.customerEmail}</p>
                )}
              </div>
              
              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                  Phone <span className="text-red-600">*</span>
                </label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  value={customer.phone}
                  onChange={handleCustomerChange}
                  className={`block w-full rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm ${
                    errors.customerPhone ? 'border-red-300' : 'border-gray-300'
                  }`}
                />
                {errors.customerPhone && (
                  <p className="mt-1 text-sm text-red-600">{errors.customerPhone}</p>
                )}
              </div>
            </div>
          </div>
          
          {/* Budget & Requirements Section */}
          <div className="md:col-span-2">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Budget & Requirements</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Budget Integration */}
              <div className="bg-gray-50 rounded-md p-4">
                <div className="flex items-center">
                  <input
                    id="includeBudget"
                    type="checkbox"
                    checked={selectedBudget}
                    onChange={() => setSelectedBudget(!selectedBudget)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    disabled={!savedBudget}
                  />
                  <label htmlFor="includeBudget" className="ml-2 block text-sm font-medium text-gray-700">
                    Include Budget Estimate
                  </label>
                </div>
                
                {savedBudget ? (
                  <div className="mt-3">
                    <div className="text-sm text-gray-500">Estimated total budget:</div>
                    <div className="text-lg font-bold text-gray-900">
                      {formatCurrency(savedBudget.grandTotal)}
                    </div>
                    <div className="mt-2">
                      <button
                        type="button"
                        onClick={() => {
                          setTotalAmount(savedBudget.grandTotal);
                          setDepositAmount(savedBudget.grandTotal * 0.3);
                        }}
                        className="text-sm text-blue-600 hover:text-blue-800"
                      >
                        Apply to booking total
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="mt-3 text-sm text-gray-500">
                    No budget estimate available. Create one in the Budget Estimator tool.
                  </div>
                )}
              </div>
              
              {/* Requirements Integration */}
              <div className="bg-gray-50 rounded-md p-4">
                <div className="flex items-center">
                  <input
                    id="includeRequirements"
                    type="checkbox"
                    checked={selectedRequirements}
                    onChange={() => setSelectedRequirements(!selectedRequirements)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    disabled={!savedRequirements}
                  />
                  <label htmlFor="includeRequirements" className="ml-2 block text-sm font-medium text-gray-700">
                    Include Requirements Checklist
                  </label>
                </div>
                
                {savedRequirements ? (
                  <div className="mt-3">
                    <div className="text-sm text-gray-500">Requirements for {savedRequirements.eventType} event</div>
                    <div className="text-sm text-gray-700">
                      {savedRequirements.requirements.length} requirements
                    </div>
                  </div>
                ) : (
                  <div className="mt-3 text-sm text-gray-500">
                    No requirements checklist available. Create one in the Requirements tool.
                  </div>
                )}
              </div>
              
              {/* Total Amount */}
              <div>
                <label htmlFor="totalAmount" className="block text-sm font-medium text-gray-700 mb-1">
                  Total Amount ($)
                </label>
                <input
                  type="number"
                  id="totalAmount"
                  min="0"
                  step="0.01"
                  value={totalAmount}
                  onChange={(e) => setTotalAmount(parseFloat(e.target.value))}
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                />
              </div>
              
              {/* Deposit Amount */}
              <div>
                <label htmlFor="depositAmount" className="block text-sm font-medium text-gray-700 mb-1">
                  Required Deposit ($)
                </label>
                <input
                  type="number"
                  id="depositAmount"
                  min="0"
                  step="0.01"
                  value={depositAmount}
                  onChange={(e) => setDepositAmount(parseFloat(e.target.value))}
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                />
                <p className="mt-1 text-xs text-gray-500">
                  Typically 30% of the total amount
                </p>
              </div>
            </div>
          </div>
          
          {/* Vendor Selection Section */}
          <div className="md:col-span-2">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-900">Vendor Selection</h3>
              <button
                type="button"
                onClick={() => setShowVendorSelection(!showVendorSelection)}
                className="text-sm text-blue-600 hover:text-blue-800"
              >
                {showVendorSelection ? 'Hide Vendors' : 'Show Vendors'}
              </button>
            </div>
            
            {showVendorSelection && (
              <div className="border rounded-md p-4 mb-6">
                {vendors.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {vendors.map((vendor) => (
                      <div 
                        key={vendor.id}
                        className={`border rounded-md p-3 cursor-pointer ${
                          selectedVendorIds.includes(vendor.id) 
                            ? 'border-blue-500 bg-blue-50' 
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                        onClick={() => handleVendorToggle(vendor.id)}
                      >
                        <div className="flex items-center">
                          <input
                            type="checkbox"
                            checked={selectedVendorIds.includes(vendor.id)}
                            onChange={() => {}}
                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                          />
                          <div className="ml-3">
                            <h4 className="text-sm font-medium text-gray-900">{vendor.name}</h4>
                            <p className="text-xs text-gray-500">
                              {vendor.category.replace('_', ' ').charAt(0).toUpperCase() + 
                               vendor.category.replace('_', ' ').slice(1).toLowerCase()}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-gray-500">No vendors available. Add vendors in the Vendor Directory.</p>
                )}
              </div>
            )}
          </div>
          
          {/* Special Requirements */}
          <div className="md:col-span-2">
            <label htmlFor="specialRequirements" className="block text-sm font-medium text-gray-700 mb-1">
              Special Requirements
            </label>
            <textarea
              id="specialRequirements"
              rows={3}
              value={specialRequirements}
              onChange={(e) => setSpecialRequirements(e.target.value)}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              placeholder="Enter any special requirements or requests for this event..."
            />
          </div>
          
          {/* Internal Notes */}
          <div className="md:col-span-2">
            <label htmlFor="internalNotes" className="block text-sm font-medium text-gray-700 mb-1">
              Internal Notes
            </label>
            <textarea
              id="internalNotes"
              rows={3}
              value={internalNotes}
              onChange={(e) => setInternalNotes(e.target.value)}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              placeholder="Add internal notes about this booking (not visible to customer)..."
            />
          </div>
        </div>
        
        {/* Form submission buttons */}
        <div className="mt-8 flex justify-end">
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="mr-4 inline-flex justify-center py-2 px-4 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Cancel
            </button>
          )}
          <button
            type="submit"
            className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            {existingBooking ? 'Update Booking' : 'Create Booking'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default BookingForm; 