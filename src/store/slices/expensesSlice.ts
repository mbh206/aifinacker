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
	limit,
	Timestamp,
} from 'firebase/firestore';
import {
	ref,
	uploadBytes,
	getDownloadURL,
	deleteObject,
} from 'firebase/storage';
import { db, storage } from '../../services/firebase';

// Types
export interface Expense {
	id: string;
	accountId: string;
	amount: number;
	category: string;
	description: string;
	date: Date;
	createdAt: Date;
	createdBy: {
		uid: string;
		displayName: string;
	};
	currency: string;
	exchangeRate: number;
	amountInBaseCurrency: number;
	receiptUrl?: string;
	tags?: string[];
}

interface ExpenseState {
	expenses: Expense[];
	filteredExpenses: Expense[];
	selectedExpense: Expense | null;
	status: 'idle' | 'loading' | 'succeeded' | 'failed';
	error: string | null;
	filter: {
		dateRange: [Date | null, Date | null];
		categories: string[];
		search: string;
		tags: string[];
	};
}

const initialState: ExpenseState = {
	expenses: [],
	filteredExpenses: [],
	selectedExpense: null,
	status: 'idle',
	error: null,
	filter: {
		dateRange: [null, null],
		categories: [],
		search: '',
		tags: [],
	},
};

// Helper function to convert Firestore timestamp to Date
const convertTimestamps = (expense: any): Expense => {
	return {
		...expense,
		date:
			expense.date instanceof Timestamp ? expense.date.toDate() : expense.date,
		createdAt:
			expense.createdAt instanceof Timestamp
				? expense.createdAt.toDate()
				: expense.createdAt,
	};
};

// Async thunks
export const addExpense = createAsyncThunk(
	'expenses/addExpense',
	async (
		{
			accountId,
			amount,
			category,
			description,
			date,
			currency,
			exchangeRate,
			userId,
			userDisplayName,
			receiptFile,
		}: {
			accountId: string;
			amount: number;
			category: string;
			description: string;
			date: Date;
			currency: string;
			exchangeRate: number;
			userId: string;
			userDisplayName: string;
			receiptFile?: File;
		},
		{ rejectWithValue }
	) => {
		try {
			let receiptUrl;

			// Upload receipt if provided
			if (receiptFile) {
				const storageRef = ref(
					storage,
					`receipts/${accountId}/${Date.now()}_${receiptFile.name}`
				);
				const snapshot = await uploadBytes(storageRef, receiptFile);
				receiptUrl = await getDownloadURL(snapshot.ref);
			}

			// Create expense document
			const expenseData = {
				accountId,
				amount,
				category,
				description,
				date,
				createdAt: new Date(),
				createdBy: {
					uid: userId,
					displayName: userDisplayName,
				},
				currency,
				exchangeRate,
				amountInBaseCurrency: amount * exchangeRate,
				receiptUrl,
				tags: [],
			};

			const docRef = await addDoc(collection(db, 'expenses'), expenseData);

			return {
				id: docRef.id,
				...expenseData,
			};
		} catch (error: any) {
			return rejectWithValue(error.message);
		}
	}
);

export const fetchExpenses = createAsyncThunk(
	'expenses/fetchExpenses',
	async (accountId: string, { rejectWithValue }) => {
		try {
			const q = query(
				collection(db, 'expenses'),
				where('accountId', '==', accountId),
				orderBy('date', 'desc')
			);

			const querySnapshot = await getDocs(q);
			const expenses: Expense[] = [];

			querySnapshot.forEach((doc) => {
				const data = doc.data();
				expenses.push(
					convertTimestamps({
						id: doc.id,
						...data,
					})
				);
			});

			return expenses;
		} catch (error: any) {
			return rejectWithValue(error.message);
		}
	}
);

export const updateExpense = createAsyncThunk(
	'expenses/updateExpense',
	async (
		{
			id,
			updates,
			receiptFile,
			deleteReceipt,
		}: {
			id: string;
			updates: Partial<Omit<Expense, 'id' | 'createdAt' | 'createdBy'>>;
			receiptFile?: File;
			deleteReceipt?: boolean;
		},
		{ getState, rejectWithValue }
	) => {
		try {
			const state = getState() as { expenses: ExpenseState };
			const currentExpense = state.expenses.expenses.find(
				(exp) => exp.id === id
			);

			if (!currentExpense) {
				return rejectWithValue('Expense not found');
			}

			let updatedData = { ...updates };

			// Handle receipt changes
			if (deleteReceipt && currentExpense.receiptUrl) {
				// Delete the old receipt
				const oldReceiptRef = ref(storage, currentExpense.receiptUrl);
				await deleteObject(oldReceiptRef);
				updatedData.receiptUrl = null;
			} else if (receiptFile) {
				// Delete old receipt if exists
				if (currentExpense.receiptUrl) {
					const oldReceiptRef = ref(storage, currentExpense.receiptUrl);
					await deleteObject(oldReceiptRef);
				}

				// Upload new receipt
				const storageRef = ref(
					storage,
					`receipts/${currentExpense.accountId}/${Date.now()}_${
						receiptFile.name
					}`
				);
				const snapshot = await uploadBytes(storageRef, receiptFile);
				updatedData.receiptUrl = await getDownloadURL(snapshot.ref);
			}

			// Calculate amount in base currency if amount or exchange rate changed
			if (updates.amount !== undefined || updates.exchangeRate !== undefined) {
				const newAmount = updates.amount ?? currentExpense.amount;
				const newExchangeRate =
					updates.exchangeRate ?? currentExpense.exchangeRate;
				updatedData.amountInBaseCurrency = newAmount * newExchangeRate;
			}

			// Update the document
			await updateDoc(doc(db, 'expenses', id), updatedData);

			return {
				id,
				...currentExpense,
				...updatedData,
			};
		} catch (error: any) {
			return rejectWithValue(error.message);
		}
	}
);

