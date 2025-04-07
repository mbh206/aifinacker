// src/hooks/useAuth.ts
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../store';
import {
	checkAuth,
	registerUser,
	loginUser,
	loginWithGoogle,
	logoutUser,
	sendPasswordReset,
	clearError,
	selectUser,
	selectIsAuthenticated,
	selectIsLoading,
	selectError,
} from '../store/slices/authSlice';

/**
 * Custom hook for authentication functionality
 * Provides authentication methods and state
 */
export const useAuth = () => {
	const dispatch = useAppDispatch();
	const navigate = useNavigate();

	// Select auth state from Redux store
	const user = useAppSelector(selectUser);
	const isAuthenticated = useAppSelector(selectIsAuthenticated);
	const isLoading = useAppSelector(selectIsLoading);
	const error = useAppSelector(selectError);

	// Check authentication status on mount
	useEffect(() => {
		dispatch(checkAuth());
	}, [dispatch]);

	// Register a new user
	const register = async (
		email: string,
		password: string,
		displayName: string
	) => {
		try {
			const resultAction = await dispatch(
				registerUser({ email, password, displayName })
			);

			if (registerUser.fulfilled.match(resultAction)) {
				navigate('/accounts/new');
				return true;
			}
			return false;
		} catch (error) {
			return false;
		}
	};

	// Login with email and password
	const login = async (email: string, password: string, redirectTo = '/') => {
		try {
			const resultAction = await dispatch(loginUser({ email, password }));

			if (loginUser.fulfilled.match(resultAction)) {
				navigate(redirectTo);
				return true;
			}
			return false;
		} catch (error) {
			return false;
		}
	};

	// Login with Google
	const googleLogin = async (redirectTo = '/') => {
		try {
			const resultAction = await dispatch(loginWithGoogle());

			if (loginWithGoogle.fulfilled.match(resultAction)) {
				navigate(redirectTo);
				return true;
			}
			return false;
		} catch (error) {
			return false;
		}
	};

	// Logout the current user
	const logout = async () => {
		try {
			await dispatch(logoutUser());
			navigate('/auth/login');
			return true;
		} catch (error) {
			return false;
		}
	};

	// Reset password
	const resetPassword = async (email: string) => {
		try {
			const resultAction = await dispatch(sendPasswordReset(email));
			return sendPasswordReset.fulfilled.match(resultAction);
		} catch (error) {
			return false;
		}
	};

	// Clear authentication errors
	const clearAuthError = () => {
		dispatch(clearError());
	};

	return {
		user,
		isAuthenticated,
		isLoading,
		error,
		register,
		login,
		googleLogin,
		logout,
		resetPassword,
		clearAuthError,
	};
};

export default useAuth;
