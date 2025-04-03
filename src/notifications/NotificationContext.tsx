import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export type NotificationType = 'info' | 'success' | 'warning' | 'error';

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  duration?: number; // in milliseconds, undefined means it won't auto-dismiss
  action?: {
    label: string;
    onClick: () => void;
  };
}

interface NotificationContextType {
  notifications: Notification[];
  addNotification: (notification: Omit<Notification, 'id'>) => string;
  updateNotification: (id: string, notification: Partial<Notification>) => void;
  dismissNotification: (id: string) => void;
  clearAllNotifications: () => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

interface NotificationProviderProps {
  children: ReactNode;
  maxNotifications?: number;
}

export const NotificationProvider: React.FC<NotificationProviderProps> = ({
  children,
  maxNotifications = 5,
}) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  // Handle auto-dismissing notifications
  useEffect(() => {
    const timers: NodeJS.Timeout[] = [];
    
    notifications.forEach((notification) => {
      if (notification.duration) {
        const timer = setTimeout(() => {
          dismissNotification(notification.id);
        }, notification.duration);
        
        timers.push(timer);
      }
    });
    
    return () => {
      timers.forEach(timer => clearTimeout(timer));
    };
  }, [notifications]);

  // Limit the maximum number of notifications
  useEffect(() => {
    if (notifications.length > maxNotifications) {
      // Remove the oldest notifications that don't have actions
      const notificationsToKeep = [...notifications];
      const notificationsWithoutActions = notificationsToKeep.filter(n => !n.action);
      
      if (notificationsWithoutActions.length > 0) {
        // Remove the oldest notification without an action
        const oldestId = notificationsWithoutActions[0].id;
        setNotifications(notifications.filter(n => n.id !== oldestId));
      } else {
        // If all have actions, remove the oldest one
        const oldestId = notificationsToKeep[0].id;
        setNotifications(notifications.filter(n => n.id !== oldestId));
      }
    }
  }, [notifications, maxNotifications]);

  const addNotification = (notification: Omit<Notification, 'id'>): string => {
    const id = String(Date.now());
    const newNotification = { ...notification, id };
    
    setNotifications((prevNotifications) => [...prevNotifications, newNotification]);
    
    return id;
  };

  const updateNotification = (id: string, updates: Partial<Notification>) => {
    setNotifications((prevNotifications) =>
      prevNotifications.map((notification) =>
        notification.id === id
          ? { ...notification, ...updates }
          : notification
      )
    );
  };

  const dismissNotification = (id: string) => {
    setNotifications((prevNotifications) =>
      prevNotifications.filter((notification) => notification.id !== id)
    );
  };

  const clearAllNotifications = () => {
    setNotifications([]);
  };

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        addNotification,
        updateNotification,
        dismissNotification,
        clearAllNotifications,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  
  if (context === undefined) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  
  return context;
}; 