import React, { useEffect } from 'react';
import {
	BrowserRouter as Router,
	Routes,
	Route,
	Navigate,
} from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { ThemeProvider } from './contexts/ThemeContext';
import {
	selectIsAuthenticated,
	selectUser,
	checkAuth,
} from './store/slices/authSlice';
import {
	fetchUserAccounts,
	selectCurrentAccount,
} from './store/slices/accountsSlice';
import { selectNotifications } from './store/slices/uiSlice';

// Layouts
import AppLayout from './components/layout/AppLayout';
import AuthLayout from './components/layout/AuthLayout';

// Authentication Pages
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import ForgotPassword from './pages/auth/ForgotPassword';
import ResetPassword from './pages/auth/ResetPassword';

// Main App Pages
import Dashboard from './pages/Dashboard';
import ExpenseList from './pages/ExpenseList';
import { ExpenseDetails } from './pages/ExpenseDetail';
import ExpenseForm from './pages/ExpenseForm';
import BudgetList from './pages/BudgetList';
import BudgetDetail from './pages/BudgetDetail';
import BudgetForm from './pages/BudgetForm';
import Insights from './pages/Insights';
import { Settings } from './pages/Settings';
import { Profile } from './pages/Profile';
import { AccountList } from './pages/AccountList';
import { AccountDetail } from './pages/AccountDetail';
import AccountForm from './pages/AccountForm';
import NotFound from './pages/NotFound';

// Components
import LoadingScreen from './components/common/LoadingScreen';
import Notifications from './components/common/Notification';

const App = () => {
	const dispatch = useDispatch();
	const isAuthenticated = useSelector(selectIsAuthenticated);
	const currentUser = useSelector(selectUser);
	const currentAccount = useSelector(selectCurrentAccount);
	const notifications = useSelector(selectNotifications);

	// Log initial state
	console.log('Initial state:', {
		isAuthenticated,
		currentUser,
		currentAccount,
		notifications,
	});

	// Check authentication status on app load
	useEffect(() => {
		console.log('Checking authentication status...');
		dispatch(checkAuth() as any);
	}, [dispatch]);

	// Fetch accounts once authenticated
	useEffect(() => {
		console.log('Auth state:', { isAuthenticated, currentUser });
		if (isAuthenticated && currentUser) {
			console.log('Fetching accounts for user:', currentUser.firebaseUser.uid);
			dispatch(fetchUserAccounts(currentUser.firebaseUser.uid) as any);
		}
	}, [dispatch, isAuthenticated, currentUser]);

	// Log when loading screen is shown
	if (isAuthenticated === null) {
		console.log('Auth check in progress, showing loading screen...');
		return <LoadingScreen />;
	}

	console.log('Rendering app with state:', {
		isAuthenticated,
		currentUser,
		currentAccount,
		notifications,
	});

	return (
		<ThemeProvider>
			<Router>
				{/* Notifications */}
				<Notifications />

				<Routes>
					{/* Authentication Routes */}
					{!isAuthenticated ? (
						<>
							<Route
								path='/auth'
								element={<AuthLayout />}>
								<Route
									path='login'
									element={<Login />}
								/>
								<Route
									path='register'
									element={<Register />}
								/>
								<Route
									path='forgot-password'
									element={<ForgotPassword />}
								/>
								<Route
									path='reset-password'
									element={<ResetPassword />}
								/>
							</Route>
							<Route
								path='*'
								element={
									<Navigate
										to='/auth/login'
										replace
									/>
								}
							/>
						</>
					) : (
						<>
							{/* Protected Routes - Require Authentication */}
							<Route
								path='/'
								element={<AppLayout />}>
								{/* Dashboard */}
								<Route
									index
									element={<Dashboard />}
								/>

								{/* Account Management */}
								<Route path='accounts'>
									<Route
										index
										element={<AccountList />}
									/>
									<Route
										path='new'
										element={<AccountForm />}
									/>
									<Route
										path=':id'
										element={<AccountDetail />}
									/>
									<Route
										path=':id/edit'
										element={<AccountForm />}
									/>
								</Route>

								{/* Expenses */}
								<Route path='expenses'>
									<Route
										index
										element={<ExpenseList />}
									/>
									<Route
										path='new'
										element={<ExpenseForm />}
									/>
									<Route
										path=':id'
										element={<ExpenseDetails />}
									/>
									<Route
										path=':id/edit'
										element={<ExpenseForm />}
									/>
								</Route>

								{/* Budgets */}
								<Route path='budgets'>
									<Route
										index
										element={<BudgetList />}
									/>
									<Route
										path='new'
										element={<BudgetForm />}
									/>
									<Route
										path=':id'
										element={<BudgetDetail />}
									/>
									<Route
										path=':id/edit'
										element={<BudgetForm />}
									/>
								</Route>

								{/* Insights */}
								<Route
									path='insights'
									element={<Insights />}
								/>

								{/* User Settings */}
								<Route
									path='settings'
									element={<Settings />}
								/>
								<Route
									path='profile'
									element={<Profile />}
								/>

								{/* Catch All (404) */}
								<Route
									path='*'
									element={<NotFound />}
								/>
							</Route>
						</>
					)}
				</Routes>
			</Router>
		</ThemeProvider>
	);
};

export default App;