export const deleteExpense = createAsyncThunk(
	'expenses/deleteExpense',
	async (id: string, { getState, rejectWithValue }) => {
		try {
			const state = getState() as { expenses: ExpenseState };
			const expense = state.expenses.expenses.find((exp) => exp.id === id);

			if (!expense) {
				return rejectWithValue('Expense not found');
			}

			// Delete receipt if exists
			if (expense.receiptUrl) {
				const receiptRef = ref(storage, expense.receiptUrl);
				await deleteObject(receiptRef);
			}

			// Delete expense document
			await deleteDoc(doc(db, 'expenses', id));

			return id;
		} catch (error: any) {
			return rejectWithValue(error.message);
		}
	}
);

const expenseSlice = createSlice({
	name: 'expenses',
	initialState,
	reducers: {
		setSelectedExpense: (state, action: PayloadAction<string | null>) => {
			state.selectedExpense = action.payload
				? state.expenses.find((exp) => exp.id === action.payload) || null
				: null;
		},
		setDateRangeFilter: (
			state,
			action: PayloadAction<[Date | null, Date | null]>
		) => {
			state.filter.dateRange = action.payload;
			state.filteredExpenses = applyFilters(state.expenses, state.filter);
		},
		setCategoriesFilter: (state, action: PayloadAction<string[]>) => {
			state.filter.categories = action.payload;
			state.filteredExpenses = applyFilters(state.expenses, state.filter);
		},
		setSearchFilter: (state, action: PayloadAction<string>) => {
			state.filter.search = action.payload;
			state.filteredExpenses = applyFilters(state.expenses, state.filter);
		},
		setTagsFilter: (state, action: PayloadAction<string[]>) => {
			state.filter.tags = action.payload;
			state.filteredExpenses = applyFilters(state.expenses, state.filter);
		},
		clearFilters: (state) => {
			state.filter = {
				dateRange: [null, null],
				categories: [],
				search: '',
				tags: [],
			};
			state.filteredExpenses = state.expenses;
		},
		clearExpenses: (state) => {
			state.expenses = [];
			state.filteredExpenses = [];
			state.selectedExpense = null;
			state.status = 'idle';
			state.error = null;
		},
	},
	extraReducers: (builder) => {
		// Add expense
		builder.addCase(addExpense.pending, (state) => {
			state.status = 'loading';
		});
		builder.addCase(addExpense.fulfilled, (state, action) => {
			state.status = 'succeeded';
			state.expenses.unshift(action.payload);
			state.filteredExpenses = applyFilters(state.expenses, state.filter);
			state.error = null;
		});
		builder.addCase(addExpense.rejected, (state, action) => {
			state.status = 'failed';
			state.error = action.payload as string;
		});

		// Fetch expenses
		builder.addCase(fetchExpenses.pending, (state) => {
			state.status = 'loading';
		});
		builder.addCase(fetchExpenses.fulfilled, (state, action) => {
			state.status = 'succeeded';
			state.expenses = action.payload;
			state.filteredExpenses = applyFilters(action.payload, state.filter);
			state.error = null;
		});
		builder.addCase(fetchExpenses.rejected, (state, action) => {
			state.status = 'failed';
			state.error = action.payload as string;
		});

		// Update expense
		builder.addCase(updateExpense.pending, (state) => {
			state.status = 'loading';
		});
		builder.addCase(updateExpense.fulfilled, (state, action) => {
			state.status = 'succeeded';
			const index = state.expenses.findIndex(
				(exp) => exp.id === action.payload.id
			);
			if (index !== -1) {
				state.expenses[index] = action.payload as Expense;
			}
			state.filteredExpenses = applyFilters(state.expenses, state.filter);
			if (state.selectedExpense?.id === action.payload.id) {
				state.selectedExpense = action.payload as Expense;
			}
			state.error = null;
		});
		builder.addCase(updateExpense.rejected, (state, action) => {
			state.status = 'failed';
			state.error = action.payload as string;
		});

		// Delete expense
		builder.addCase(deleteExpense.pending, (state) => {
			state.status = 'loading';
		});
		builder.addCase(deleteExpense.fulfilled, (state, action) => {
			state.status = 'succeeded';
			state.expenses = state.expenses.filter(
				(exp) => exp.id !== action.payload
			);
			state.filteredExpenses = applyFilters(state.expenses, state.filter);
			if (state.selectedExpense?.id === action.payload) {
				state.selectedExpense = null;
			}
			state.error = null;
		});
		builder.addCase(deleteExpense.rejected, (state, action) => {
			state.status = 'failed';
			state.error = action.payload as string;
		});
	},
});

