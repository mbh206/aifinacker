// src/services/api.ts
import axios from 'axios';
import firebase from 'firebase/app';
import 'firebase/auth';
import {
  User,
  Account,
  Expense,
  Budget,
  ExpenseCategory,
  Insight,
  RecurringExpense
} from '../models/types';

// Create an axios instance with base configuration
const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests
api.interceptors.request.use(async (config) => {
  const user = firebase.auth().currentUser;

  if (user) {
    const token = await user.getIdToken();
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

// Error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const { response } = error;

    if (response && response.status === 401) {
      // Handle unauthorized (e.g., redirect to login)
      window.location.href = '/auth/login';
    }

    return Promise.reject(error);
  }
);

// User API
export const createUserProfile = async (user: User): Promise<User> => {
  const response = await api.post('/users', user);
  return response.data;
};

export const getUserProfile = async (userId: string): Promise<User> => {
  const response = await api.get(`/users/${userId}`);
  return response.data;
};

export const updateUserProfileInDb = async (userId: string, updates: Partial<User>): Promise<User> => {
  const response = await api.patch(`/users/${userId}`, updates);
  return response.data;
};

// Account API
export const createAccount = async (account: Partial<Account>): Promise<Account> => {
  const response = await api.post('/accounts', account);
  return response.data;
};

export const getAccount = async (accountId: string): Promise<Account> => {
  const response = await api.get(`/accounts/${accountId}`);
  return response.data;
};

export const updateAccount = async (accountId: string, updates: Partial<Account>): Promise<Account> => {
  const response = await api.patch(`/accounts/${accountId}`, updates);
  return response.data;
};

export const getUserAccounts = async (userId: string): Promise<Account[]> => {
  const response = await api.get(`/users/${userId}/accounts`);
  return response.data;
};

export const addAccountMember = async (
  accountId: string,
  email: string,
  role: 'admin' | 'member' | 'viewer'
): Promise<{ inviteId: string, email: string }> => {
  const response = await api.post(`/accounts/${accountId}/members`, { email, role });
  return response.data;
};

export const removeAccountMember = async (accountId: string, userId: string): Promise<void> => {
  await api.delete(`/accounts/${accountId}/members/${userId}`);
};

export const updateAccountMemberRole = async (
  accountId: string,
  userId: string,
  role: 'admin' | 'member' | 'viewer'
): Promise<void> => {
  await api.patch(`/accounts/${accountId}/members/${userId}`, { role });
};

// Expense API
export const createExpense = async (expense: Partial<Expense>): Promise<Expense> => {
  const response = await api.post('/expenses', expense);
  return response.data;
};

export const getExpense = async (expenseId: string): Promise<Expense> => {
  const response = await api.get(`/expenses/${expenseId}`);
  return response.data;
};

export const updateExpense = async (expenseId: string, updates: Partial<Expense>): Promise<Expense> => {
  const response = await api.patch(`/expenses/${expenseId}`, updates);
  return response.data;
};

export const deleteExpense = async (expenseId: string): Promise<void> => {
  await api.delete(`/expenses/${expenseId}`);
};

export const getAccountExpenses = async (
  accountId: string,
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
  }
): Promise<{ expenses: Expense[]; total: number; page: number; limit: number }> => {
  const response = await api.get(`/accounts/${accountId}/expenses`, { params });
  return response.data;
};

// Budget API
export const createBudget = async (budget: Partial<Budget>): Promise<Budget> => {
  const response = await api.post('/budgets', budget);
  return response.data;
};

export const getBudget = async (budgetId: string): Promise<Budget> => {
  const response = await api.get(`/budgets/${budgetId}`);
  return response.data;
};

export const updateBudget = async (budgetId: string, updates: Partial<Budget>): Promise<Budget> => {
  const response = await api.patch(`/budgets/${budgetId}`, updates);
  return response.data;
};

export const deleteBudget = async (budgetId: string): Promise<void> => {
  await api.delete(`/budgets/${budgetId}`);
};

export const getAccountBudgets = async (
  accountId: string,
  params?: {
    startDate?: Date;
    endDate?: Date;
    categories?: string[];
  }
): Promise<Budget[]> => {
  const response = await api.get(`/accounts/${accountId}/budgets`, { params });
  return response.data;
};

export const getBudgetStatus = async (
  budgetId: string
): Promise<{
  budget: Budget;
  spent: number;
  remaining: number;
  percentUsed: number;
  expenses: Expense[];
}> => {
  const response = await api.get(`/budgets/${budgetId}/status`);
  return response.data;
};

