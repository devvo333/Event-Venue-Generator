import React, { useState } from 'react';
import { 
  Booking, 
  BookingStatus,
  EventTimeBlock,
  formatBookingStatus
} from '../../utils/bookingManager';
import { EventType } from '../../utils/requirementsChecker';

interface BookingCalendarProps {
  bookings: Booking[];
  onSelectBooking?: (booking: Booking) => void;
  onAddBooking?: (date: Date) => void;
  className?: string;
}

type CalendarView = 'month' | 'week' | 'day';
type DayInfo = {
  date: Date;
  isCurrentMonth: boolean;
  isToday: boolean;
  bookings: Booking[];
  dayEvents: (Booking | EventTimeBlock)[];
};

const BookingCalendar: React.FC<BookingCalendarProps> = ({
  bookings,
  onSelectBooking,
  onAddBooking,
  className = '',
}) => {
  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  const [view, setView] = useState<CalendarView>('month');
  const [selectedVenue, setSelectedVenue] = useState<string>('');
  const [selectedEventType, setSelectedEventType] = useState<string>('');
  
  // Get days in month
  const getDaysInMonth = (year: number, month: number): Date[] => {
    const date = new Date(year, month, 1);
    const days: Date[] = [];
    
    // Get the day of the week the month starts on (0 = Sunday, 6 = Saturday)
    const firstDayOfMonth = date.getDay();
    
    // Add days from previous month to start of the calendar view
    const lastDayOfPreviousMonth = new Date(year, month, 0);
    const daysInPreviousMonth = lastDayOfPreviousMonth.getDate();
    
    for (let i = firstDayOfMonth - 1; i >= 0; i--) {
      days.push(new Date(year, month - 1, daysInPreviousMonth - i));
    }
    
    // Add days of the current month
    while (date.getMonth() === month) {
      days.push(new Date(date));
      date.setDate(date.getDate() + 1);
    }
    
    // Add days of the next month to fill 6 weeks view
    const daysNeededFromNextMonth = 42 - days.length; // 6 weeks = 42 days
    for (let i = 1; i <= daysNeededFromNextMonth; i++) {
      days.push(new Date(year, month + 1, i));
    }
    
    return days;
  };
  
  // Get days in week
  const getDaysInWeek = (date: Date): Date[] => {
    const day = date.getDay();
    const startDate = new Date(date);
    startDate.setDate(date.getDate() - day);
    
    const days: Date[] = [];
    for (let i = 0; i < 7; i++) {
      const nextDay = new Date(startDate);
      nextDay.setDate(startDate.getDate() + i);
      days.push(nextDay);
    }
    
    return days;
  };
  
  // Get hours in day
  const getHoursInDay = (): number[] => {
    return Array.from({ length: 24 }, (_, i) => i);
  };
  
  // Filter bookings by venue and event type
  const filteredBookings = bookings.filter(booking => {
    if (selectedVenue && booking.venueId !== selectedVenue) return false;
    if (selectedEventType && booking.eventType !== selectedEventType) return false;
    return true;
  });
  
  // Get bookings for a specific day
  const getBookingsForDay = (date: Date): Booking[] => {
    return filteredBookings.filter(booking => {
      const bookingStart = new Date(booking.startDate);
      const bookingEnd = new Date(booking.endDate);
      
      // Check if booking falls on this day
      return (
        (date.getFullYear() === bookingStart.getFullYear() &&
         date.getMonth() === bookingStart.getMonth() &&
         date.getDate() === bookingStart.getDate()) ||
        (date.getFullYear() === bookingEnd.getFullYear() &&
         date.getMonth() === bookingEnd.getMonth() &&
         date.getDate() === bookingEnd.getDate()) ||
        (date > bookingStart && date < bookingEnd)
      );
    });
  };
  
  // Get all event time blocks for a day (including bookings and their time blocks)
  const getEventsForDay = (date: Date): (Booking | EventTimeBlock)[] => {
    const dayBookings = getBookingsForDay(date);
    const events: (Booking | EventTimeBlock)[] = [...dayBookings];
    
    // Add time blocks from bookings
    dayBookings.forEach(booking => {
      if (booking.timeBlocks) {
        booking.timeBlocks.forEach(timeBlock => {
          const blockStart = new Date(timeBlock.startTime);
          const blockEnd = new Date(timeBlock.endTime);
          
          // Check if time block falls on this day
          if (
            (date.getFullYear() === blockStart.getFullYear() &&
             date.getMonth() === blockStart.getMonth() &&
             date.getDate() === blockStart.getDate()) ||
            (date.getFullYear() === blockEnd.getFullYear() &&
             date.getMonth() === blockEnd.getMonth() &&
             date.getDate() === blockEnd.getDate()) ||
            (date > blockStart && date < blockEnd)
          ) {
            events.push(timeBlock);
          }
        });
      }
    });
    
    return events;
  };
  
  // Check if a date is today
  const isToday = (date: Date): boolean => {
    const today = new Date();
    return (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    );
  };
  
  // Format date
  const formatDate = (date: Date, format: 'short' | 'long' = 'short'): string => {
    if (format === 'short') {
      return date.toLocaleDateString();
    } else {
      return date.toLocaleDateString(undefined, {
        weekday: 'long',
        month: 'long',
        day: 'numeric',
        year: 'numeric'
      });
    }
  };
  
  // Format time
  const formatTime = (date: Date): string => {
    return date.toLocaleTimeString(undefined, {
      hour: '2-digit',
      minute: '2-digit'
    });
  };
  
  // Go to previous period
  const goToPrevious = () => {
    const newDate = new Date(currentDate);
    
    if (view === 'month') {
      newDate.setMonth(newDate.getMonth() - 1);
    } else if (view === 'week') {
      newDate.setDate(newDate.getDate() - 7);
    } else {
      newDate.setDate(newDate.getDate() - 1);
    }
    
    setCurrentDate(newDate);
  };
  
  // Go to next period
  const goToNext = () => {
    const newDate = new Date(currentDate);
    
    if (view === 'month') {
      newDate.setMonth(newDate.getMonth() + 1);
    } else if (view === 'week') {
      newDate.setDate(newDate.getDate() + 7);
    } else {
      newDate.setDate(newDate.getDate() + 1);
    }
    
    setCurrentDate(newDate);
  };
  
  // Go to today
  const goToToday = () => {
    setCurrentDate(new Date());
  };
  
  // Get booking status color
  const getStatusColor = (status: BookingStatus): string => {
    switch (status) {
      case BookingStatus.CONFIRMED:
        return 'bg-green-100 text-green-800';
      case BookingStatus.PENDING:
        return 'bg-yellow-100 text-yellow-800';
      case BookingStatus.INQUIRY:
        return 'bg-blue-100 text-blue-800';
      case BookingStatus.CANCELLED:
        return 'bg-red-100 text-red-800';
      case BookingStatus.COMPLETED:
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };
  
  // Get event type label
  const getEventTypeLabel = (type: EventType): string => {
    return type.replace('_', ' ').charAt(0).toUpperCase() + type.replace('_', ' ').slice(1).toLowerCase();
  };
  
  // Handle day click
  const handleDayClick = (date: Date) => {
    if (onAddBooking) {
      onAddBooking(date);
    }
  };
  
  // Handle booking click
  const handleBookingClick = (e: React.MouseEvent, booking: Booking) => {
    e.stopPropagation();
    if (onSelectBooking) {
      onSelectBooking(booking);
    }
  };
  
  // Render Month View
  const renderMonthView = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const days = getDaysInMonth(year, month);
    
    return (
      <div className="grid grid-cols-7 border-t border-l">
        {/* Day headers */}
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day, index) => (
          <div 
            key={index} 
            className="py-2 px-3 text-sm font-medium text-gray-500 border-b border-r bg-gray-50"
          >
            {day}
          </div>
        ))}
        
        {/* Calendar cells */}
        {days.map((date, index) => {
          const isCurrentMonthDay = date.getMonth() === month;
          const dayBookings = getBookingsForDay(date);
          
          return (
            <div 
              key={index}
              className={`min-h-32 p-2 border-b border-r relative ${
                isCurrentMonthDay ? 'bg-white' : 'bg-gray-50 text-gray-400'
              } ${isToday(date) ? 'bg-blue-50' : ''}`}
              onClick={() => handleDayClick(date)}
            >
              <div className="flex justify-between items-center mb-1">
                <span className={`text-sm font-medium ${isToday(date) ? 'text-blue-600' : ''}`}>
                  {date.getDate()}
                </span>
                
                {dayBookings.length > 0 && (
                  <span className="text-xs bg-gray-200 rounded-full h-5 w-5 flex items-center justify-center">
                    {dayBookings.length}
                  </span>
                )}
              </div>
              
              {/* Show max 3 bookings */}
              <div className="space-y-1">
                {dayBookings.slice(0, 3).map(booking => (
                  <div
                    key={booking.id}
                    className={`text-xs truncate rounded px-1 py-0.5 cursor-pointer ${getStatusColor(booking.status)}`}
                    onClick={(e) => handleBookingClick(e, booking)}
                  >
                    {booking.eventName}
                  </div>
                ))}
                
                {dayBookings.length > 3 && (
                  <div className="text-xs text-gray-500 pl-1">
                    + {dayBookings.length - 3} more
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    );
  };
  
  // Render Week View
  const renderWeekView = () => {
    const days = getDaysInWeek(currentDate);
    const hours = getHoursInDay();
    
    return (
      <div className="flex flex-col">
        {/* Day headers */}
        <div className="grid grid-cols-8 border-t border-l">
          <div className="py-2 px-3 text-sm font-medium text-gray-500 border-b border-r bg-gray-50">
            Hour
          </div>
          
          {days.map((date, index) => (
            <div 
              key={index} 
              className={`py-2 px-3 text-sm font-medium border-b border-r ${
                isToday(date) ? 'bg-blue-50 text-blue-700' : 'bg-gray-50 text-gray-500'
              }`}
            >
              <div>{['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][date.getDay()]}</div>
              <div>{date.getDate()}</div>
            </div>
          ))}
        </div>
        
        {/* Hour rows */}
        {hours.map(hour => (
          <div key={hour} className="grid grid-cols-8 border-l">
            {/* Hour label */}
            <div className="py-2 px-3 text-xs font-medium text-gray-500 border-b border-r bg-gray-50">
              {hour === 0 ? '12 AM' : hour < 12 ? `${hour} AM` : hour === 12 ? '12 PM' : `${hour - 12} PM`}
            </div>
            
            {/* Day cells */}
            {days.map((date, index) => {
              const dayDate = new Date(date);
              dayDate.setHours(hour);
              
              const dayEvents = getEventsForDay(date).filter(event => {
                if ('startDate' in event) {
                  // This is a booking
                  const startHour = new Date(event.startDate).getHours();
                  const endHour = new Date(event.endDate).getHours();
                  return hour >= startHour && hour <= endHour;
                } else {
                  // This is a time block
                  const startHour = new Date(event.startTime).getHours();
                  const endHour = new Date(event.endTime).getHours();
                  return hour >= startHour && hour <= endHour;
                }
              });
              
              return (
                <div 
                  key={index}
                  className={`min-h-14 p-1 border-b border-r relative ${
                    isToday(date) ? 'bg-blue-50' : ''
                  }`}
                  onClick={() => handleDayClick(dayDate)}
                >
                  {dayEvents.map(event => {
                    if ('startDate' in event) {
                      // This is a booking
                      return (
                        <div
                          key={event.id}
                          className={`text-xs truncate rounded px-1 py-0.5 mb-1 cursor-pointer ${getStatusColor(event.status)}`}
                          onClick={(e) => handleBookingClick(e, event)}
                        >
                          {event.eventName}
                        </div>
                      );
                    } else {
                      // This is a time block
                      return (
                        <div
                          key={event.id}
                          className={`text-xs truncate rounded px-1 py-0.5 mb-1 cursor-pointer ${
                            event.isRequired ? 'bg-indigo-100 text-indigo-800' : 'bg-purple-100 text-purple-800'
                          }`}
                        >
                          {event.title}
                        </div>
                      );
                    }
                  })}
                </div>
              );
            })}
          </div>
        ))}
      </div>
    );
  };
  
  // Render Day View
  const renderDayView = () => {
    const hours = getHoursInDay();
    const dayEvents = getEventsForDay(currentDate);
    
    return (
      <div className="flex flex-col">
        {/* Hour rows */}
        {hours.map(hour => {
          const hourDate = new Date(currentDate);
          hourDate.setHours(hour);
          
          const hourEvents = dayEvents.filter(event => {
            if ('startDate' in event) {
              // This is a booking
              const startHour = new Date(event.startDate).getHours();
              const endHour = new Date(event.endDate).getHours();
              return hour >= startHour && hour <= endHour;
            } else {
              // This is a time block
              const startHour = new Date(event.startTime).getHours();
              const endHour = new Date(event.endTime).getHours();
              return hour >= startHour && hour <= endHour;
            }
          });
          
          return (
            <div 
              key={hour} 
              className="grid grid-cols-5 border-l"
              onClick={() => handleDayClick(hourDate)}
            >
              {/* Hour label */}
              <div className="py-2 px-3 text-sm font-medium text-gray-500 border-b border-r bg-gray-50">
                {hour === 0 ? '12 AM' : hour < 12 ? `${hour} AM` : hour === 12 ? '12 PM' : `${hour - 12} PM`}
              </div>
              
              {/* Events cell */}
              <div className="col-span-4 min-h-20 p-2 border-b border-r">
                {hourEvents.map(event => {
                  if ('startDate' in event) {
                    // This is a booking
                    return (
                      <div
                        key={event.id}
                        className={`mb-2 rounded-lg p-2 shadow-sm cursor-pointer ${getStatusColor(event.status)}`}
                        onClick={(e) => handleBookingClick(e, event)}
                      >
                        <div className="font-medium">{event.eventName}</div>
                        <div className="text-xs mt-1">
                          {formatTime(new Date(event.startDate))} - {formatTime(new Date(event.endDate))}
                        </div>
                        <div className="text-xs mt-1">
                          Status: {formatBookingStatus(event.status)}
                        </div>
                        <div className="text-xs">
                          {getEventTypeLabel(event.eventType)} • {event.attendeeCount} attendees
                        </div>
                      </div>
                    );
                  } else {
                    // This is a time block
                    return (
                      <div
                        key={event.id}
                        className={`mb-2 rounded-lg p-2 shadow-sm ${
                          event.isRequired ? 'bg-indigo-100 text-indigo-800' : 'bg-purple-100 text-purple-800'
                        }`}
                      >
                        <div className="font-medium">{event.title}</div>
                        <div className="text-xs mt-1">
                          {formatTime(new Date(event.startTime))} - {formatTime(new Date(event.endTime))}
                        </div>
                        {event.description && (
                          <div className="text-xs mt-1">{event.description}</div>
                        )}
                      </div>
                    );
                  }
                })}
              </div>
            </div>
          );
        })}
      </div>
    );
  };
  
  // Get calendar header based on current view
  const getCalendarHeader = (): string => {
    if (view === 'month') {
      return currentDate.toLocaleDateString(undefined, { month: 'long', year: 'numeric' });
    } else if (view === 'week') {
      const days = getDaysInWeek(currentDate);
      const startDay = days[0];
      const endDay = days[6];
      
      if (startDay.getMonth() === endDay.getMonth()) {
        return `${startDay.toLocaleDateString(undefined, { month: 'long' })} ${startDay.getDate()} - ${endDay.getDate()}, ${startDay.getFullYear()}`;
      } else if (startDay.getFullYear() === endDay.getFullYear()) {
        return `${startDay.toLocaleDateString(undefined, { month: 'short' })} ${startDay.getDate()} - ${endDay.toLocaleDateString(undefined, { month: 'short' })} ${endDay.getDate()}, ${startDay.getFullYear()}`;
      } else {
        return `${startDay.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })} - ${endDay.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}`;
      }
    } else {
      return currentDate.toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });
    }
  };
  
  // Collect unique venues for filtering
  const venues = Array.from(new Set(bookings.map(booking => booking.venueId)));
  
  return (
    <div className={`bg-white rounded-lg shadow overflow-hidden ${className}`}>
      {/* Calendar Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex justify-between items-center">
          <h2 className="text-lg font-semibold text-gray-900">{getCalendarHeader()}</h2>
          
          <div className="flex space-x-2">
            <button
              type="button"
              onClick={goToPrevious}
              className="inline-flex items-center px-3 py-1.5 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
            >
              Prev
            </button>
            <button
              type="button"
              onClick={goToToday}
              className="inline-flex items-center px-3 py-1.5 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
            >
              Today
            </button>
            <button
              type="button"
              onClick={goToNext}
              className="inline-flex items-center px-3 py-1.5 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
            >
              Next
            </button>
          </div>
        </div>
        
        {/* View controls and filters */}
        <div className="flex flex-wrap justify-between items-center mt-4">
          <div className="flex space-x-2">
            <button
              type="button"
              onClick={() => setView('month')}
              className={`px-3 py-1.5 text-sm font-medium rounded-md ${
                view === 'month' 
                ? 'bg-blue-100 text-blue-800' 
                : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              Month
            </button>
            <button
              type="button"
              onClick={() => setView('week')}
              className={`px-3 py-1.5 text-sm font-medium rounded-md ${
                view === 'week' 
                ? 'bg-blue-100 text-blue-800' 
                : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              Week
            </button>
            <button
              type="button"
              onClick={() => setView('day')}
              className={`px-3 py-1.5 text-sm font-medium rounded-md ${
                view === 'day' 
                ? 'bg-blue-100 text-blue-800' 
                : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              Day
            </button>
          </div>
          
          <div className="flex space-x-4 mt-2 sm:mt-0">
            <div>
              <select
                value={selectedVenue}
                onChange={(e) => setSelectedVenue(e.target.value)}
                className="block w-full rounded-md border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              >
                <option value="">All Venues</option>
                {venues.map((venue) => (
                  <option key={venue} value={venue}>
                    {venue}
                  </option>
                ))}
              </select>
            </div>
            
            <div>
              <select
                value={selectedEventType}
                onChange={(e) => setSelectedEventType(e.target.value)}
                className="block w-full rounded-md border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              >
                <option value="">All Event Types</option>
                {Object.values(EventType).map((type) => (
                  <option key={type} value={type}>
                    {getEventTypeLabel(type)}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>
      
      {/* Calendar Body */}
      <div className="overflow-auto">
        {view === 'month' && renderMonthView()}
        {view === 'week' && renderWeekView()}
        {view === 'day' && renderDayView()}
      </div>
    </div>
  );
};

export default BookingCalendar; 