// Helper function to apply filters
const applyFilters = (expenses: Expense[], filter: ExpenseState['filter']) => {
	let filtered = [...expenses];

	// Apply date range filter
	if (filter.dateRange[0] && filter.dateRange[1]) {
		filtered = filtered.filter(
			(exp) =>
				exp.date >= filter.dateRange[0]! && exp.date <= filter.dateRange[1]!
		);
	} else if (filter.dateRange[0]) {
		filtered = filtered.filter((exp) => exp.date >= filter.dateRange[0]!);
	} else if (filter.dateRange[1]) {
		filtered = filtered.filter((exp) => exp.date <= filter.dateRange[1]!);
	}

	// Apply categories filter
	if (filter.categories.length > 0) {
		filtered = filtered.filter((exp) =>
			filter.categories.includes(exp.category)
		);
	}

	// Apply search filter
	if (filter.search) {
		const searchLower = filter.search.toLowerCase();
		filtered = filtered.filter(
			(exp) =>
				exp.description.toLowerCase().includes(searchLower) ||
				exp.category.toLowerCase().includes(searchLower)
		);
	}

	// Apply tags filter
	if (filter.tags.length > 0) {
		filtered = filtered.filter(
			(exp) => exp.tags && filter.tags.some((tag) => exp.tags?.includes(tag))
		);
	}

	return filtered;
};

export const {
	setSelectedExpense,
	setDateRangeFilter,
	setCategoriesFilter,
	setSearchFilter,
	setTagsFilter,
	clearFilters,
	clearExpenses,
} = expenseSlice.actions;

// Selectors
export const selectExpenses = (state: { expenses: ExpenseState }) =>
	state.expenses.expenses;
export const selectFilteredExpenses = (state: { expenses: ExpenseState }) =>
	state.expenses.filteredExpenses;
export const selectSelectedExpense = (state: { expenses: ExpenseState }) =>
	state.expenses.selectedExpense;
export const selectExpenseStatus = (state: { expenses: ExpenseState }) =>
	state.expenses.status;
export const selectExpenseError = (state: { expenses: ExpenseState }) =>
	state.expenses.error;
export const selectExpenseFilters = (state: { expenses: ExpenseState }) =>
	state.expenses.filter;

// Selector for expenses by month
export const selectExpensesByMonth = (state: { expenses: ExpenseState }) => {
	const expenses = state.expenses.expenses;
	const expensesByMonth: { [key: string]: Expense[] } = {};

	expenses.forEach((expense) => {
		const monthKey = `${expense.date.getFullYear()}-${
			expense.date.getMonth() + 1
		}`;
		if (!expensesByMonth[monthKey]) {
			expensesByMonth[monthKey] = [];
		}
		expensesByMonth[monthKey].push(expense);
	});

	return expensesByMonth;
};

// Selector for recent expenses
export const selectRecentExpenses = (
	state: { expenses: ExpenseState },
	limit = 5
) => {
	// Sort expenses by date in descending order (newest first)
	const sortedExpenses = [...state.expenses.expenses].sort(
		(a, b) => b.date.getTime() - a.date.getTime()
	);

	// Return the most recent expenses up to the limit
	return sortedExpenses.slice(0, limit);
};

// Selector for total expenses by category
export const selectTotalExpensesByCategory = (state: {
	expenses: ExpenseState;
}) => {
	const expenses = state.expenses.expenses;
	const totalsByCategory: { [key: string]: number } = {};

	expenses.forEach((expense) => {
		if (!totalsByCategory[expense.category]) {
			totalsByCategory[expense.category] = 0;
		}
		totalsByCategory[expense.category] += expense.amountInBaseCurrency;
	});

	return totalsByCategory;
};

// Selector for unique expense categories
export const selectExpenseCategories = (state: { expenses: ExpenseState }) => {
	const expenses = state.expenses.expenses;
	const categories = new Set<string>();

	expenses.forEach((expense) => {
		categories.add(expense.category);
	});

	return Array.from(categories).sort();
};

// Selector for all expenses
export const selectAllExpenses = (state: { expenses: ExpenseState }) => {
	return state.expenses.expenses;
};

// Selector for expenses status
export const selectExpensesStatus = (state: { expenses: ExpenseState }) => {
	return state.expenses.status;
};

export default expenseSlice.reducer;
