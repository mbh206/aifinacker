// src/store.ts
import { configureStore } from '@reduxjs/toolkit';
import authReducer from './features/auth/authSlice';
import accountsReducer from './features/accounts/accountsSlice';
import expensesReducer from './features/expenses/expensesSlice';
import budgetsReducer from './features/budgets/budgetsSlice';
import uiReducer from './features/ui/uiSlice';

export const store = configureStore({
	reducer: {
		auth: authReducer,
		accounts: accountsReducer,
		expenses: expensesReducer,
		budgets: budgetsReducer,
		ui: uiReducer,
	},
	middleware: (getDefaultMiddleware) =>
		getDefaultMiddleware({
			serializableCheck: {
				// Ignore these action types
				ignoredActions: ['auth/setUser', 'accounts/setCurrentAccount'],
				// Ignore these field paths in all actions
				ignoredActionPaths: [
					'payload.createdAt',
					'payload.updatedAt',
					'payload.date',
				],
				// Ignore these paths in the state
				ignoredPaths: [
					'auth.user.createdAt',
					'auth.user.updatedAt',
					'accounts.accounts.*.createdAt',
					'accounts.accounts.*.updatedAt',
					'expenses.expenses.*.date',
					'expenses.expenses.*.createdAt',
					'expenses.expenses.*.updatedAt',
					'budgets.budgets.*.startDate',
					'budgets.budgets.*.endDate',
				],
			},
		}),
	devTools: process.env.NODE_ENV !== 'production',
});

// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
