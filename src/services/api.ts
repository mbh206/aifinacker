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

/**
 * API Service Class
 * Provides centralized methods for external API interactions
 */
class ApiService {
	private axiosInstance: AxiosInstance;

	constructor() {
		// Create axios instance with base configuration
		this.axiosInstance = axios.create({
			baseURL: process.env.NEXT_PUBLIC_API_BASE_URL || '/api',
			timeout: 10000, // 10 seconds
			headers: {
				'Content-Type': 'application/json',
			},
		});

		// Interceptor to add authentication token
		this.axiosInstance.interceptors.request.use(
			async (config) => {
				const user =
					this.axiosInstance.defaults.headers.common['Authorization'];

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
		this.axiosInstance.interceptors.response.use(
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
			const response = await this.axiosInstance.get('/expenses', { params });
			return response.data;
		} catch (error) {
			throw error;
		}
	}

	async createExpense(expenseData: any) {
		try {
			const response = await this.axiosInstance.post('/expenses', expenseData);
			return response.data;
		} catch (error) {
			throw error;
		}
	}

	// Budget-related API methods
	async getBudgets(params?: PaginationParams) {
		try {
			const response = await this.axiosInstance.get('/budgets', { params });
			return response.data;
		} catch (error) {
			throw error;
		}
	}

	async createBudget(budgetData: any) {
		try {
			const response = await this.axiosInstance.post('/budgets', budgetData);
			return response.data;
		} catch (error) {
			throw error;
		}
	}

	// Financial Insights API methods
	async getFinancialInsights(params?: FinancialInsightsParams) {
		try {
			const response = await this.axiosInstance.get('/insights', { params });
			return response.data;
		} catch (error) {
			throw error;
		}
	}

	// Account-related API methods
	async getAccounts(params?: PaginationParams) {
		try {
			const response = await this.axiosInstance.get('/accounts', { params });
			return response.data;
		} catch (error) {
			throw error;
		}
	}

	async createAccount(accountData: any) {
		try {
			const response = await this.axiosInstance.post('/accounts', accountData);
			return response.data;
		} catch (error) {
			throw error;
		}
	}

	// Category-related API methods
	async getCategories() {
		try {
			const response = await this.axiosInstance.get('/categories');
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
			const response = await this.axiosInstance.post(endpoint, formData, {
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
			const response = await this.axiosInstance.post(
				'/users/profile',
				userData
			);
			return response.data;
		} catch (error) {
			throw error;
		}
	}

	async getUserProfile(userId: string): Promise<User> {
		try {
			const response = await this.axiosInstance.get(`/users/profile/${userId}`);
			return response.data;
		} catch (error) {
			throw error;
		}
	}
}

// Export a singleton instance of ApiService
export const apiService = new ApiService();
