import axios, { AxiosInstance, AxiosResponse, AxiosError } from 'axios';
import { User as FirebaseUser } from 'firebase/auth';
import { User } from '../models/types';
import { firebaseService } from './firebase';

// Define interfaces for API responses and request payloads
export interface ApiErrorResponse {
	message: string;
	code?: string;
}

export interface PaginationParams {
	page?: number;
	limit?: number;
	sortBy?: string;
	sortOrder?: 'asc' | 'desc';
}

export interface FinancialInsightsParams extends PaginationParams {
	startDate?: Date;
	endDate?: Date;
	category?: string;
}

interface AccountMember {
	uid: string;
	email: string;
	displayName: string;
	role: 'admin' | 'member' | 'viewer';
}

/**
 * API Service Class
 * Provides centralized methods for external API interactions
 */
class ApiService {
	private api: AxiosInstance;

	constructor() {
		this.api = axios.create({
			baseURL: import.meta.env.VITE_API_BASE_URL || '/api',
			timeout: 10000, // 10 seconds
			headers: {
				'Content-Type': 'application/json',
			},
		});

		// Interceptor to add authentication token
		this.api.interceptors.request.use(
			async (config) => {
				const user = this.api.defaults.headers.common['Authorization'];

				if (!user) {
					try {
						const currentUser = await this.getCurrentUser();
						if (currentUser) {
							const token = await currentUser.getIdToken();
							config.headers.Authorization = `Bearer ${token}`;
						}
					} catch (error) {
						console.error('Failed to get auth token', error);
					}
				}

				return config;
			},
			(error) => Promise.reject(error)
		);

		// Response interceptor for error handling
		this.api.interceptors.response.use(
			(response) => response,
			this.handleError
		);
	}

	// Get current authenticated user
	private async getCurrentUser(): Promise<FirebaseUser | null> {
		return new Promise((resolve, reject) => {
			const unsubscribe = firebaseService.onAuthStateChange((user) => {
				unsubscribe();
				resolve(user);
			});
		});
	}

	// Central error handling method
	private handleError(error: AxiosError): Promise<ApiErrorResponse> {
		if (error.response) {
			// The request was made and the server responded with a status code
			const errorData = error.response.data as ApiErrorResponse;
			console.error('API Error Response:', errorData);
			return Promise.reject(errorData);
		} else if (error.request) {
			// The request was made but no response was received
			console.error('No response received:', error.request);
			return Promise.reject({
				message: 'No response from server',
				code: 'NETWORK_ERROR',
			});
		} else {
			// Something happened in setting up the request
			console.error('Error setting up request:', error.message);
			return Promise.reject({
				message: 'Error preparing request',
				code: 'REQUEST_ERROR',
			});
		}
	}

	// Expense-related API methods
	async getExpenses(params?: PaginationParams) {
		try {
			const response = await this.api.get('/expenses', { params });
			return response.data;
		} catch (error) {
			throw error;
		}
	}

	async getExpense(expenseId: string) {
		try {
			const response = await this.api.get(`/expenses/${expenseId}`);
			return response.data;
		} catch (error) {
			throw error;
		}
	}

	async getAccountExpenses(accountId: string, params?: PaginationParams) {
		try {
			const response = await this.api.get(`/accounts/${accountId}/expenses`, {
				params,
			});
			return response.data;
		} catch (error) {
			throw error;
		}
	}

	async searchExpenses(query: string, params?: PaginationParams) {
		try {
			const response = await this.api.get('/expenses/search', {
				params: {
					...params,
					q: query,
				},
			});
			return response.data;
		} catch (error) {
			throw error;
		}
	}

	async createExpense(expenseData: any) {
		try {
			const response = await this.api.post('/expenses', expenseData);
			return response.data;
		} catch (error) {
			throw error;
		}
	}

	async updateExpense(expenseId: string, updates: any) {
		try {
			const response = await this.api.patch(`/expenses/${expenseId}`, updates);
			return response.data;
		} catch (error) {
			throw error;
		}
	}

	async deleteExpense(expenseId: string) {
		try {
			await this.api.delete(`/expenses/${expenseId}`);
		} catch (error) {
			throw error;
		}
	}

	// Budget-related API methods
	async getBudgets(params?: PaginationParams) {
		try {
			const response = await this.api.get('/budgets', { params });
			return response.data;
		} catch (error) {
			throw error;
		}
	}

	async getBudget(budgetId: string) {
		try {
			const response = await this.api.get(`/budgets/${budgetId}`);
			return response.data;
		} catch (error) {
			throw error;
		}
	}

	async getAccountBudgets(accountId: string, params?: any) {
		try {
			const response = await this.api.get(`/accounts/${accountId}/budgets`, {
				params,
			});
			return response.data;
		} catch (error) {
			throw error;
		}
	}

