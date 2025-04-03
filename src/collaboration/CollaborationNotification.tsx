import React, { useState, useEffect } from 'react';
import { useCollaboration } from './CollaborationContext';

interface Notification {
  id: string;
  message: string;
  type: 'info' | 'success' | 'warning';
  timestamp: number;
}

const CollaborationNotification: React.FC = () => {
  const { isCollaborating, participants } = useCollaboration();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [prevParticipants, setPrevParticipants] = useState(participants);

  // Compare previous and current participants to detect changes
  useEffect(() => {
    if (!isCollaborating) return;

    // Check for new participants
    participants.forEach(participant => {
      const isNew = !prevParticipants.some(p => p.id === participant.id);
      if (isNew) {
        addNotification(
          `${participant.full_name} joined the collaboration`,
          'info'
        );
      }
    });

    // Check for participants who left
    prevParticipants.forEach(prevParticipant => {
      const hasLeft = !participants.some(p => p.id === prevParticipant.id);
      if (hasLeft) {
        addNotification(
          `${prevParticipant.full_name} left the collaboration`,
          'warning'
        );
      }
    });

    setPrevParticipants(participants);
  }, [participants, isCollaborating]);

  // Add a new notification
  const addNotification = (message: string, type: 'info' | 'success' | 'warning') => {
    const newNotification: Notification = {
      id: Date.now().toString(),
      message,
      type,
      timestamp: Date.now()
    };

    setNotifications(prev => [newNotification, ...prev].slice(0, 5)); // Keep only the last 5 notifications

    // Auto-remove notifications after 5 seconds
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== newNotification.id));
    }, 5000);
  };

  if (!isCollaborating || notifications.length === 0) {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 space-y-2 max-w-sm">
      {notifications.map(notification => (
        <div 
          key={notification.id}
          className={`px-4 py-3 rounded-lg shadow-lg animate-slide-up flex items-center ${
            notification.type === 'info' 
              ? 'bg-blue-50 text-blue-800 border-l-4 border-blue-500' 
              : notification.type === 'success'
                ? 'bg-green-50 text-green-800 border-l-4 border-green-500'
                : 'bg-amber-50 text-amber-800 border-l-4 border-amber-500'
          }`}
        >
          {notification.type === 'info' && (
            <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
          )}
          {notification.type === 'success' && (
            <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
          )}
          {notification.type === 'warning' && (
            <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
          )}
          <span>{notification.message}</span>
        </div>
      ))}
    </div>
  );
};

export default CollaborationNotification; 