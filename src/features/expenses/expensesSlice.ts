// src/features/expenses/expensesSlice.ts
import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import {
	createExpense,
	getExpense,
	updateExpense,
	deleteExpense,
	getAccountExpenses,
	searchExpenses,
} from '../../services/api';
import { Expense } from '../../models/types';

interface ExpensesState {
	expenses: Expense[];
	selectedExpense: Expense | null;
	isLoading: boolean;
	error: string | null;
	totalCount: number;
	currentPage: number;
	itemsPerPage: number;
	filters: {
		startDate: Date | null;
		endDate: Date | null;
		category: string | null;
		minAmount: number | null;
		maxAmount: number | null;
		searchTerm: string | null;
	};
	sortBy: string;
	sortDirection: 'asc' | 'desc';
}

const initialState: ExpensesState = {
	expenses: [],
	selectedExpense: null,
	isLoading: false,
	error: null,
	totalCount: 0,
	currentPage: 1,
	itemsPerPage: 20,
	filters: {
		startDate: null,
		endDate: null,
		category: null,
		minAmount: null,
		maxAmount: null,
		searchTerm: null,
	},
	sortBy: 'date',
	sortDirection: 'desc',
};

// Async thunks
export const fetchAccountExpenses = createAsyncThunk(
	'expenses/fetchAccountExpenses',
	async (
		{
			accountId,
			params,
		}: {
			accountId: string;
			params?: {
				startDate?: Date;
				endDate?: Date;
				category?: string;
				minAmount?: number;
				maxAmount?: number;
				sortBy?: string;
				sortDirection?: 'asc' | 'desc';
				page?: number;
				limit?: number;
			};
		},
		{ rejectWithValue }
	) => {
		try {
			const result = await getAccountExpenses(accountId, params);
			return result;
		} catch (error: any) {
			return rejectWithValue(error.message);
		}
	}
);

export const fetchExpense = createAsyncThunk(
	'expenses/fetchExpense',
	async (expenseId: string, { rejectWithValue }) => {
		try {
			const expense = await getExpense(expenseId);
			return expense;
		} catch (error: any) {
			return rejectWithValue(error.message);
		}
	}
);

export const addExpense = createAsyncThunk(
	'expenses/addExpense',
	async (expenseData: Partial<Expense>, { rejectWithValue }) => {
		try {
			const expense = await createExpense(expenseData);
			return expense;
		} catch (error: any) {
			return rejectWithValue(error.message);
		}
	}
);

export const editExpense = createAsyncThunk(
	'expenses/editExpense',
	async (
		{ expenseId, updates }: { expenseId: string; updates: Partial<Expense> },
		{ rejectWithValue }
	) => {
		try {
			const expense = await updateExpense(expenseId, updates);
			return expense;
		} catch (error: any) {
			return rejectWithValue(error.message);
		}
	}
);

export const removeExpense = createAsyncThunk(
	'expenses/removeExpense',
	async (expenseId: string, { rejectWithValue }) => {
		try {
			await deleteExpense(expenseId);
			return expenseId;
		} catch (error: any) {
			return rejectWithValue(error.message);
		}
	}
);

export const searchAccountExpenses = createAsyncThunk(
	'expenses/searchAccountExpenses',
	async (
		{ accountId, query }: { accountId: string; query: string },
		{ rejectWithValue }
	) => {
		try {
			const expenses = await searchExpenses(accountId, query);
			return expenses;
		} catch (error: any) {
			return rejectWithValue(error.message);
		}
	}
);