	async createBudget(budgetData: any) {
		try {
			const response = await this.api.post('/budgets', budgetData);
			return response.data;
		} catch (error) {
			throw error;
		}
	}

	async updateBudget(budgetId: string, updates: any) {
		try {
			const response = await this.api.patch(`/budgets/${budgetId}`, updates);
			return response.data;
		} catch (error) {
			throw error;
		}
	}

	async deleteBudget(budgetId: string) {
		try {
			await this.api.delete(`/budgets/${budgetId}`);
		} catch (error) {
			throw error;
		}
	}

	async getBudgetStatus(budgetId: string) {
		try {
			const response = await this.api.get(`/budgets/${budgetId}/status`);
			return response.data;
		} catch (error) {
			throw error;
		}
	}

	// Currency-related API methods
	async getSupportedCurrencies() {
		try {
			const response = await this.api.get('/currencies');
			return response.data;
		} catch (error) {
			throw error;
		}
	}

	async getExchangeRates(baseCurrency: string) {
		try {
			const response = await this.api.get(`/currencies/rates`, {
				params: { base: baseCurrency },
			});
			return response.data;
		} catch (error) {
			throw error;
		}
	}

	// Financial Insights API methods
	async getFinancialInsights(params?: FinancialInsightsParams) {
		try {
			const response = await this.api.get('/insights', { params });
			return response.data;
		} catch (error) {
			throw error;
		}
	}

	// Account-related API methods
	async getAccounts(params?: PaginationParams) {
		try {
			const response = await this.api.get('/accounts', { params });
			return response.data;
		} catch (error) {
			throw error;
		}
	}

	async getAccount(accountId: string) {
		try {
			const response = await this.api.get(`/accounts/${accountId}`);
			return response.data;
		} catch (error) {
			throw error;
		}
	}

	async getUserAccounts(userId: string) {
		try {
			const response = await this.api.get(`/users/${userId}/accounts`);
			return response.data;
		} catch (error) {
			throw error;
		}
	}

	async createAccount(accountData: any) {
		try {
			const response = await this.api.post('/accounts', accountData);
			return response.data;
		} catch (error) {
			throw error;
		}
	}

	async updateAccount(accountId: string, updates: any) {
		try {
			const response = await this.api.patch(`/accounts/${accountId}`, updates);
			return response.data;
		} catch (error) {
			throw error;
		}
	}

	async addAccountMember(
		accountId: string,
		email: string,
		role: 'admin' | 'member' | 'viewer'
	): Promise<AccountMember> {
		try {
			const response = await this.api.post(`/accounts/${accountId}/members`, {
				email,
				role,
			});
			return response.data;
		} catch (error) {
			throw error;
		}
	}

	async removeAccountMember(accountId: string, userId: string): Promise<void> {
		try {
			await this.api.delete(`/accounts/${accountId}/members/${userId}`);
		} catch (error) {
			throw error;
		}
	}

	async updateAccountMemberRole(
		accountId: string,
		userId: string,
		role: 'admin' | 'member' | 'viewer'
	): Promise<AccountMember> {
		try {
			const response = await this.api.patch(
				`/accounts/${accountId}/members/${userId}`,
				{ role }
			);
			return response.data;
		} catch (error) {
			throw error;
		}
	}

	// Category-related API methods
	async getCategories() {
		try {
			const response = await this.api.get('/categories');
			return response.data;
		} catch (error) {
			throw error;
		}
	}

	async getSystemCategories() {
		try {
			const response = await this.api.get('/categories/system');
			return response.data;
		} catch (error) {
			throw error;
		}
	}

	async getAccountCategories(accountId: string) {
		try {
			const response = await this.api.get(`/accounts/${accountId}/categories`);
			return response.data;
		} catch (error) {
			throw error;
		}
	}

	// Upload methods
	async uploadFile(file: File, endpoint: string) {
		const formData = new FormData();
		formData.append('file', file);

		try {
			const response = await this.api.post(endpoint, formData, {
				headers: {
					'Content-Type': 'multipart/form-data',
				},
			});
			return response.data;
		} catch (error) {
			throw error;
		}
	}

	// User profile methods
	async createUserProfile(
		userData: Omit<User, 'firebaseUser'> & { firebaseUser: FirebaseUser }
	): Promise<User> {
		try {
			// For development, return the user data directly if the API call fails
			try {
				const response = await this.api.post('/users/profile', userData);
				return response.data;
			} catch (error) {
				console.warn(
					'API call failed, using mock user profile for development'
				);
				// Return the user data directly for development
				return {
					...userData,
					createdAt: new Date(),
					updatedAt: new Date(),
				};
			}
		} catch (error) {
			throw error;
		}
	}

