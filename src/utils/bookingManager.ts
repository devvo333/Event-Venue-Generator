import { EventType, RequirementCategory } from './requirementsChecker';
import { Vendor, VendorBooking, calculateVendorBookingCost } from './vendorManager';
import { BudgetBreakdown, BudgetItem } from './budgetEstimator';

/**
 * Booking status enum
 */
export enum BookingStatus {
  INQUIRY = 'inquiry',
  PENDING = 'pending',
  CONFIRMED = 'confirmed',
  CANCELLED = 'cancelled',
  COMPLETED = 'completed'
}

/**
 * Payment status enum
 */
export enum PaymentStatus {
  UNPAID = 'unpaid',
  DEPOSIT_PAID = 'deposit_paid',
  PARTIALLY_PAID = 'partially_paid',
  PAID = 'paid',
  REFUNDED = 'refunded'
}

/**
 * Payment method enum
 */
export enum PaymentMethod {
  CREDIT_CARD = 'credit_card',
  BANK_TRANSFER = 'bank_transfer',
  PAYPAL = 'paypal',
  CHECK = 'check',
  CASH = 'cash',
  OTHER = 'other'
}

/**
 * Payment interface
 */
export interface Payment {
  id: string;
  bookingId: string;
  amount: number;
  paymentDate: Date;
  paymentMethod: PaymentMethod;
  transactionId?: string;
  notes?: string;
  isDeposit: boolean;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Customer interface
 */
export interface Customer {
  id: string;
  userId?: string;
  name: string;
  email: string;
  phone: string;
  organization?: string;
  address?: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Event Time Block interface for scheduling
 */
export interface EventTimeBlock {
  id: string;
  title: string;
  startTime: Date;
  endTime: Date;
  description?: string;
  location?: string;
  color?: string;
  isRequired: boolean;
}

/**
 * Booking interface
 */
export interface Booking {
  id: string;
  eventName: string;
  eventType: EventType;
  venueId: string;
  customerId: string;
  customer?: Customer;
  startDate: Date;
  endDate: Date;
  attendeeCount: number;
  status: BookingStatus;
  paymentStatus: PaymentStatus;
  totalAmount: number;
  depositAmount: number;
  depositDueDate?: Date;
  balanceDueDate?: Date;
  timeBlocks?: EventTimeBlock[];
  vendorBookings?: VendorBooking[];
  budgetBreakdown?: BudgetBreakdown;
  requirementIds?: string[];
  layoutIds?: string[];
  specialRequirements?: string;
  cancellationReason?: string;
  internalNotes?: string;
  contractUrl?: string;
  attachments?: string[];
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Generate a unique ID
 */
function generateId(): string {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
}

/**
 * Create a new booking
 */
export function createBooking(
  eventName: string,
  eventType: EventType,
  venueId: string,
  customer: Customer,
  startDate: Date,
  endDate: Date,
  attendeeCount: number,
  totalAmount: number,
  depositAmount: number,
  options?: {
    depositDueDate?: Date;
    balanceDueDate?: Date;
    specialRequirements?: string;
    vendorBookings?: VendorBooking[];
    budgetBreakdown?: BudgetBreakdown;
    requirementIds?: string[];
    layoutIds?: string[];
    timeBlocks?: EventTimeBlock[];
  }
): Booking {
  // Create or use existing customer
  let customerId = customer.id;
  
  if (!customerId) {
    customerId = generateId();
    customer = {
      ...customer,
      id: customerId,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    // In a real app, you would save the customer to the database here
  }
  
  // Create the booking
  const booking: Booking = {
    id: generateId(),
    eventName,
    eventType,
    venueId,
    customerId,
    customer,
    startDate,
    endDate,
    attendeeCount,
    status: BookingStatus.INQUIRY,
    paymentStatus: PaymentStatus.UNPAID,
    totalAmount,
    depositAmount,
    depositDueDate: options?.depositDueDate,
    balanceDueDate: options?.balanceDueDate,
    timeBlocks: options?.timeBlocks || [],
    vendorBookings: options?.vendorBookings || [],
    budgetBreakdown: options?.budgetBreakdown,
    requirementIds: options?.requirementIds,
    layoutIds: options?.layoutIds,
    specialRequirements: options?.specialRequirements,
    createdAt: new Date(),
    updatedAt: new Date()
  };
  
  return booking;
}

/**
 * Update a booking status
 */
export function updateBookingStatus(
  booking: Booking,
  status: BookingStatus,
  notes?: string
): Booking {
  return {
    ...booking,
    status,
    internalNotes: notes ? (booking.internalNotes ? `${booking.internalNotes}\n\n${notes}` : notes) : booking.internalNotes,
    updatedAt: new Date()
  };
}

/**
 * Record a payment for a booking
 */
export function recordPayment(
  booking: Booking,
  amount: number,
  paymentMethod: PaymentMethod,
  isDeposit: boolean = false,
  options?: {
    transactionId?: string;
    notes?: string;
  }
): { booking: Booking; payment: Payment } {
  // Create the payment
  const payment: Payment = {
    id: generateId(),
    bookingId: booking.id,
    amount,
    paymentDate: new Date(),
    paymentMethod,
    transactionId: options?.transactionId,
    notes: options?.notes,
    isDeposit,
    createdAt: new Date(),
    updatedAt: new Date()
  };
  
  // Calculate total payments (would come from database in a real app)
  const totalPaid = (booking.paymentStatus === PaymentStatus.DEPOSIT_PAID ? booking.depositAmount : 0) + 
                    (booking.paymentStatus === PaymentStatus.PARTIALLY_PAID ? booking.depositAmount + (booking.totalAmount * 0.5) : 0) +
                    (booking.paymentStatus === PaymentStatus.PAID ? booking.totalAmount : 0) + 
                    amount;
  
  // Update payment status
  let paymentStatus = booking.paymentStatus;
  
  if (isDeposit && amount >= booking.depositAmount) {
    paymentStatus = totalPaid >= booking.totalAmount ? PaymentStatus.PAID : PaymentStatus.DEPOSIT_PAID;
  } else if (totalPaid >= booking.totalAmount) {
    paymentStatus = PaymentStatus.PAID;
  } else if (totalPaid >= booking.depositAmount) {
    paymentStatus = PaymentStatus.PARTIALLY_PAID;
  }
  
  // Update the booking
  const updatedBooking: Booking = {
    ...booking,
    paymentStatus,
    updatedAt: new Date()
  };
  
  return {
    booking: updatedBooking,
    payment
  };
}

/**
 * Calculate booking availability for a venue
 */
export function checkVenueAvailability(
  venueId: string,
  startDate: Date,
  endDate: Date,
  existingBookings: Booking[]
): boolean {
  // Filter bookings for the venue and check for overlaps
  const conflictingBookings = existingBookings.filter(booking => 
    booking.venueId === venueId &&
    booking.status !== BookingStatus.CANCELLED &&
    ((startDate >= booking.startDate && startDate < booking.endDate) ||
     (endDate > booking.startDate && endDate <= booking.endDate) ||
     (startDate <= booking.startDate && endDate >= booking.endDate))
  );
  
  return conflictingBookings.length === 0;
}

/**
 * Add a vendor booking to an event booking
 */
export function addVendorBooking(
  booking: Booking,
  vendor: Vendor,
  packageId: string,
  startTime: string,
  endTime: string,
  options?: {
    quantity?: number;
    hours?: number;
    customRequirements?: string;
  }
): Booking {
  // Calculate costs
  const quantity = options?.quantity || booking.attendeeCount;
  const hours = options?.hours || 4; // Default to 4 hours if not specified
  
  const costBreakdown = calculateVendorBookingCost(
    vendor,
    packageId,
    quantity,
    hours
  );
  
  // Create vendor booking
  const vendorBooking: VendorBooking = {
    id: generateId(),
    vendorId: vendor.id,
    packageId,
    eventId: booking.id,
    userId: booking.customer?.userId || '',
    bookingDate: new Date(),
    serviceDate: booking.startDate,
    startTime,
    endTime,
    status: 'inquiry',
    totalAmount: costBreakdown.total,
    depositAmount: costBreakdown.total * 0.3, // Typical 30% deposit
    depositPaid: false,
    balancePaid: false,
    customRequirements: options?.customRequirements,
    createdAt: new Date(),
    updatedAt: new Date()
  };
  
  // Update the booking with the new vendor booking
  const vendorBookings = booking.vendorBookings ? [...booking.vendorBookings, vendorBooking] : [vendorBooking];
  
  // Recalculate total amount including vendor
  const newTotalAmount = booking.totalAmount + costBreakdown.total;
  const newDepositAmount = booking.depositAmount + vendorBooking.depositAmount;
  
  return {
    ...booking,
    vendorBookings,
    totalAmount: newTotalAmount,
    depositAmount: newDepositAmount,
    updatedAt: new Date()
  };
}

/**
 * Generate event timeline based on bookings
 */
export function generateEventTimeline(booking: Booking): EventTimeBlock[] {
  const timeBlocks: EventTimeBlock[] = [];
  
  // Add event start and end
  timeBlocks.push({
    id: generateId(),
    title: 'Event Start',
    startTime: booking.startDate,
    endTime: new Date(booking.startDate.getTime() + 30 * 60000), // 30 minutes
    description: 'Event officially begins',
    isRequired: true,
    color: '#4f46e5' // indigo
  });
  
  timeBlocks.push({
    id: generateId(),
    title: 'Event End',
    startTime: new Date(booking.endDate.getTime() - 30 * 60000), // 30 minutes before end
    endTime: booking.endDate,
    description: 'Event officially ends',
    isRequired: true,
    color: '#4f46e5' // indigo
  });
  
  // Add vendor setup and service times if available
  if (booking.vendorBookings) {
    booking.vendorBookings.forEach(vendorBooking => {
      // Parse times
      const serviceDate = new Date(vendorBooking.serviceDate);
      const [startHour, startMinute] = vendorBooking.startTime.split(':').map(Number);
      const [endHour, endMinute] = vendorBooking.endTime.split(':').map(Number);
      
      const startTime = new Date(serviceDate);
      startTime.setHours(startHour, startMinute);
      
      const endTime = new Date(serviceDate);
      endTime.setHours(endHour, endMinute);
      
      // Add to timeline
      timeBlocks.push({
        id: generateId(),
        title: `Vendor: ${vendorBooking.vendorId}`, // In a real app, get vendor name
        startTime,
        endTime,
        description: `Vendor service: ${vendorBooking.packageId}`, // In a real app, get package name
        isRequired: true,
        color: '#0891b2' // cyan
      });
    });
  }
  
  // Add event-specific time blocks based on event type
  switch (booking.eventType) {
    case EventType.WEDDING:
      // Add typical wedding timeline
      const ceremonyStart = new Date(booking.startDate);
      const receptionStart = new Date(ceremonyStart.getTime() + 90 * 60000); // 1.5 hours after ceremony
      
      timeBlocks.push({
        id: generateId(),
        title: 'Ceremony',
        startTime: ceremonyStart,
        endTime: new Date(ceremonyStart.getTime() + 60 * 60000), // 1 hour
        description: 'Wedding ceremony',
        isRequired: true,
        color: '#be185d' // pink
      });
      
      timeBlocks.push({
        id: generateId(),
        title: 'Cocktail Hour',
        startTime: new Date(ceremonyStart.getTime() + 60 * 60000), // After ceremony
        endTime: receptionStart,
        description: 'Guests enjoy cocktails while wedding party takes photos',
        isRequired: false,
        color: '#059669' // green
      });
      
      timeBlocks.push({
        id: generateId(),
        title: 'Reception',
        startTime: receptionStart,
        endTime: booking.endDate,
        description: 'Wedding reception with dinner and dancing',
        isRequired: true,
        color: '#be185d' // pink
      });
      
      break;
      
    case EventType.CONFERENCE:
      // Add typical conference timeline
      const morningSessionStart = new Date(booking.startDate);
      const lunchStart = new Date(morningSessionStart.getTime() + 210 * 60000); // 3.5 hours after start
      const afternoonSessionStart = new Date(lunchStart.getTime() + 60 * 60000); // 1 hour after lunch
      
      timeBlocks.push({
        id: generateId(),
        title: 'Registration & Breakfast',
        startTime: morningSessionStart,
        endTime: new Date(morningSessionStart.getTime() + 60 * 60000), // 1 hour
        description: 'Attendee check-in and breakfast',
        isRequired: false,
        color: '#0891b2' // cyan
      });
      
      timeBlocks.push({
        id: generateId(),
        title: 'Morning Sessions',
        startTime: new Date(morningSessionStart.getTime() + 60 * 60000), // After breakfast
        endTime: lunchStart,
        description: 'Morning conference sessions',
        isRequired: true,
        color: '#0891b2' // cyan
      });
      
      timeBlocks.push({
        id: generateId(),
        title: 'Lunch',
        startTime: lunchStart,
        endTime: afternoonSessionStart,
        description: 'Lunch break',
        isRequired: false,
        color: '#059669' // green
      });
      
      timeBlocks.push({
        id: generateId(),
        title: 'Afternoon Sessions',
        startTime: afternoonSessionStart,
        endTime: booking.endDate,
        description: 'Afternoon conference sessions',
        isRequired: true,
        color: '#0891b2' // cyan
      });
      
      break;
      
    // Add other event types as needed
  }
  
  // Combine with any existing time blocks
  return [...(booking.timeBlocks || []), ...timeBlocks];
}

/**
 * Filter bookings based on various criteria
 */
export function filterBookings(
  bookings: Booking[],
  filters: {
    eventType?: EventType;
    startDate?: Date;
    endDate?: Date;
    status?: BookingStatus;
    paymentStatus?: PaymentStatus;
    venueId?: string;
    minAttendees?: number;
    maxAttendees?: number;
    searchTerm?: string;
  }
): Booking[] {
  return bookings.filter(booking => {
    // Filter by event type
    if (filters.eventType && booking.eventType !== filters.eventType) {
      return false;
    }
    
    // Filter by date range
    if (filters.startDate && booking.endDate < filters.startDate) {
      return false;
    }
    
    if (filters.endDate && booking.startDate > filters.endDate) {
      return false;
    }
    
    // Filter by status
    if (filters.status && booking.status !== filters.status) {
      return false;
    }
    
    // Filter by payment status
    if (filters.paymentStatus && booking.paymentStatus !== filters.paymentStatus) {
      return false;
    }
    
    // Filter by venue
    if (filters.venueId && booking.venueId !== filters.venueId) {
      return false;
    }
    
    // Filter by attendee count
    if (filters.minAttendees && booking.attendeeCount < filters.minAttendees) {
      return false;
    }
    
    if (filters.maxAttendees && booking.attendeeCount > filters.maxAttendees) {
      return false;
    }
    
    // Filter by search term
    if (filters.searchTerm) {
      const searchTerm = filters.searchTerm.toLowerCase();
      const matchesEventName = booking.eventName.toLowerCase().includes(searchTerm);
      const matchesCustomerName = booking.customer?.name.toLowerCase().includes(searchTerm);
      
      if (!matchesEventName && !matchesCustomerName) {
        return false;
      }
    }
    
    return true;
  });
}

/**
 * Generate demo bookings for testing
 */
export function generateDemoBookings(count: number = 10): Booking[] {
  const bookings: Booking[] = [];
  const eventTypes = Object.values(EventType);
  const statuses = Object.values(BookingStatus);
  const paymentStatuses = Object.values(PaymentStatus);
  
  const randomDate = (start: Date, end: Date) => {
    return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
  };
  
  // Generate random bookings
  for (let i = 0; i < count; i++) {
    const eventType = eventTypes[Math.floor(Math.random() * eventTypes.length)];
    const status = statuses[Math.floor(Math.random() * statuses.length)];
    const paymentStatus = paymentStatuses[Math.floor(Math.random() * paymentStatuses.length)];
    const attendeeCount = Math.floor(Math.random() * 300) + 20;
    
    // Create start and end dates
    const today = new Date();
    const futureDate = new Date(today);
    futureDate.setDate(futureDate.getDate() + 180); // 6 months in the future
    
    const startDate = randomDate(today, futureDate);
    const endDate = new Date(startDate);
    endDate.setHours(endDate.getHours() + Math.floor(Math.random() * 24) + 2); // 2-26 hours
    
    // Create a customer
    const customer: Customer = {
      id: generateId(),
      name: `Customer ${i + 1}`,
      email: `customer${i + 1}@example.com`,
      phone: `555-${Math.floor(1000 + Math.random() * 9000)}`,
      organization: Math.random() > 0.5 ? `Organization ${i + 1}` : undefined,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    // Calculate random amount
    const baseAmount = attendeeCount * (eventType === EventType.WEDDING ? 150 : 75);
    const totalAmount = baseAmount * (0.8 + Math.random() * 0.8); // 80% to 160% of base
    const depositAmount = totalAmount * 0.3; // 30% deposit
    
    // Create the booking
    const booking = createBooking(
      `${eventType.replace('_', ' ').charAt(0).toUpperCase() + eventType.replace('_', ' ').slice(1).toLowerCase()} Event ${i + 1}`,
      eventType,
      `venue_${Math.floor(Math.random() * 5) + 1}`,
      customer,
      startDate,
      endDate,
      attendeeCount,
      totalAmount,
      depositAmount,
      {
        specialRequirements: Math.random() > 0.7 ? 'Some special requirements for this event.' : undefined
      }
    );
    
    // Override status and payment status for demo purposes
    booking.status = status;
    booking.paymentStatus = paymentStatus;
    
    // Generate timeline
    booking.timeBlocks = generateEventTimeline(booking);
    
    bookings.push(booking);
  }
  
  return bookings;
}

/**
 * Format booking status for display
 */
export function formatBookingStatus(status: BookingStatus): string {
  switch (status) {
    case BookingStatus.INQUIRY:
      return 'Inquiry';
    case BookingStatus.PENDING:
      return 'Pending';
    case BookingStatus.CONFIRMED:
      return 'Confirmed';
    case BookingStatus.CANCELLED:
      return 'Cancelled';
    case BookingStatus.COMPLETED:
      return 'Completed';
    default:
      return 'Unknown';
  }
}

/**
 * Format payment status for display
 */
export function formatPaymentStatus(status: PaymentStatus): string {
  switch (status) {
    case PaymentStatus.UNPAID:
      return 'Unpaid';
    case PaymentStatus.DEPOSIT_PAID:
      return 'Deposit Paid';
    case PaymentStatus.PARTIALLY_PAID:
      return 'Partially Paid';
    case PaymentStatus.PAID:
      return 'Paid';
    case PaymentStatus.REFUNDED:
      return 'Refunded';
    default:
      return 'Unknown';
  }
}

/**
 * Calculate booking statistics
 */
export function calculateBookingStats(bookings: Booking[]): {
  totalBookings: number;
  confirmedBookings: number;
  pendingBookings: number;
  totalRevenue: number;
  averageBookingValue: number;
  upcomingBookings: number;
  cancellationRate: number;
} {
  const totalBookings = bookings.length;
  const confirmedBookings = bookings.filter(b => b.status === BookingStatus.CONFIRMED || b.status === BookingStatus.COMPLETED).length;
  const pendingBookings = bookings.filter(b => b.status === BookingStatus.PENDING).length;
  const cancelledBookings = bookings.filter(b => b.status === BookingStatus.CANCELLED).length;
  
  const totalRevenue = bookings
    .filter(b => b.status !== BookingStatus.CANCELLED)
    .reduce((sum, booking) => sum + booking.totalAmount, 0);
  
  const averageBookingValue = totalBookings > 0 ? totalRevenue / (totalBookings - cancelledBookings) : 0;
  
  const now = new Date();
  const upcomingBookings = bookings.filter(b => 
    b.status !== BookingStatus.CANCELLED && 
    b.status !== BookingStatus.COMPLETED && 
    b.startDate > now
  ).length;
  
  const cancellationRate = totalBookings > 0 ? (cancelledBookings / totalBookings) * 100 : 0;
  
  return {
    totalBookings,
    confirmedBookings,
    pendingBookings,
    totalRevenue,
    averageBookingValue,
    upcomingBookings,
    cancellationRate
  };
} 