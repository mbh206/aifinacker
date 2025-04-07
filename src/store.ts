// src/store.ts
import { configureStore } from '@reduxjs/toolkit';
import authReducer from './store/slices/authSlice';
import accountsReducer from './store/slices/accountsSlice';
import expensesReducer from './store/slices/expensesSlice';
import budgetsReducer from './store/slices/budgetsSlice';
import uiReducer from './store/slices/uiSlice';

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
	devTools: import.meta.env.DEV,
});

// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