// Expenses slice
const expensesSlice = createSlice({
	name: 'expenses',
	initialState,
	reducers: {
		setSelectedExpense: (state, action: PayloadAction<Expense | null>) => {
			state.selectedExpense = action.payload;
		},
		clearSelectedExpense: (state) => {
			state.selectedExpense = null;
		},
		setFilters: (
			state,
			action: PayloadAction<Partial<ExpensesState['filters']>>
		) => {
			state.filters = { ...state.filters, ...action.payload };
		},
		clearFilters: (state) => {
			state.filters = initialState.filters;
		},
		setSort: (
			state,
			action: PayloadAction<{ sortBy: string; sortDirection: 'asc' | 'desc' }>
		) => {
			state.sortBy = action.payload.sortBy;
			state.sortDirection = action.payload.sortDirection;
		},
		setPage: (state, action: PayloadAction<number>) => {
			state.currentPage = action.payload;
		},
		setItemsPerPage: (state, action: PayloadAction<number>) => {
			state.itemsPerPage = action.payload;
		},
		clearError: (state) => {
			state.error = null;
		},
		clearExpenses: (state) => {
			state.expenses = [];
			state.totalCount = 0;
			state.currentPage = 1;
		},
	},
	extraReducers: (builder) => {
		builder
			// Fetch account expenses
			.addCase(fetchAccountExpenses.pending, (state) => {
				state.isLoading = true;
				state.error = null;
			})
			.addCase(fetchAccountExpenses.fulfilled, (state, action) => {
				state.isLoading = false;
				state.expenses = action.payload.expenses;
				state.totalCount = action.payload.total;
				state.currentPage = action.payload.page;
				state.itemsPerPage = action.payload.limit;
			})
			.addCase(fetchAccountExpenses.rejected, (state, action) => {
				state.isLoading = false;
				state.error = action.payload as string;
			})

			// Fetch single expense
			.addCase(fetchExpense.pending, (state) => {
				state.isLoading = true;
				state.error = null;
			})
			.addCase(fetchExpense.fulfilled, (state, action) => {
				state.isLoading = false;
				state.selectedExpense = action.payload;

				// Update this expense in the expenses array if it exists
				const index = state.expenses.findIndex(
					(expense) => expense.id === action.payload.id
				);
				if (index !== -1) {
					state.expenses[index] = action.payload;
				}
			})
			.addCase(fetchExpense.rejected, (state, action) => {
				state.isLoading = false;
				state.error = action.payload as string;
			})

			// Add expense
			.addCase(addExpense.pending, (state) => {
				state.isLoading = true;
				state.error = null;
			})
			.addCase(addExpense.fulfilled, (state, action) => {
				state.isLoading = false;

				// Only add to the array if it matches current filters
				// In a real app, we'd have more complex logic here or just refetch
				state.expenses.unshift(action.payload);
				state.totalCount += 1;
			})
			.addCase(addExpense.rejected, (state, action) => {
				state.isLoading = false;
				state.error = action.payload as string;
			})

			// Edit expense
			.addCase(editExpense.pending, (state) => {
				state.isLoading = true;
				state.error = null;
			})
			.addCase(editExpense.fulfilled, (state, action) => {
				state.isLoading = false;

				// Update the expense in the expenses array
				const index = state.expenses.findIndex(
					(expense) => expense.id === action.payload.id
				);
				if (index !== -1) {
					state.expenses[index] = action.payload;
				}

				// Update selected expense if it's the same one
				if (
					state.selectedExpense &&
					state.selectedExpense.id === action.payload.id
				) {
					state.selectedExpense = action.payload;
				}
			})
			.addCase(editExpense.rejected, (state, action) => {
				state.isLoading = false;
				state.error = action.payload as string;
			})

			// Remove expense
			.addCase(removeExpense.pending, (state) => {
				state.isLoading = true;
				state.error = null;
			})
			.addCase(removeExpense.fulfilled, (state, action) => {
				state.isLoading = false;

				// Remove the expense from the expenses array
				state.expenses = state.expenses.filter(
					(expense) => expense.id !== action.payload
				);
				state.totalCount -= 1;

				// Clear selected expense if it's the same one
				if (
					state.selectedExpense &&
					state.selectedExpense.id === action.payload
				) {
					state.selectedExpense = null;
				}
			})
			.addCase(removeExpense.rejected, (state, action) => {
				state.isLoading = false;
				state.error = action.payload as string;
			})

			// Search expenses
			.addCase(searchAccountExpenses.pending, (state) => {
				state.isLoading = true;
				state.error = null;
			})
			.addCase(searchAccountExpenses.fulfilled, (state, action) => {
				state.isLoading = false;
				state.expenses = action.payload;
				state.totalCount = action.payload.length;
				state.currentPage = 1;
				state.filters.searchTerm = state.filters.searchTerm; // Keep the current search term
			})
			.addCase(searchAccountExpenses.rejected, (state, action) => {
				state.isLoading = false;
				state.error = action.payload as string;
			});
	},
});

export const {
	setSelectedExpense,
	clearSelectedExpense,
	setFilters,
	clearFilters,
	setSort,
	setPage,
	setItemsPerPage,
	clearError,
	clearExpenses,
} = expensesSlice.actions;

export default expensesSlice.reducer;
