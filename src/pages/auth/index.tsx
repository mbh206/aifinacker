import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Image from 'next/image';
import Head from 'next/head';
import LoginForm from '../../components/auth/LoginForm';
import RegisterForm from '../../components/auth/RegisterForm';
import { useAppSelector } from '../../store';

const AuthPage: React.FC = () => {
	const [isLogin, setIsLogin] = useState(true);
	const { user } = useAppSelector((state) => state.auth);
	const router = useRouter();

	// Redirect to dashboard if already logged in
	useEffect(() => {
		if (user) {
			router.push('/dashboard');
		}
	}, [user, router]);

	const toggleForm = () => {
		setIsLogin(!isLogin);
	};

	return (
		<>
			<Head>
				<title>{isLogin ? 'Sign In' : 'Sign Up'} | Financial Tracker</title>
				<meta
					name='description'
					content='Sign in to your Financial Tracker account'
				/>
			</Head>

			<div className='min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8'>
				<div className='max-w-md w-full space-y-8'>
					<div className='text-center'>
						<div className='flex justify-center'>
							<div className='relative w-20 h-20'>
								<Image
									src='/images/logo.svg'
									alt='Financial Tracker Logo'
									layout='fill'
									priority
								/>
							</div>
						</div>
						<h2 className='mt-6 text-3xl font-extrabold text-gray-900 dark:text-white'>
							Financial Tracker
						</h2>
					</div>

					{isLogin ? (
						<LoginForm onToggleForm={toggleForm} />
					) : (
						<RegisterForm onToggleForm={toggleForm} />
					)}
				</div>
			</div>
		</>
	);
};

export default AuthPage;
