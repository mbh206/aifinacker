// Common types used across the application

export interface User {
	id: string;
	email: string;
	displayName: string | null;
	createdAt: Date;
	updatedAt: Date;
}

export interface Account {
	id: string;
	userId: string;
	name: string;
	type: 'checking' | 'savings' | 'credit' | 'investment' | 'other';
	balance: number;
	currency: string;
	createdAt: Date;
	updatedAt: Date;
}

export interface Expense {
	id: string;
	accountId: string;
	userId: string;
	amount: number;
	category: string;
	description: string;
	date: Date;
	createdAt: Date;
	updatedAt: Date;
}

export interface Budget {
	id: string;
	userId: string;
	category: string;
	amount: number;
	startDate: Date;
	endDate: Date;
	createdAt: Date;
	updatedAt: Date;
}

export interface Notification {
	id: string;
	type: 'success' | 'error' | 'warning' | 'info';
	message: string;
	duration?: number;
}
