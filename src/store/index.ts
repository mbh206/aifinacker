import { configureStore } from '@reduxjs/toolkit';
import { useDispatch, useSelector, TypedUseSelectorHook } from 'react-redux';

// Import your reducers here
import authReducer from './slices/authSlice';
import accountReducer from './slices/accountSlice';
import expenseReducer from './slices/expenseSlice';
import budgetReducer from './slices/budgetSlice';
import uiReducer from './slices/uiSlice';

export const store = configureStore({
	reducer: {
		auth: authReducer,
		accounts: accountReducer,
		expenses: expenseReducer,
		budgets: budgetReducer,
		ui: uiReducer,
	},
	middleware: (getDefaultMiddleware) =>
		getDefaultMiddleware({
			serializableCheck: {
				// Ignore these action types
				ignoredActions: ['auth/setUser'],
				// Ignore these field paths in all actions
				ignoredActionPaths: ['payload.timestamp', 'meta.arg.timestamp'],
				// Ignore these paths in the state
				ignoredPaths: ['auth.user', 'accounts.currentAccount'],
			},
		}),
});

// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

// Use throughout your app instead of plain `useDispatch` and `useSelector`
export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
