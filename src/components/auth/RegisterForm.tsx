import React, { useState } from 'react';
import { useRouter } from 'next/router';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { registerUser } from '../../store/slices/authSlice';
import { useAppDispatch, useAppSelector } from '../../store';

interface RegisterFormProps {
	onToggleForm: () => void;
}

const RegisterForm: React.FC<RegisterFormProps> = ({ onToggleForm }) => {
	const router = useRouter();
	const dispatch = useAppDispatch();
	const { status, error } = useAppSelector((state) => state.auth);
	const [showPassword, setShowPassword] = useState(false);

	const formik = useFormik({
		initialValues: {
			email: '',
			password: '',
			confirmPassword: '',
			displayName: '',
		},
		validationSchema: Yup.object({
			email: Yup.string()
				.email('Invalid email address')
				.required('Email is required'),
			password: Yup.string()
				.min(8, 'Password must be at least 8 characters')
				.required('Password is required'),
			confirmPassword: Yup.string()
				.oneOf([Yup.ref('password')], 'Passwords must match')
				.required('Please confirm your password'),
			displayName: Yup.string()
				.required('Name is required')
				.min(2, 'Name must be at least 2 characters'),
		}),
		onSubmit: async (values) => {
			const resultAction = await dispatch(
				registerUser({
					email: values.email,
					password: values.password,
					displayName: values.displayName,
				})
			);

			if (registerUser.fulfilled.match(resultAction)) {
				router.push('/accounts/new');
			}
		},
	});

	return (
		<div className='w-full max-w-md p-8 space-y-8 bg-white dark:bg-gray-800 rounded-lg shadow-md'>
			<div className='text-center'>
				<h1 className='text-2xl font-bold text-gray-900 dark:text-white'>
					Create an account
				</h1>
				<p className='mt-2 text-sm text-gray-600 dark:text-gray-400'>
					Start managing your finances effectively
				</p>
			</div>

			{error && (
				<div
					className='p-4 mb-4 text-sm text-red-700 bg-red-100 rounded-lg dark:bg-red-200 dark:text-red-800'
					role='alert'>
					{error}
				</div>
			)}

			<form
				className='mt-8 space-y-6'
				onSubmit={formik.handleSubmit}>
				<div>
					<label
						htmlFor='displayName'
						className='block text-sm font-medium text-gray-700 dark:text-gray-300'>
						Full Name
					</label>
					<div className='mt-1'>
						<input
							id='displayName'
							name='displayName'
							type='text'
							autoComplete='name'
							required
							className='appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white'
							placeholder='Your name'
							value={formik.values.displayName}
							onChange={formik.handleChange}
							onBlur={formik.handleBlur}
						/>
						{formik.touched.displayName && formik.errors.displayName ? (
							<div className='mt-1 text-sm text-red-600 dark:text-red-400'>
								{formik.errors.displayName}
							</div>
						) : null}
					</div>
				</div>

				<div>
					<label
						htmlFor='email'
						className='block text-sm font-medium text-gray-700 dark:text-gray-300'>
						Email address
					</label>
					<div className='mt-1'>
						<input
							id='email'
							name='email'
							type='email'
							autoComplete='email'
							required
							className='appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white'
							placeholder='Email address'
							value={formik.values.email}
							onChange={formik.handleChange}
							onBlur={formik.handleBlur}
						/>
						{formik.touched.email && formik.errors.email ? (
							<div className='mt-1 text-sm text-red-600 dark:text-red-400'>
								{formik.errors.email}
							</div>
						) : null}
					</div>
				</div>

				<div>
					<label
						htmlFor='password'
						className='block text-sm font-medium text-gray-700 dark:text-gray-300'>
						Password
					</label>
					<div className='mt-1 relative'>
						<input
							id='password'
							name='password'
							type={showPassword ? 'text' : 'password'}
							autoComplete='new-password'
							required
							className='appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white'
							placeholder='Password'
							value={formik.values.password}
							onChange={formik.handleChange}
							onBlur={formik.handleBlur}
						/>
						<button
							type='button'
							className='absolute inset-y-0 right-0 pr-3 flex items-center'
							onClick={() => setShowPassword(!showPassword)}>
							{showPassword ? (
								<svg
									xmlns='http://www.w3.org/2000/svg'
									className='h-5 w-5 text-gray-400'
									fill='none'
									viewBox='0 0 24 24'
									stroke='currentColor'>
									<path
										strokeLinecap='round'
										strokeLinejoin='round'
										strokeWidth={2}
										d='M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21'
									/>
								</svg>
							) : (
								<svg
									xmlns='http://www.w3.org/2000/svg'
									className='h-5 w-5 text-gray-400'
									fill='none'
									viewBox='0 0 24 24'
									stroke='currentColor'>
									<path
										strokeLinecap='round'
										strokeLinejoin='round'
										strokeWidth={2}
										d='M15 12a3 3 0 11-6 0 3 3 0 016 0z'
									/>
									<path
										strokeLinecap='round'
										strokeLinejoin='round'
										strokeWidth={2}
										d='M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z'
									/>
								</svg>
							)}
						</button>
						{formik.touched.password && formik.errors.password ? (
							<div className='mt-1 text-sm text-red-600 dark:text-red-400'>
								{formik.errors.password}
							</div>
						) : null}
					</div>
				</div>

				<div>
					<label
						htmlFor='confirmPassword'
						className='block text-sm font-medium text-gray-700 dark:text-gray-300'>
						Confirm Password
					</label>
					<div className='mt-1 relative'>
						<input
							id='confirmPassword'
							name='confirmPassword'
							type={showPassword ? 'text' : 'password'}
							autoComplete='new-password'
							required
							className='appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white'
							placeholder='Confirm password'
							value={formik.values.confirmPassword}
							onChange={formik.handleChange}
							onBlur={formik.handleBlur}
						/>
						{formik.touched.confirmPassword && formik.errors.confirmPassword ? (
							<div className='mt-1 text-sm text-red-600 dark:text-red-400'>
								{formik.errors.confirmPassword}
							</div>
						) : null}
					</div>
				</div>

				<div>
					<button
						type='submit'
						disabled={status === 'loading'}
						className='w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed dark:bg-primary-700 dark:hover:bg-primary-600'>
						{status === 'loading' ? (
							<svg
								className='animate-spin -ml-1 mr-3 h-5 w-5 text-white'
								xmlns='http://www.w3.org/2000/svg'
								fill='none'
								viewBox='0 0 24 24'>
								<circle
									className='opacity-25'
									cx='12'
									cy='12'
									r='10'
									stroke='currentColor'
									strokeWidth='4'></circle>
								<path
									className='opacity-75'
									fill='currentColor'
									d='M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z'></path>
							</svg>
						) : null}
						Sign up
					</button>
				</div>
			</form>

			<div className='text-center mt-6'>
				<p className='text-sm text-gray-600 dark:text-gray-400'>
					Already have an account?{' '}
					<button
						type='button'
						onClick={onToggleForm}
						className='font-medium text-primary-600 hover:text-primary-500 dark:text-primary-400'>
						Sign in
					</button>
				</p>
			</div>
		</div>
	);
};

export default RegisterForm;
