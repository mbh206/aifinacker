import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import {
	collection,
	doc,
	addDoc,
	getDoc,
	getDocs,
	updateDoc,
	deleteDoc,
	query,
	where,
	orderBy,
	Timestamp,
} from 'firebase/firestore';
import { db } from '../../services/firebase';

// Types
export interface Budget {
	id: string;
	accountId: string;
	name: string;
	amount: number;
	category: string | null; // null means all categories
	startDate: Date;
	endDate: Date;
	createdAt: Date;
	createdBy: {
		uid: string;
		displayName: string;
	};
	notes?: string;
	isRecurring: boolean;
	recurringPeriod?: 'weekly' | 'monthly' | 'quarterly' | 'annually';
	isActive: boolean;
}

interface BudgetState {
	budgets: Budget[];
	activeBudgets: Budget[];
	selectedBudget: Budget | null;
	status: 'idle' | 'loading' | 'succeeded' | 'failed';
	error: string | null;
}

const initialState: BudgetState = {
	budgets: [],
	activeBudgets: [],
	selectedBudget: null,
	status: 'idle',
	error: null,
};

// Helper function to convert Firestore timestamp to Date
const convertTimestamps = (budget: any): Budget => {
	return {
		...budget,
		startDate:
			budget.startDate instanceof Timestamp
				? budget.startDate.toDate()
				: budget.startDate,
		endDate:
			budget.endDate instanceof Timestamp
				? budget.endDate.toDate()
				: budget.endDate,
		createdAt:
			budget.createdAt instanceof Timestamp
				? budget.createdAt.toDate()
				: budget.createdAt,
	};
};

// Helper function to filter active budgets
const filterActiveBudgets = (budgets: Budget[]): Budget[] => {
	const now = new Date();
	return budgets.filter(
		(budget) =>
			budget.isActive && budget.startDate <= now && budget.endDate >= now
	);
};

// Async thunks
export const createBudget = createAsyncThunk(
	'budgets/createBudget',
	async (
		{
			accountId,
			name,
			amount,
			category,
			startDate,
			endDate,
			userId,
			userDisplayName,
			notes,
			isRecurring,
			recurringPeriod,
		}: {
			accountId: string;
			name: string;
			amount: number;
			category: string | null;
			startDate: Date;
			endDate: Date;
			userId: string;
			userDisplayName: string;
			notes?: string;
			isRecurring: boolean;
			recurringPeriod?: 'weekly' | 'monthly' | 'quarterly' | 'annually';
		},
		{ rejectWithValue }
	) => {
		try {
			// Create budget document
			const budgetData = {
				accountId,
				name,
				amount,
				category,
				startDate,
				endDate,
				createdAt: new Date(),
				createdBy: {
					uid: userId,
					displayName: userDisplayName,
				},
				notes,
				isRecurring,
				recurringPeriod: isRecurring ? recurringPeriod : undefined,
				isActive: true,
			};

			const docRef = await addDoc(collection(db, 'budgets'), budgetData);

			return {
				id: docRef.id,
				...budgetData,
			};
		} catch (error: any) {
			return rejectWithValue(error.message);
		}
	}
);

export const fetchBudgets = createAsyncThunk(
	'budgets/fetchBudgets',
	async (accountId: string, { rejectWithValue }) => {
		try {
			const q = query(
				collection(db, 'budgets'),
				where('accountId', '==', accountId),
				orderBy('startDate', 'desc')
			);

			const querySnapshot = await getDocs(q);
			const budgets: Budget[] = [];

			querySnapshot.forEach((doc) => {
				const data = doc.data();
				budgets.push(
					convertTimestamps({
						id: doc.id,
						...data,
					})
				);
			});

			return budgets;
		} catch (error: any) {
			return rejectWithValue(error.message);
		}
	}
);

