import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
	Wallet,
	CreditCard,
	PiggyBank,
	TrendingUp,
	TrendingDown,
} from 'lucide-react';
import { useCurrency } from '@/hooks/useCurrency';
import { DateUtils } from '@/utils/dateUtils';

// Types for account and transaction
interface Account {
	id: string;
	name: string;
	type: 'checking' | 'savings' | 'credit' | 'investment';
	balance: number;
	currency: string;
}

interface Transaction {
	id: string;
	date: Date;
	amount: number;
	type: 'income' | 'expense';
}

// Mock data (replace with actual data fetching)
const mockAccounts: Account[] = [
	{
		id: '1',
		name: 'Personal Checking',
		type: 'checking',
		balance: 5234.56,
		currency: 'USD',
	},
	{
		id: '2',
		name: 'Savings Account',
		type: 'savings',
		balance: 15000.0,
		currency: 'USD',
	},
	{
		id: '3',
		name: 'Credit Card',
		type: 'credit',
		balance: -1256.78,
		currency: 'USD',
	},
];

const mockTransactions: Transaction[] = [
	{
		id: 't1',
		date: new Date(),
		amount: 500.0,
		type: 'income',
	},
	{
		id: 't2',
		date: new Date(),
		amount: 250.5,
		type: 'expense',
	},
];

/**
 * Account Summary Component
 * Displays an overview of financial accounts and recent transactions
 */
export const AccountSummary: React.FC = () => {
	const { formatCurrency } = useCurrency();
	const [accounts, setAccounts] = useState<Account[]>([]);
	const [transactions, setTransactions] = useState<Transaction[]>([]);
	const [totalBalance, setTotalBalance] = useState(0);

	// Account type icons mapping
	const getAccountIcon = (type: Account['type']) => {
		const iconProps = { className: 'w-6 h-6 mr-2' };
		switch (type) {
			case 'checking':
				return <Wallet {...iconProps} />;
			case 'savings':
				return <PiggyBank {...iconProps} />;
			case 'credit':
				return <CreditCard {...iconProps} />;
			case 'investment':
				return <TrendingUp {...iconProps} />;
			default:
				return null;
		}
	};

	// Calculate total balance and fetch accounts
	useEffect(() => {
		// TODO: Replace with actual data fetching
		setAccounts(mockAccounts);
		setTransactions(mockTransactions);

		// Calculate total balance
		const total = mockAccounts.reduce(
			(sum, account) => sum + account.balance,
			0
		);
		setTotalBalance(total);
	}, []);

	// Render account summary card
	const renderAccountCard = (account: Account) => {
		const isNegative = account.balance < 0;

		return (
			<Card
				key={account.id}
				className='mb-4'>
				<CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
					<CardTitle className='text-sm font-medium flex items-center'>
						{getAccountIcon(account.type)}
						{account.name}
					</CardTitle>
					<Badge
						variant={isNegative ? 'destructive' : 'default'}
						className='text-xs'>
						{account.type.charAt(0).toUpperCase() + account.type.slice(1)}
					</Badge>
				</CardHeader>
				<CardContent>
					<div className='text-2xl font-bold'>
						{formatCurrency(account.balance, { currency: account.currency })}
					</div>
				</CardContent>
			</Card>
		);
	};

	// Render recent transactions
	const renderTransactions = () => {
		return transactions.map((transaction) => (
			<div
				key={transaction.id}
				className='flex justify-between items-center p-2 border-b last:border-b-0'>
				<div className='flex items-center'>
					{transaction.type === 'income' ? (
						<TrendingUp className='w-5 h-5 mr-2 text-green-500' />
					) : (
						<TrendingDown className='w-5 h-5 mr-2 text-red-500' />
					)}
					<span>{transaction.type === 'income' ? 'Income' : 'Expense'}</span>
				</div>
				<span
					className={`font-bold ${
						transaction.type === 'income' ? 'text-green-600' : 'text-red-600'
					}`}>
					{formatCurrency(transaction.amount)}
				</span>
			</div>
		));
	};

	return (
		<div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
			{/* Accounts Column */}
			<div className='md:col-span-2'>
				<h2 className='text-2xl font-bold mb-4'>My Accounts</h2>
				<div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4'>
					{accounts.map(renderAccountCard)}
				</div>
			</div>

			{/* Total Balance and Transactions Column */}
			<div>
				<Card>
					<CardHeader>
						<CardTitle>Total Balance</CardTitle>
					</CardHeader>
					<CardContent>
						<div className='text-3xl font-bold mb-4'>
							{formatCurrency(totalBalance)}
						</div>
						<Button
							variant='outline'
							className='w-full'>
							Transfer Funds
						</Button>
					</CardContent>
				</Card>

				<Card className='mt-4'>
					<CardHeader>
						<CardTitle>Recent Transactions</CardTitle>
					</CardHeader>
					<CardContent className='p-0'>{renderTransactions()}</CardContent>
				</Card>
			</div>
		</div>
	);
};

export default AccountSummary;
