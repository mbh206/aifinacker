import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { Formik, Form, Field } from 'formik';
import * as Yup from 'yup';
import { resetPassword } from '../../services/auth';
import { addNotification } from '../../features/ui/uiSlice';

const validationSchema = Yup.object({
	email: Yup.string()
		.email('Invalid email address')
		.required('Email is required'),
});

const ForgotPassword: React.FC = () => {
	const dispatch = useDispatch();
	const [isSubmitting, setIsSubmitting] = useState(false);

	const handleSubmit = async (values: { email: string }) => {
		try {
			setIsSubmitting(true);
			await resetPassword(values.email);
			dispatch(
				addNotification({
					type: 'success',
					message: 'Password reset email sent. Please check your inbox.',
				})
			);
		} catch (error: any) {
			dispatch(
				addNotification({
					type: 'error',
					message: error.message || 'Failed to send reset email',
				})
			);
		} finally {
			setIsSubmitting(false);
		}
	};

	return (
		<div className='mt-8'>
			<Formik
				initialValues={{ email: '' }}
				validationSchema={validationSchema}
				onSubmit={handleSubmit}>
				{({ errors, touched }) => (
					<Form className='space-y-6'>
						<div>
							<label
								htmlFor='email'
								className='block text-sm font-medium text-gray-700 dark:text-gray-300'>
								Email address
							</label>
							<div className='mt-1'>
								<Field
									id='email'
									name='email'
									type='email'
									autoComplete='email'
									className={`appearance-none block w-full px-3 py-2 border ${
										errors.email && touched.email
											? 'border-red-300'
											: 'border-gray-300'
									} rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm dark:bg-gray-800 dark:border-gray-600 dark:text-white`}
								/>
								{errors.email && touched.email && (
									<div className='mt-1 text-sm text-red-600 dark:text-red-400'>
										{errors.email}
									</div>
								)}
							</div>
						</div>

						<div>
							<button
								type='submit'
								disabled={isSubmitting}
								className='w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed'>
								{isSubmitting ? 'Sending...' : 'Reset Password'}
							</button>
						</div>

						<div className='text-sm text-center'>
							<Link
								to='/auth/login'
								className='font-medium text-primary-600 hover:text-primary-500 dark:text-primary-400'>
								Back to Login
							</Link>
						</div>
					</Form>
				)}
			</Formik>
		</div>
	);
};

export default ForgotPassword;
