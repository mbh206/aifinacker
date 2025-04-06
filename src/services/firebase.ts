import { initializeApp } from 'firebase/app';
import {
	getAuth,
	createUserWithEmailAndPassword,
	signInWithEmailAndPassword,
	signOut,
	onAuthStateChanged,
	User,
	GoogleAuthProvider,
	signInWithPopup,
} from 'firebase/auth';
import {
	getFirestore,
	collection,
	addDoc,
	query,
	where,
	getDocs,
	updateDoc,
	deleteDoc,
	doc,
	serverTimestamp,
	DocumentReference,
	QuerySnapshot,
} from 'firebase/firestore';

// Firebase configuration interface
interface FirebaseConfig {
	apiKey: string;
	authDomain: string;
	projectId: string;
	storageBucket: string;
	messagingSenderId: string;
	appId: string;
}

// Expense interface
export interface Expense {
	id?: string;
	amount: number;
	category: string;
	date: Date;
	description?: string;
	userId: string;
}

// Budget interface
export interface Budget {
	id?: string;
	userId: string;
	category: string;
	amount: number;
	startDate: Date;
	endDate: Date;
}

// Account interface
export interface Account {
	id?: string;
	userId: string;
	name: string;
	type: 'checking' | 'savings' | 'credit' | 'investment';
	balance: number;
	currency: string;
}

/**
 * Firebase Services Class
 * Provides centralized methods for Firebase operations
 */
class FirebaseService {
	private app;
	private auth;
	private db;

	constructor(config: FirebaseConfig) {
		// Initialize Firebase
		this.app = initializeApp(config);
		this.auth = getAuth(this.app);
		this.db = getFirestore(this.app);
	}

	// Authentication Methods
	async signUp(email: string, password: string) {
		try {
			const userCredential = await createUserWithEmailAndPassword(
				this.auth,
				email,
				password
			);
			return userCredential.user;
		} catch (error) {
			console.error('Sign up error:', error);
			throw error;
		}
	}

	async signIn(email: string, password: string) {
		try {
			const userCredential = await signInWithEmailAndPassword(
				this.auth,
				email,
				password
			);
			return userCredential.user;
		} catch (error) {
			console.error('Sign in error:', error);
			throw error;
		}
	}

	async signInWithGoogle() {
		const provider = new GoogleAuthProvider();
		try {
			const result = await signInWithPopup(this.auth, provider);
			return result.user;
		} catch (error) {
			console.error('Google sign in error:', error);
			throw error;
		}
	}

	async signOutUser() {
		try {
			await signOut(this.auth);
		} catch (error) {
			console.error('Sign out error:', error);
			throw error;
		}
	}

	// User Authentication State Observer
	onAuthStateChange(callback: (user: User | null) => void) {
		return onAuthStateChanged(this.auth, callback);
	}

	// Expense CRUD Operations
	async addExpense(expense: Expense) {
		try {
			const expensesRef = collection(this.db, 'expenses');
			const docRef = await addDoc(expensesRef, {
				...expense,
				createdAt: serverTimestamp(),
			});
			return { ...expense, id: docRef.id };
		} catch (error) {
			console.error('Add expense error:', error);
			throw error;
		}
	}

	async getExpensesByUser(userId: string): Promise<Expense[]> {
		try {
			const q = query(
				collection(this.db, 'expenses'),
				where('userId', '==', userId)
			);
			const querySnapshot = await getDocs(q);

			return querySnapshot.docs.map(
				(doc) =>
					({
						id: doc.id,
						...doc.data(),
					} as Expense)
			);
		} catch (error) {
			console.error('Get expenses error:', error);
			throw error;
		}
	}

	async updateExpense(expense: Expense) {
		if (!expense.id) throw new Error('Expense ID is required');

		try {
			const expenseRef = doc(this.db, 'expenses', expense.id);
			await updateDoc(expenseRef, { ...expense });
			return expense;
		} catch (error) {
			console.error('Update expense error:', error);
			throw error;
		}
	}

	async deleteExpense(expenseId: string) {
		try {
			const expenseRef = doc(this.db, 'expenses', expenseId);
			await deleteDoc(expenseRef);
		} catch (error) {
			console.error('Delete expense error:', error);
			throw error;
		}
	}

	// Budget CRUD Operations
	async addBudget(budget: Budget) {
		try {
			const budgetsRef = collection(this.db, 'budgets');
			const docRef = await addDoc(budgetsRef, {
				...budget,
				createdAt: serverTimestamp(),
			});
			return { ...budget, id: docRef.id };
		} catch (error) {
			console.error('Add budget error:', error);
			throw error;
		}
	}

	async getBudgetsByUser(userId: string): Promise<Budget[]> {
		try {
			const q = query(
				collection(this.db, 'budgets'),
				where('userId', '==', userId)
			);
			const querySnapshot = await getDocs(q);

			return querySnapshot.docs.map(
				(doc) =>
					({
						id: doc.id,
						...doc.data(),
					} as Budget)
			);
		} catch (error) {
			console.error('Get budgets error:', error);
			throw error;
		}
	}

	// Accounts CRUD Operations
	async addAccount(account: Account) {
		try {
			const accountsRef = collection(this.db, 'accounts');
			const docRef = await addDoc(accountsRef, {
				...account,
				createdAt: serverTimestamp(),
			});
			return { ...account, id: docRef.id };
		} catch (error) {
			console.error('Add account error:', error);
			throw error;
		}
	}

	async getAccountsByUser(userId: string): Promise<Account[]> {
		try {
			const q = query(
				collection(this.db, 'accounts'),
				where('userId', '==', userId)
			);
			const querySnapshot = await getDocs(q);

			return querySnapshot.docs.map(
				(doc) =>
					({
						id: doc.id,
						...doc.data(),
					} as Account)
			);
		} catch (error) {
			console.error('Get accounts error:', error);
			throw error;
		}
	}
}

// Firebase configuration (replace with your actual config)
const firebaseConfig = {
	apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
	authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
	projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
	storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
	messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
	appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// Export a singleton instance of FirebaseService
export const firebaseService = new FirebaseService(firebaseConfig);
