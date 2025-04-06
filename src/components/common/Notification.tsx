// src/components/common/Notifications.tsx
import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { TransitionGroup, CSSTransition } from 'react-transition-group';
import { RootState, AppDispatch } from '../../store';
import { dismissNotification } from '../../features/ui/uiSlice';

const Notification: React.FC<{
	id: string;
	type: 'success' | 'error' | 'info' | 'warning';
	message: string;
	onDismiss: (id: string) => void;
}> = ({ id, type, message, onDismiss }) => {
	// Auto-dismiss notifications after 5 seconds
	React.useEffect(() => {
		const timer = setTimeout(() => {
			onDismiss(id);
		}, 5000);

		return () => clearTimeout(timer);
	}, [id, onDismiss]);

	// Determine color scheme based on notification type
	const colorClasses = {
		success:
			'bg-green-50 text-green-800 dark:bg-green-900 dark:text-green-100 border-green-400 dark:border-green-800',
		error:
			'bg-red-50 text-red-800 dark:bg-red-900 dark:text-red-100 border-red-400 dark:border-red-800',
		info: 'bg-blue-50 text-blue-800 dark:bg-blue-900 dark:text-blue-100 border-blue-400 dark:border-blue-800',
		warning:
			'bg-yellow-50 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100 border-yellow-400 dark:border-yellow-800',
	};

	// Icons for each notification type
	const icons = {
		success: (
			<svg
				className='h-5 w-5'
				xmlns='http://www.w3.org/2000/svg'
				viewBox='0 0 20 20'
				fill='currentColor'>
				<path
					fillRule='evenodd'
					d='M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z'
					clipRule='evenodd'
				/>
			</svg>
		),
		error: (
			<svg
				className='h-5 w-5'
				xmlns='http://www.w3.org/2000/svg'
				viewBox='0 0 20 20'
				fill='currentColor'>
				<path
					fillRule='evenodd'
					d='M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z'
					clipRule='evenodd'
				/>
			</svg>
		),
		info: (
			<svg
				className='h-5 w-5'
				xmlns='http://www.w3.org/2000/svg'
				viewBox='0 0 20 20'
				fill='currentColor'>
				<path
					fillRule='evenodd'
					d='M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z'
					clipRule='evenodd'
				/>
			</svg>
		),
		warning: (
			<svg
				className='h-5 w-5'
				xmlns='http://www.w3.org/2000/svg'
				viewBox='0 0 20 20'
				fill='currentColor'>
				<path
					fillRule='evenodd'
					d='M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z'
					clipRule='evenodd'
				/>
			</svg>
		),
	};

	return (
		<div
			className={`rounded-md border p-4 mb-3 shadow-lg ${colorClasses[type]}`}>
			<div className='flex'>
				<div className='flex-shrink-0'>{icons[type]}</div>
				<div className='ml-3'>
					<p className='text-sm font-medium'>{message}</p>
				</div>
				<div className='ml-auto pl-3'>
					<div className='-mx-1.5 -my-1.5'>
						<button
							onClick={() => onDismiss(id)}
							className={`inline-flex rounded-md p-1.5 focus:outline-none focus:ring-2 focus:ring-offset-2 ${
								type === 'success'
									? 'text-green-500 hover:bg-green-100 focus:ring-green-600 dark:text-green-300 dark:hover:bg-green-800'
									: type === 'error'
									? 'text-red-500 hover:bg-red-100 focus:ring-red-600 dark:text-red-300 dark:hover:bg-red-800'
									: type === 'info'
									? 'text-blue-500 hover:bg-blue-100 focus:ring-blue-600 dark:text-blue-300 dark:hover:bg-blue-800'
									: 'text-yellow-500 hover:bg-yellow-100 focus:ring-yellow-600 dark:text-yellow-300 dark:hover:bg-yellow-800'
							}`}>
							<span className='sr-only'>Dismiss</span>
							<svg
								className='h-5 w-5'
								xmlns='http://www.w3.org/2000/svg'
								viewBox='0 0 20 20'
								fill='currentColor'>
								<path
									fillRule='evenodd'
									d='M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z'
									clipRule='evenodd'
								/>
							</svg>
						</button>
					</div>
				</div>
			</div>
		</div>
	);
};

const Notifications: React.FC = () => {
	const dispatch = useDispatch<AppDispatch>();
	const { notifications } = useSelector((state: RootState) => state.ui);

	// Filter out dismissed notifications
	const activeNotifications = notifications.filter(
		(notification) => !notification.dismissed
	);

	// Handle dismissing a notification
	const handleDismiss = (id: string) => {
		dispatch(dismissNotification(id));
	};

	if (activeNotifications.length === 0) {
		return null;
	}

	return (
		<div className='fixed bottom-0 right-0 p-4 space-y-3 z-50 pointer-events-none'>
			<TransitionGroup>
				{activeNotifications.map((notification) => (
					<CSSTransition
						key={notification.id}
						timeout={500}
						classNames={{
							enter: 'transform ease-out duration-300 transition',
							enterActive: 'translate-y-0 opacity-100 sm:translate-x-0',
							enterDone: 'translate-y-0 opacity-100 sm:translate-x-0',
							exit: 'transition ease-in duration-100',
							exitActive: 'opacity-0',
						}}>
						<div className='w-full max-w-sm pointer-events-auto'>
							<Notification
								id={notification.id}
								type={notification.type}
								message={notification.message}
								onDismiss={handleDismiss}
							/>
						</div>
					</CSSTransition>
				))}
			</TransitionGroup>
		</div>
	);
};

export default Notifications;