// Category API
export const getSystemCategories = async (): Promise<ExpenseCategory[]> => {
  const response = await api.get('/categories/system');
  return response.data;
};

export const getAccountCategories = async (accountId: string): Promise<ExpenseCategory[]> => {
  const response = await api.get(`/accounts/${accountId}/categories`);
  return response.data;
};

export const createCategory = async (
  accountId: string,
  category: Partial<ExpenseCategory>
): Promise<ExpenseCategory> => {
  const response = await api.post(`/accounts/${accountId}/categories`, category);
  return response.data;
};

export const updateCategory = async (
  accountId: string,
  categoryId: string,
  updates: Partial<ExpenseCategory>
): Promise<ExpenseCategory> => {
  const response = await api.patch(`/accounts/${accountId}/categories/${categoryId}`, updates);
  return response.data;
};

export const deleteCategory = async (accountId: string, categoryId: string): Promise<void> => {
  await api.delete(`/accounts/${accountId}/categories/${categoryId}`);
};

// Insights API
export const getAccountInsights = async (
  accountId: string,
  params?: {
    type?: string;
    startDate?: Date;
    endDate?: Date;
    status?: 'new' | 'viewed' | 'dismissed';
  }
): Promise<Insight[]> => {
  const response = await api.get(`/accounts/${accountId}/insights`, { params });
  return response.data;
};

export const dismissInsight = async (insightId: string): Promise<void> => {
  await api.patch(`/insights/${insightId}`, { status: 'dismissed' });
};

export const markInsightAsViewed = async (insightId: string): Promise<void> => {
  await api.patch(`/insights/${insightId}`, { status: 'viewed' });
};

export const generateInsights = async (accountId: string): Promise<Insight[]> => {
  const response = await api.post(`/accounts/${accountId}/insights/generate`);
  return response.data;
};

// Recurring Expenses API
export const createRecurringExpense = async (
  recurringExpense: Partial<RecurringExpense>
): Promise<RecurringExpense> => {
  const response = await api.post('/recurring-expenses', recurringExpense);
  return response.data;
};

export const getRecurringExpense = async (recurringExpenseId: string): Promise<RecurringExpense> => {
  const response = await api.get(`/recurring-expenses/${recurringExpenseId}`);
  return response.data;
};

export const updateRecurringExpense = async (
  recurringExpenseId: string,
  updates: Partial<RecurringExpense>
): Promise<RecurringExpense> => {
  const response = await api.patch(`/recurring-expenses/${recurringExpenseId}`, updates);
  return response.data;
};

export const deleteRecurringExpense = async (recurringExpenseId: string): Promise<void> => {
  await api.delete(`/recurring-expenses/${recurringExpenseId}`);
};

export const getAccountRecurringExpenses = async (accountId: string): Promise<RecurringExpense[]> => {
  const response = await api.get(`/accounts/${accountId}/recurring-expenses`);
  return response.data;
};

// Currency API
export const getExchangeRates = async (baseCurrency: string): Promise<Record<string, number>> => {
  const response = await api.get(`/currencies/rates`, { params: { base: baseCurrency } });
  return response.data.rates;
};

export const getSupportedCurrencies = async (): Promise<{ code: string; name: string; symbol: string }[]> => {
  const response = await api.get('/currencies');
  return response.data;
};

// Analytics API
export const getExpensesByCategory = async (
  accountId: string,
  params: {
    startDate: Date;
    endDate: Date;
  }
): Promise<{ category: string; amount: number; percentage: number }[]> => {
  const response = await api.get(`/accounts/${accountId}/analytics/categories`, { params });
  return response.data;
};

export const getExpensesByTime = async (
  accountId: string,
  params: {
    startDate: Date;
    endDate: Date;
    interval: 'day' | 'week' | 'month' | 'year';
  }
): Promise<{ date: string; amount: number }[]> => {
  const response = await api.get(`/accounts/${accountId}/analytics/time`, { params });
  return response.data;
};

export const getExpenseTrends = async (
  accountId: string,
  params: {
    months: number;
    categories?: string[];
  }
): Promise<{ month: string; amount: number }[]> => {
  const response = await api.get(`/accounts/${accountId}/analytics/trends`, { params });
  return response.data;
};

// Search API
export const searchExpenses = async (
  accountId: string,
  query: string
): Promise<Expense[]> => {
  const response = await api.get(`/accounts/${accountId}/search/expenses`, { params: { q: query } });
  return response.data;
};
