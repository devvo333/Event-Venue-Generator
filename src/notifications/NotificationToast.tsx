import React from 'react';
import { useNotifications, Notification, NotificationType } from './NotificationContext';

// Icons for different notification types
const NotificationIcon: React.FC<{ type: NotificationType }> = ({ type }) => {
  switch (type) {
    case 'success':
      return (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        </svg>
      );
    case 'error':
      return (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      );
    case 'warning':
      return (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-yellow-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
      );
    case 'info':
    default:
      return (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      );
  }
};

// Toast component for a single notification
const Toast: React.FC<{ notification: Notification }> = ({ notification }) => {
  const { dismissNotification } = useNotifications();
  const { id, type, title, message, action } = notification;

  // Background color based on type
  const bgColor = {
    info: 'bg-blue-50 border-blue-200',
    success: 'bg-green-50 border-green-200',
    warning: 'bg-yellow-50 border-yellow-200',
    error: 'bg-red-50 border-red-200',
  }[type];

  return (
    <div 
      className={`rounded-lg border p-4 shadow-md transition-all duration-300 ${bgColor}`}
      role="alert"
    >
      <div className="flex items-start">
        <div className="flex-shrink-0">
          <NotificationIcon type={type} />
        </div>
        <div className="ml-3 flex-1">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-gray-900">{title}</p>
            <button
              type="button"
              className="ml-auto inline-flex text-gray-400 hover:text-gray-500 focus:outline-none"
              onClick={() => dismissNotification(id)}
            >
              <span className="sr-only">Close</span>
              <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </button>
          </div>
          <p className="mt-1 text-sm text-gray-800">{message}</p>
          {action && (
            <div className="mt-3">
              <button
                type="button"
                className="text-sm font-medium text-blue-600 hover:text-blue-500"
                onClick={() => {
                  action.onClick();
                  dismissNotification(id);
                }}
              >
                {action.label}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Notification container component
export const NotificationToast: React.FC = () => {
  const { notifications } = useNotifications();

  if (notifications.length === 0) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center px-4 py-6 pointer-events-none sm:p-6 sm:items-start sm:justify-end">
      <div className="max-w-sm w-full space-y-4">
        {notifications.map((notification) => (
          <div key={notification.id} className="pointer-events-auto">
            <Toast notification={notification} />
          </div>
        ))}
      </div>
    </div>
  );
}; 