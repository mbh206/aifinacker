// src/features/budgets/budgetsSlice.ts
import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import {
	createBudget,
	getBudget,
	updateBudget,
	deleteBudget,
	getAccountBudgets,
	getBudgetStatus,
} from '../../services/api';
import { Budget, Expense } from '../../models/types';

interface BudgetStatus {
	budget: Budget;
	spent: number;
	remaining: number;
	percentUsed: number;
	expenses: Expense[];
}

interface BudgetsState {
	budgets: Budget[];
	selectedBudget: Budget | null;
	budgetStatus: BudgetStatus | null;
	isLoading: boolean;
	error: string | null;
}

const initialState: BudgetsState = {
	budgets: [],
	selectedBudget: null,
	budgetStatus: null,
	isLoading: false,
	error: null,
};

// Async thunks
export const fetchAccountBudgets = createAsyncThunk(
	'budgets/fetchAccountBudgets',
	async (
		{
			accountId,
			params,
		}: {
			accountId: string;
			params?: {
				startDate?: Date;
				endDate?: Date;
				categories?: string[];
			};
		},
		{ rejectWithValue }
	) => {
		try {
			const budgets = await getAccountBudgets(accountId, params);
			return budgets;
		} catch (error: any) {
			return rejectWithValue(error.message);
		}
	}
);

export const fetchBudget = createAsyncThunk(
	'budgets/fetchBudget',
	async (budgetId: string, { rejectWithValue }) => {
		try {
			const budget = await getBudget(budgetId);
			return budget;
		} catch (error: any) {
			return rejectWithValue(error.message);
		}
	}
);

export const addBudget = createAsyncThunk(
	'budgets/addBudget',
	async (budgetData: Partial<Budget>, { rejectWithValue }) => {
		try {
			const budget = await createBudget(budgetData);
			return budget;
		} catch (error: any) {
			return rejectWithValue(error.message);
		}
	}
);

export const editBudget = createAsyncThunk(
	'budgets/editBudget',
	async (
		{ budgetId, updates }: { budgetId: string; updates: Partial<Budget> },
		{ rejectWithValue }
	) => {
		try {
			const budget = await updateBudget(budgetId, updates);
			return budget;
		} catch (error: any) {
			return rejectWithValue(error.message);
		}
	}
);

export const removeBudget = createAsyncThunk(
	'budgets/removeBudget',
	async (budgetId: string, { rejectWithValue }) => {
		try {
			await deleteBudget(budgetId);
			return budgetId;
		} catch (error: any) {
			return rejectWithValue(error.message);
		}
	}
);

export const fetchBudgetStatus = createAsyncThunk(
	'budgets/fetchBudgetStatus',
	async (budgetId: string, { rejectWithValue }) => {
		try {
			const status = await getBudgetStatus(budgetId);
			return status;
		} catch (error: any) {
			return rejectWithValue(error.message);
		}
	}
);

// Budgets slice
const budgetsSlice = createSlice({
	name: 'budgets',
	initialState,
	reducers: {
		setSelectedBudget: (state, action: PayloadAction<Budget | null>) => {
			state.selectedBudget = action.payload;
		},
		clearSelectedBudget: (state) => {
			state.selectedBudget = null;
			state.budgetStatus = null;
		},
		clearError: (state) => {
			state.error = null;
		},
	},
	extraReducers: (builder) => {
		builder
			// Fetch account budgets
			.addCase(fetchAccountBudgets.pending, (state) => {
				state.isLoading = true;
				state.error = null;
			})
			.addCase(fetchAccountBudgets.fulfilled, (state, action) => {
				state.isLoading = false;
				state.budgets = action.payload;
			})
			.addCase(fetchAccountBudgets.rejected, (state, action) => {
				state.isLoading = false;
				state.error = action.payload as string;
			})

			// Fetch single budget
			.addCase(fetchBudget.pending, (state) => {
				state.isLoading = true;
				state.error = null;
			})
			.addCase(fetchBudget.fulfilled, (state, action) => {
				state.isLoading = false;
				state.selectedBudget = action.payload;

				// Update this budget in the budgets array if it exists
				const index = state.budgets.findIndex(
					(budget) => budget.id === action.payload.id
				);
				if (index !== -1) {
					state.budgets[index] = action.payload;
				} else {
					state.budgets.push(action.payload);
				}
			})
			.addCase(fetchBudget.rejected, (state, action) => {
				state.isLoading = false;
				state.error = action.payload as string;
			})

			// Add budget
			.addCase(addBudget.pending, (state) => {
				state.isLoading = true;
				state.error = null;
			})
			.addCase(addBudget.fulfilled, (state, action) => {
				state.isLoading = false;
				state.budgets.push(action.payload);
				state.selectedBudget = action.payload;
			})
			.addCase(addBudget.rejected, (state, action) => {
				state.isLoading = false;
				state.error = action.payload as string;
			})

			// Edit budget
			.addCase(editBudget.pending, (state) => {
				state.isLoading = true;
				state.error = null;
			})
			.addCase(editBudget.fulfilled, (state, action) => {
				state.isLoading = false;

				// Update the budget in the budgets array
				const index = state.budgets.findIndex(
					(budget) => budget.id === action.payload.id
				);
				if (index !== -1) {
					state.budgets[index] = action.payload;
				}

				// Update selected budget if it's the same one
				if (
					state.selectedBudget &&
					state.selectedBudget.id === action.payload.id
				) {
					state.selectedBudget = action.payload;
				}
			})
			.addCase(editBudget.rejected, (state, action) => {
				state.isLoading = false;
				state.error = action.payload as string;
			})

			// Remove budget
			.addCase(removeBudget.pending, (state) => {
				state.isLoading = true;
				state.error = null;
			})
			.addCase(removeBudget.fulfilled, (state, action) => {
				state.isLoading = false;

				// Remove the budget from the budgets array
				state.budgets = state.budgets.filter(
					(budget) => budget.id !== action.payload
				);

				// Clear selected budget if it's the same one
				if (
					state.selectedBudget &&
					state.selectedBudget.id === action.payload
				) {
					state.selectedBudget = null;
					state.budgetStatus = null;
				}
			})
			.addCase(removeBudget.rejected, (state, action) => {
				state.isLoading = false;
				state.error = action.payload as string;
			})

			// Fetch budget status
			.addCase(fetchBudgetStatus.pending, (state) => {
				state.isLoading = true;
				state.error = null;
			})
			.addCase(fetchBudgetStatus.fulfilled, (state, action) => {
				state.isLoading = false;
				state.budgetStatus = action.payload;
			})
			.addCase(fetchBudgetStatus.rejected, (state, action) => {
				state.isLoading = false;
				state.error = action.payload as string;
			});
	},
});

export const { setSelectedBudget, clearSelectedBudget, clearError } =
	budgetsSlice.actions;

export default budgetsSlice.reducer;
