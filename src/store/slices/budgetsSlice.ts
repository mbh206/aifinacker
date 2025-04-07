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
import { Budget as BaseBudget, Expense } from '../../types';

// Extended Budget type with additional properties for the slice
export interface ExtendedBudget extends BaseBudget {
	accountId: string;
	name: string;
	isRecurring: boolean;
	recurringPeriod?: 'weekly' | 'monthly' | 'quarterly' | 'annually';
	isActive: boolean;
	notes?: string;
	createdBy: {
		uid: string;
		displayName: string;
	};
	expenses: Array<{
		id: string;
		category: string;
		amount: number;
		date: Date;
	}>;
}

interface BudgetState {
	budgets: ExtendedBudget[];
	activeBudgets: ExtendedBudget[];
	selectedBudget: ExtendedBudget | null;
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
const convertTimestamps = (budget: any): ExtendedBudget => {
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
		updatedAt:
			budget.updatedAt instanceof Timestamp
				? budget.updatedAt.toDate()
				: budget.updatedAt,
	};
};

// Helper function to filter active budgets
const filterActiveBudgets = (budgets: ExtendedBudget[]): ExtendedBudget[] => {
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
			category: string;
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
			const budgetData: Omit<ExtendedBudget, 'id'> = {
				accountId,
				name,
				amount,
				category: category || 'All',
				startDate,
				endDate,
				createdAt: new Date(),
				updatedAt: new Date(),
				createdBy: {
					uid: userId,
					displayName: userDisplayName,
				},
				notes,
				isRecurring,
				recurringPeriod: isRecurring ? recurringPeriod : undefined,
				isActive: true,
				userId,
				expenses: [],
			};

			const docRef = await addDoc(collection(db, 'budgets'), budgetData);

			return {
				...budgetData,
				id: docRef.id,
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
			const budgets: ExtendedBudget[] = [];

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
				Omit<ExtendedBudget, 'id' | 'accountId' | 'createdAt' | 'createdBy'>
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
				...currentBudget,
				...updates,
				id,
			} as ExtendedBudget;
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

export const fetchBudget = createAsyncThunk(
	'budgets/fetchBudget',
	async (budgetId: string, { rejectWithValue }) => {
		try {
			// Get the budget document
			const budgetDoc = await getDoc(doc(db, 'budgets', budgetId));
			if (!budgetDoc.exists()) {
				return rejectWithValue('Budget not found');
			}

			// Get expenses for this budget's period
			const budgetData = budgetDoc.data();
			const q = query(
				collection(db, 'expenses'),
				where('accountId', '==', budgetData.accountId),
				where('date', '>=', budgetData.startDate),
				where('date', '<=', budgetData.endDate)
			);

			const expensesSnapshot = await getDocs(q);
			const expenses = expensesSnapshot.docs.map((doc) => {
				const data = doc.data();
				return {
					id: doc.id,
					category: data.category,
					amount: data.amount,
					date: data.date.toDate(),
				};
			});

			// Ensure all required properties are included
			const budget: ExtendedBudget = {
				id: budgetDoc.id,
				accountId: budgetData.accountId,
				name: budgetData.name,
				amount: budgetData.amount,
				category: budgetData.category || 'All',
				startDate: budgetData.startDate.toDate(),
				endDate: budgetData.endDate.toDate(),
				createdAt: budgetData.createdAt.toDate(),
				updatedAt:
					budgetData.updatedAt?.toDate() || budgetData.createdAt.toDate(),
				createdBy: budgetData.createdBy,
				notes: budgetData.notes,
				isRecurring: budgetData.isRecurring,
				recurringPeriod: budgetData.recurringPeriod,
				isActive: budgetData.isActive,
				userId: budgetData.userId,
				expenses,
			};

			return budget;
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
				state.budgets[index] = action.payload as ExtendedBudget;
			}
			state.activeBudgets = filterActiveBudgets(state.budgets);
			if (state.selectedBudget?.id === action.payload.id) {
				state.selectedBudget = action.payload as ExtendedBudget;
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

		// Fetch budget
		builder.addCase(fetchBudget.pending, (state) => {
			state.status = 'loading';
		});
		builder.addCase(fetchBudget.fulfilled, (state, action) => {
			state.status = 'succeeded';
			const index = state.budgets.findIndex((b) => b.id === action.payload.id);
			if (index !== -1) {
				state.budgets[index] = action.payload;
			} else {
				state.budgets.push(action.payload);
			}
			state.selectedBudget = action.payload;
			state.error = null;
		});
		builder.addCase(fetchBudget.rejected, (state, action) => {
			state.status = 'failed';
			state.error = action.payload as string;
		});
	},
});

export const { setSelectedBudget, clearBudgets } = budgetSlice.actions;

// Selectors
export const selectBudgetStatus = (state: { budgets: BudgetState }) =>
	state.budgets.status;
export const selectBudgets = (state: { budgets: BudgetState }) =>
	state.budgets.budgets;
export const selectActiveBudgets = (state: { budgets: BudgetState }) =>
	state.budgets.activeBudgets;
export const selectSelectedBudget = (state: { budgets: BudgetState }) =>
	state.budgets.selectedBudget;
export const selectBudgetError = (state: { budgets: BudgetState }) =>
	state.budgets.error;
export const selectBudgetById = (
	state: { budgets: BudgetState },
	budgetId: string
) => state.budgets.budgets.find((budget) => budget.id === budgetId);

export default budgetSlice.reducer;