export const updateBudget = createAsyncThunk(
	'budgets/updateBudget',
	async (
		{
			id,
			updates,
		}: {
			id: string;
			updates: Partial<
				Omit<Budget, 'id' | 'accountId' | 'createdAt' | 'createdBy'>
			>;
		},
		{ getState, rejectWithValue }
	) => {
		try {
			// Update the document
			await updateDoc(doc(db, 'budgets', id), updates);

			const state = getState() as { budgets: BudgetState };
			const currentBudget = state.budgets.budgets.find((b) => b.id === id);

			if (!currentBudget) {
				return rejectWithValue('Budget not found');
			}

			return {
				id,
				...currentBudget,
				...updates,
			};
		} catch (error: any) {
			return rejectWithValue(error.message);
		}
	}
);

export const deleteBudget = createAsyncThunk(
	'budgets/deleteBudget',
	async (id: string, { rejectWithValue }) => {
		try {
			// Delete budget document
			await deleteDoc(doc(db, 'budgets', id));

			return id;
		} catch (error: any) {
			return rejectWithValue(error.message);
		}
	}
);

const budgetSlice = createSlice({
	name: 'budgets',
	initialState,
	reducers: {
		setSelectedBudget: (state, action: PayloadAction<string | null>) => {
			state.selectedBudget = action.payload
				? state.budgets.find((b) => b.id === action.payload) || null
				: null;
		},
		clearBudgets: (state) => {
			state.budgets = [];
			state.activeBudgets = [];
			state.selectedBudget = null;
			state.status = 'idle';
			state.error = null;
		},
	},
	extraReducers: (builder) => {
		// Create budget
		builder.addCase(createBudget.pending, (state) => {
			state.status = 'loading';
		});
		builder.addCase(createBudget.fulfilled, (state, action) => {
			state.status = 'succeeded';
			state.budgets.unshift(action.payload);
			state.activeBudgets = filterActiveBudgets(state.budgets);
			state.error = null;
		});
		builder.addCase(createBudget.rejected, (state, action) => {
			state.status = 'failed';
			state.error = action.payload as string;
		});

		// Fetch budgets
		builder.addCase(fetchBudgets.pending, (state) => {
			state.status = 'loading';
		});
		builder.addCase(fetchBudgets.fulfilled, (state, action) => {
			state.status = 'succeeded';
			state.budgets = action.payload;
			state.activeBudgets = filterActiveBudgets(action.payload);
			state.error = null;
		});
		builder.addCase(fetchBudgets.rejected, (state, action) => {
			state.status = 'failed';
			state.error = action.payload as string;
		});

		// Update budget
		builder.addCase(updateBudget.pending, (state) => {
			state.status = 'loading';
		});
		builder.addCase(updateBudget.fulfilled, (state, action) => {
			state.status = 'succeeded';
			const index = state.budgets.findIndex((b) => b.id === action.payload.id);
			if (index !== -1) {
				state.budgets[index] = action.payload as Budget;
			}
			state.activeBudgets = filterActiveBudgets(state.budgets);
			if (state.selectedBudget?.id === action.payload.id) {
				state.selectedBudget = action.payload as Budget;
			}
			state.error = null;
		});
		builder.addCase(updateBudget.rejected, (state, action) => {
			state.status = 'failed';
			state.error = action.payload as string;
		});

		// Delete budget
		builder.addCase(deleteBudget.pending, (state) => {
			state.status = 'loading';
		});
		builder.addCase(deleteBudget.fulfilled, (state, action) => {
			state.status = 'succeeded';
			state.budgets = state.budgets.filter((b) => b.id !== action.payload);
			state.activeBudgets = filterActiveBudgets(state.budgets);
			if (state.selectedBudget?.id === action.payload) {
				state.selectedBudget = null;
			}
			state.error = null;
		});
		builder.addCase(deleteBudget.rejected, (state, action) => {
			state.status = 'failed';
			state.error = action.payload as string;
		});
	},
});

export const { setSelectedBudget, clearBudgets } = budgetSlice.actions;

export default budgetSlice.reducer;
