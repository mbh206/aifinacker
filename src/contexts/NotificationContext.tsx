import React, { createContext, useContext, useState, ReactNode } from 'react';

// Notification type
type NotificationType = 'success' | 'error' | 'info' | 'warning';

// Notification interface
interface Notification {
	id: string;
	message: string;
	type: NotificationType;
	timeout?: number;
}

// Notification context interface
interface NotificationContextType {
	notifications: Notification[];
	addNotification: (
		message: string,
		type?: NotificationType,
		timeout?: number
	) => void;
	removeNotification: (id: string) => void;
	clearNotifications: () => void;
}

// Create notification context
const NotificationContext = createContext<NotificationContextType | undefined>(
	undefined
);

// Notification provider props
interface NotificationProviderProps {
	children: ReactNode;
}

// Notification provider component
export const NotificationProvider: React.FC<NotificationProviderProps> = ({
	children,
}) => {
	const [notifications, setNotifications] = useState<Notification[]>([]);

	// Add notification
	const addNotification = (
		message: string,
		type: NotificationType = 'info',
		timeout = 5000
	) => {
		const id = Date.now().toString();
		const notification = { id, message, type, timeout };

		setNotifications((prevNotifications) => [
			...prevNotifications,
			notification,
		]);

		// Auto-remove notification after timeout if provided
		if (timeout) {
			setTimeout(() => {
				removeNotification(id);
			}, timeout);
		}
	};

	// Remove notification
	const removeNotification = (id: string) => {
		setNotifications((prevNotifications) =>
			prevNotifications.filter((notification) => notification.id !== id)
		);
	};

	// Clear all notifications
	const clearNotifications = () => {
		setNotifications([]);
	};

	const value = {
		notifications,
		addNotification,
		removeNotification,
		clearNotifications,
	};

	return (
		<NotificationContext.Provider value={value}>
			{children}
			{/* Render notifications */}
			<div className='fixed top-4 right-4 z-50 space-y-2'>
				{notifications.map((notification) => (
					<div
						key={notification.id}
						className={`p-4 rounded shadow-md max-w-md animate-fade-in
              ${
								notification.type === 'success' &&
								'bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100'
							}
              ${
								notification.type === 'error' &&
								'bg-red-100 text-red-800 dark:bg-red-800 dark:text-red-100'
							}
              ${
								notification.type === 'warning' &&
								'bg-yellow-100 text-yellow-800 dark:bg-yellow-800 dark:text-yellow-100'
							}
              ${
								notification.type === 'info' &&
								'bg-blue-100 text-blue-800 dark:bg-blue-800 dark:text-blue-100'
							}`}>
						<div className='flex justify-between items-center'>
							<span>{notification.message}</span>
							<button
								onClick={() => removeNotification(notification.id)}
								className='ml-4 text-gray-500 hover:text-gray-700 dark:text-gray-300 dark:hover:text-gray-100'>
								&times;
							</button>
						</div>
					</div>
				))}
			</div>
		</NotificationContext.Provider>
	);
};

// Hook for using the notification context
export const useNotification = (): NotificationContextType => {
	const context = useContext(NotificationContext);
	if (context === undefined) {
		throw new Error(
			'useNotification must be used within a NotificationProvider'
		);
	}
	return context;
};
