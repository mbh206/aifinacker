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
	fetchAccounts,
	selectCurrentAccount,
} from './store/slices/accountsSlice';
import { selectNotifications, hideNotification } from './store/slices/uiSlice';

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
import ExpenseDetail from './pages/ExpenseDetail';
import ExpenseForm from './pages/ExpenseForm';
import BudgetList from './pages/BudgetList';
import BudgetDetail from './pages/BudgetDetail';
import BudgetForm from './pages/BudgetForm';
import Insights from './pages/Insights';
import Settings from './pages/Settings';
import Profile from './pages/Profile';
import AccountList from './pages/AccountList';
import AccountDetail from './pages/AccountDetail';
import AccountForm from './pages/AccountForm';
import NotFound from './pages/NotFound';

// Components
import LoadingScreen from './components/common/LoadingScreen';
import Notification from './components/common/Notification';

const App = () => {
	const dispatch = useDispatch();
	const isAuthenticated = useSelector(selectIsAuthenticated);
	const currentUser = useSelector(selectUser);
	const currentAccount = useSelector(selectCurrentAccount);
	const notifications = useSelector(selectNotifications);

	// Check authentication status on app load
	useEffect(() => {
		dispatch(checkAuth());
	}, [dispatch]);

	// Fetch accounts once authenticated
	useEffect(() => {
		if (isAuthenticated && currentUser) {
			dispatch(fetchAccounts());
		}
	}, [dispatch, isAuthenticated, currentUser]);

	// If auth is still being checked, show loading screen
	if (isAuthenticated === null) {
		return <LoadingScreen />;
	}

	return (
		<ThemeProvider>
			<Router>
				{/* Notifications */}
				<div className='fixed top-0 right-0 z-50 p-4 space-y-2'>
					{notifications.map((notification) => (
						<Notification
							key={notification.id}
							type={notification.type}
							message={notification.message}
							onClose={() => dispatch(hideNotification(notification.id))}
						/>
					))}
				</div>

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
										element={<ExpenseDetail />}
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
