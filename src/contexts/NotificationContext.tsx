import React, {
	createContext,
	useState,
	useContext,
	useCallback,
	ReactNode,
	useEffect,
} from 'react';
import { AlertTriangle, CheckCircle2, Info, XCircle } from 'lucide-react';

// Notification type definitions
export type NotificationType = 'success' | 'error' | 'warning' | 'info';

// Notification interface
export interface Notification {
	id: string;
	message: string;
	type: NotificationType;
	duration?: number;
}

// Context interface
interface NotificationContextType {
	notifications: Notification[];
	addNotification: (
		message: string,
		type?: NotificationType,
		duration?: number
	) => void;
	removeNotification: (id: string) => void;
	clearNotifications: () => void;
}

// Create the Notification Context
const NotificationContext = createContext<NotificationContextType | undefined>(
	undefined
);

// Notification icons mapping
const NotificationIcons = {
	success: CheckCircle2,
	error: XCircle,
	warning: AlertTriangle,
	info: Info,
};

// Notification Provider Component
export const NotificationProvider: React.FC<{ children: ReactNode }> = ({
	children,
}) => {
	const [notifications, setNotifications] = useState<Notification[]>([]);

	// Add a new notification
	const addNotification = useCallback(
		(message: string, type: NotificationType = 'info', duration = 5000) => {
			const id = Math.random().toString(36).substr(2, 9);
			const newNotification: Notification = {
				id,
				message,
				type,
				duration,
			};

			setNotifications((prev) => [...prev, newNotification]);
		},
		[]
	);

	// Remove a specific notification
	const removeNotification = useCallback((id: string) => {
		setNotifications((prev) =>
			prev.filter((notification) => notification.id !== id)
		);
	}, []);

	// Clear all notifications
	const clearNotifications = useCallback(() => {
		setNotifications([]);
	}, []);

	// Auto-remove notifications after their duration
	useEffect(() => {
		const timers = notifications.map((notification) =>
			setTimeout(
				() => removeNotification(notification.id),
				notification.duration
			)
		);

		// Cleanup timers
		return () => {
			timers.forEach(clearTimeout);
		};
	}, [notifications, removeNotification]);

	return (
		<NotificationContext.Provider
			value={{
				notifications,
				addNotification,
				removeNotification,
				clearNotifications,
			}}>
			{children}
			<NotificationContainer
				notifications={notifications}
				onRemove={removeNotification}
			/>
		</NotificationContext.Provider>
	);
};

// Notification Container Component
const NotificationContainer: React.FC<{
	notifications: Notification[];
	onRemove: (id: string) => void;
}> = ({ notifications, onRemove }) => {
	if (notifications.length === 0) return null;

	return (
		<div className='fixed top-4 right-4 z-50 space-y-2'>
			{notifications.map((notification) => {
				const Icon = NotificationIcons[notification.type];

				return (
					<div
						key={notification.id}
						className={`
              flex items-center p-4 rounded-lg shadow-lg
              transition-all duration-300 ease-in-out
              ${getNotificationClasses(notification.type)}
            `}>
						<Icon className='mr-3 flex-shrink-0' />
						<div className='flex-grow'>{notification.message}</div>
						<button
							onClick={() => onRemove(notification.id)}
							className='ml-4 hover:opacity-75 focus:outline-none'>
							<XCircle className='w-5 h-5' />
						</button>
					</div>
				);
			})}
		</div>
	);
};

// Helper function to get notification styling classes
const getNotificationClasses = (type: NotificationType): string => {
	switch (type) {
		case 'success':
			return 'bg-green-100 text-green-800';
		case 'error':
			return 'bg-red-100 text-red-800';
		case 'warning':
			return 'bg-yellow-100 text-yellow-800';
		case 'info':
			return 'bg-blue-100 text-blue-800';
	}
};

// Custom hook to use notification context
export const useNotification = () => {
	const context = useContext(NotificationContext);

	if (context === undefined) {
		throw new Error(
			'useNotification must be used within a NotificationProvider'
		);
	}

	return context;
};