	async getUserProfile(userId: string): Promise<User> {
		try {
			// For development, return a mock user profile if the API call fails
			try {
				const response = await this.api.get(`/users/${userId}`);
				return response.data;
			} catch (error) {
				console.warn(
					'API call failed, using mock user profile for development'
				);
				// Return a mock user profile for development
				return {
					firebaseUser: {
						uid: userId,
						email: 'user@example.com',
						displayName: 'Test User',
						photoURL: null,
						emailVerified: true,
						isAnonymous: false,
						phoneNumber: null,
						providerId: 'password',
						metadata: {
							creationTime: new Date().toISOString(),
							lastSignInTime: new Date().toISOString(),
						},
						providerData: [],
						refreshToken: '',
						tenantId: null,
						delete: async () => {},
						getIdToken: async () => 'mock-token',
						getIdTokenResult: async () => ({
							token: 'mock-token',
							claims: {},
							authTime: new Date().toISOString(),
							issuedAtTime: new Date().toISOString(),
							expirationTime: new Date(Date.now() + 3600000).toISOString(),
							signInProvider: null,
							signInSecondFactor: null,
						}),
						reload: async () => {},
						toJSON: () => ({}),
					},
					preferences: {
						darkMode: false,
						language: 'en',
						currencyDisplay: 'USD',
						notificationSettings: {
							email: true,
							push: true,
							budgetAlerts: true,
							expenseReminders: true,
						},
					},
					createdAt: new Date(),
					updatedAt: new Date(),
				};
			}
		} catch (error) {
			throw error;
		}
	}

	async updateUserProfile(
		userId: string,
		updates: Partial<User>
	): Promise<User> {
		try {
			const response = await this.api.patch(`/users/${userId}`, updates);
			return response.data;
		} catch (error) {
			throw error;
		}
	}
}

// Export a singleton instance of ApiService
export const apiService = new ApiService();

export const addAccountMember = (
	accountId: string,
	email: string,
	role: 'admin' | 'member' | 'viewer'
) => apiService.addAccountMember(accountId, email, role);

export const removeAccountMember = (accountId: string, userId: string) =>
	apiService.removeAccountMember(accountId, userId);

export const updateAccountMemberRole = (
	accountId: string,
	userId: string,
	role: 'admin' | 'member' | 'viewer'
) => apiService.updateAccountMemberRole(accountId, userId, role);

// Export account-related functions
export const getAccounts = (params?: PaginationParams) =>
	apiService.getAccounts(params);
export const getAccount = (accountId: string) =>
	apiService.getAccount(accountId);
export const getUserAccounts = (userId: string) =>
	apiService.getUserAccounts(userId);
export const createAccount = (accountData: any) =>
	apiService.createAccount(accountData);
export const updateAccount = (accountId: string, updates: any) =>
	apiService.updateAccount(accountId, updates);

// Export expense-related functions
export const getExpenses = (params?: PaginationParams) =>
	apiService.getExpenses(params);
export const getExpense = (expenseId: string) =>
	apiService.getExpense(expenseId);
export const getAccountExpenses = (
	accountId: string,
	params?: PaginationParams
) => apiService.getAccountExpenses(accountId, params);
export const searchExpenses = (query: string, params?: PaginationParams) =>
	apiService.searchExpenses(query, params);
export const createExpense = (expenseData: any) =>
	apiService.createExpense(expenseData);
export const updateExpense = (expenseId: string, updates: any) =>
	apiService.updateExpense(expenseId, updates);
export const deleteExpense = (expenseId: string) =>
	apiService.deleteExpense(expenseId);

// Export budget-related functions
export const getBudgets = (params?: PaginationParams) =>
	apiService.getBudgets(params);
export const getBudget = (budgetId: string) => apiService.getBudget(budgetId);
export const getAccountBudgets = (accountId: string, params?: any) =>
	apiService.getAccountBudgets(accountId, params);
export const createBudget = (budgetData: any) =>
	apiService.createBudget(budgetData);
export const updateBudget = (budgetId: string, updates: any) =>
	apiService.updateBudget(budgetId, updates);
export const deleteBudget = (budgetId: string) =>
	apiService.deleteBudget(budgetId);
export const getBudgetStatus = (budgetId: string) =>
	apiService.getBudgetStatus(budgetId);

// Export category-related functions
export const getSystemCategories = () => apiService.getSystemCategories();
export const getAccountCategories = (accountId: string) =>
	apiService.getAccountCategories(accountId);

// Export currency-related functions
export const getSupportedCurrencies = () => apiService.getSupportedCurrencies();
export const getExchangeRates = (baseCurrency: string) =>
	apiService.getExchangeRates(baseCurrency);

// Export user profile functions
export const createUserProfile = (
	userData: Omit<User, 'firebaseUser'> & { firebaseUser: FirebaseUser }
) => apiService.createUserProfile(userData);

export const getUserProfile = (userId: string) =>
	apiService.getUserProfile(userId);

export const updateUserProfile = (userId: string, updates: Partial<User>) =>
	apiService.updateUserProfile(userId, updates);
