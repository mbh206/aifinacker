import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { Formik, Form, Field } from 'formik';
import * as Yup from 'yup';
import { confirmPasswordReset } from '../../services/auth';
import { addNotification } from '../../features/ui/uiSlice';

const validationSchema = Yup.object({
	password: Yup.string()
		.min(8, 'Password must be at least 8 characters')
		.required('Password is required'),
	confirmPassword: Yup.string()
		.oneOf([Yup.ref('password')], 'Passwords must match')
		.required('Please confirm your password'),
});

const ResetPassword: React.FC = () => {
	const dispatch = useDispatch();
	const navigate = useNavigate();
	const [searchParams] = useSearchParams();
	const [isSubmitting, setIsSubmitting] = useState(false);

	const oobCode = searchParams.get('oobCode');

	const handleSubmit = async (values: { password: string }) => {
		if (!oobCode) {
			dispatch(
				addNotification({
					type: 'error',
					message: 'Invalid or expired reset link',
				})
			);
			return;
		}

		try {
			setIsSubmitting(true);
			await confirmPasswordReset(oobCode, values.password);
			dispatch(
				addNotification({
					type: 'success',
					message: 'Password has been reset successfully',
				})
			);
			navigate('/auth/login');
		} catch (error: any) {
			dispatch(
				addNotification({
					type: 'error',
					message: error.message || 'Failed to reset password',
				})
			);
		} finally {
			setIsSubmitting(false);
		}
	};

	if (!oobCode) {
		return (
			<div className='text-center'>
				<p className='text-red-600 dark:text-red-400'>
					Invalid or expired reset link
				</p>
				<Link
					to='/auth/forgot-password'
					className='mt-4 inline-block text-primary-600 hover:text-primary-500 dark:text-primary-400'>
					Request a new reset link
				</Link>
			</div>
		);
	}

	return (
		<div className='mt-8'>
			<Formik
				initialValues={{ password: '', confirmPassword: '' }}
				validationSchema={validationSchema}
				onSubmit={handleSubmit}>
				{({ errors, touched }) => (
					<Form className='space-y-6'>
						<div>
							<label
								htmlFor='password'
								className='block text-sm font-medium text-gray-700 dark:text-gray-300'>
								New Password
							</label>
							<div className='mt-1'>
								<Field
									id='password'
									name='password'
									type='password'
									autoComplete='new-password'
									className={`appearance-none block w-full px-3 py-2 border ${
										errors.password && touched.password
											? 'border-red-300'
											: 'border-gray-300'
									} rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm dark:bg-gray-800 dark:border-gray-600 dark:text-white`}
								/>
								{errors.password && touched.password && (
									<div className='mt-1 text-sm text-red-600 dark:text-red-400'>
										{errors.password}
									</div>
								)}
							</div>
						</div>

						<div>
							<label
								htmlFor='confirmPassword'
								className='block text-sm font-medium text-gray-700 dark:text-gray-300'>
								Confirm New Password
							</label>
							<div className='mt-1'>
								<Field
									id='confirmPassword'
									name='confirmPassword'
									type='password'
									autoComplete='new-password'
									className={`appearance-none block w-full px-3 py-2 border ${
										errors.confirmPassword && touched.confirmPassword
											? 'border-red-300'
											: 'border-gray-300'
									} rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm dark:bg-gray-800 dark:border-gray-600 dark:text-white`}
								/>
								{errors.confirmPassword && touched.confirmPassword && (
									<div className='mt-1 text-sm text-red-600 dark:text-red-400'>
										{errors.confirmPassword}
									</div>
								)}
							</div>
						</div>

						<div>
							<button
								type='submit'
								disabled={isSubmitting}
								className='w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed'>
								{isSubmitting ? 'Resetting...' : 'Reset Password'}
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

export default ResetPassword;
