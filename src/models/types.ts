// src/models/types.ts
import { User as FirebaseUser } from 'firebase/auth';

// User Model
export interface User {
	firebaseUser: FirebaseUser;
	preferences: {
		darkMode: boolean;
		language: string;
		currencyDisplay: string;
		notificationSettings: NotificationSettings;
	};
	createdAt: Date;
	updatedAt: Date;
}

export interface NotificationSettings {
	email: boolean;
	push: boolean;
	budgetAlerts: boolean;
	expenseReminders: boolean;
}

// Account (Organization/Team/Family)
export interface Account {
	id: string;
	name: string;
	type: 'personal' | 'family' | 'team' | 'business';
	description?: string;
	createdAt: Date;
	updatedAt: Date;
	ownerId: string;
	baseCurrency: string;
	members: AccountMember[];
	settings: {
		defaultCategories: ExpenseCategory[];
		fiscalYearStart: number; // 1-12 for month
		weekStart: number; // 0-6 for day of week (0 = Sunday)
		expenseApprovalRequired: boolean;
	};
}

export interface AccountMember {
	userId: string;
	role: 'admin' | 'member' | 'viewer';
	joinedAt: Date;
	invitedBy: string;
}

// Expense Model
export interface Expense {
	id: string;
	accountId: string;
	amount: number;
	originalAmount?: number; // For expenses in non-base currency
	originalCurrency?: string;
	exchangeRate?: number;
	category: string;
	subcategory?: string;
	date: Date;
	description: string;
	notes?: string;
	tags?: string[];
	isRecurring: boolean;
	recurringId?: string;
	receiptUrls?: string[];
	createdBy: string;
	createdAt: Date;
	updatedAt: Date;
	status: 'pending' | 'approved' | 'rejected';
	paymentMethod?: string;
	location?: {
		name?: string;
		latitude?: number;
		longitude?: number;
	};
}

// Budget Model
export interface Budget {
	id: string;
	accountId: string;
	name: string;
	amount: number;
	currency: string;
	period: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly' | 'custom';
	startDate: Date;
	endDate?: Date;
	categories: string[]; // Array of category IDs this budget applies to
	createdBy: string;
	createdAt: Date;
	updatedAt: Date;
	rollover: boolean; // Whether unspent budget rolls over to next period
	notes?: string;
}

// Category Model
export interface ExpenseCategory {
	id: string;
	name: string;
	icon?: string;
	color?: string;
	parentId?: string; // For subcategories
	isSystem: boolean; // True for default categories, false for user-created ones
	accountId?: string; // Null for system categories, set for account-specific ones
}

// Currency Exchange Rate
export interface ExchangeRate {
	baseCurrency: string;
	targetCurrency: string;
	rate: number;
	date: Date;
}

// AI Insight
export interface Insight {
	id: string;
	accountId: string;
	type: 'spending_pattern' | 'anomaly' | 'recommendation' | 'forecast';
	title: string;
	description: string;
	data: any; // Flexible data structure based on insight type
	createdAt: Date;
	priority: 'low' | 'medium' | 'high';
	status: 'new' | 'viewed' | 'dismissed';
	relatedCategories?: string[];
	actionable: boolean;
	action?: {
		type: string;
		description: string;
		completed: boolean;
	};
}

// Recurring Expense Template
export interface RecurringExpense {
	id: string;
	accountId: string;
	amount: number;
	currency: string;
	category: string;
	subcategory?: string;
	description: string;
	frequency: 'daily' | 'weekly' | 'monthly' | 'yearly';
	interval: number; // e.g., every 2 weeks
	startDate: Date;
	endDate?: Date;
	lastGenerated?: Date;
	nextDue?: Date;
	createdBy: string;
	active: boolean;
}

// Transaction for transfers between accounts or reconciliation
export interface Transaction {
	id: string;
	fromAccountId?: string;
	toAccountId?: string;
	amount: number;
	currency: string;
	exchangeRate?: number;
	date: Date;
	description: string;
	type: 'transfer' | 'income' | 'reconciliation';
	status: 'pending' | 'completed' | 'failed';
	createdBy: string;
	createdAt: Date;
}
