import React, { useState, useEffect } from 'react';
import {
	Card,
	CardContent,
	CardHeader,
	CardTitle,
	CardDescription,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
	User,
	Mail,
	Calendar,
	CreditCard,
	TrendingUp,
	DollarSign,
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useCurrency } from '@/hooks/useCurrency';
import { DateUtils } from '@/utils/dateUtils';
import { apiService } from '@/services/api';
import { useNotification } from '@/contexts/NotificationContext';

// Interfaces for additional profile data
interface FinancialSummary {
	totalExpenses: number;
	totalIncome: number;
	netSavings: number;
	accountCount: number;
}

interface RecentTransaction {
	id: string;
	date: Date;
	amount: number;
	type: 'expense' | 'income';
	category: string;
}

export const Profile: React.FC = () => {
	const { user } = useAuth();
	const { formatCurrency } = useCurrency();
	const { addNotification } = useNotification();

	// State for additional profile data
	const [financialSummary, setFinancialSummary] =
		useState<FinancialSummary | null>(null);
	const [recentTransactions, setRecentTransactions] = useState<
		RecentTransaction[]
	>([]);
	const [isLoading, setIsLoading] = useState(true);

	// Fetch profile data
	useEffect(() => {
		const fetchProfileData = async () => {
			try {
				setIsLoading(true);
				// Fetch financial summary
				const summary = await apiService.getFinancialSummary();
				setFinancialSummary(summary);

				// Fetch recent transactions
				const transactions = await apiService.getRecentTransactions(5);
				setRecentTransactions(transactions);
			} catch (error) {
				addNotification('Failed to load profile data', 'error');
			} finally {
				setIsLoading(false);
			}
		};

		if (user) {
			fetchProfileData();
		}
	}, [user, addNotification]);

	// Render user info card
	const renderUserInfoCard = () => (
		<Card>
			<CardHeader>
				<CardTitle className='flex items-center'>
					<User className='mr-2' /> Personal Information
				</CardTitle>
				<CardDescription>Your account details</CardDescription>
			</CardHeader>
			<CardContent className='space-y-4'>
				{user?.photoURL && (
					<div className='flex justify-center'>
						<img
							src={user.photoURL}
							alt='Profile'
							className='w-24 h-24 rounded-full object-cover'
						/>
					</div>
				)}
				<div className='grid grid-cols-2 gap-4'>
					<div className='flex items-center space-x-2'>
						<User className='text-muted-foreground' />
						<span>{user?.displayName || 'No Name'}</span>
					</div>
					<div className='flex items-center space-x-2'>
						<Mail className='text-muted-foreground' />
						<span>{user?.email}</span>
					</div>
					<div className='flex items-center space-x-2'>
						<Calendar className='text-muted-foreground' />
						<span>
							Joined:{' '}
							{user
								? DateUtils.formatDate(
										new Date(user.metadata.creationTime || '')
								  )
								: 'N/A'}
						</span>
					</div>
				</div>
			</CardContent>
		</Card>
	);

	// Render financial summary card
	const renderFinancialSummaryCard = () => (
		<Card>
			<CardHeader>
				<CardTitle className='flex items-center'>
					<DollarSign className='mr-2' /> Financial Overview
				</CardTitle>
				<CardDescription>Your financial snapshot</CardDescription>
			</CardHeader>
			<CardContent className='space-y-4'>
				{isLoading ? (
					<p>Loading financial data...</p>
				) : financialSummary ? (
					<div className='grid grid-cols-2 gap-4'>
						<div className='flex items-center space-x-2'>
							<TrendingUp className='text-green-500' />
							<div>
								<p className='text-sm text-muted-foreground'>Total Income</p>
								<p className='font-bold'>
									{formatCurrency(financialSummary.totalIncome)}
								</p>
							</div>
						</div>
						<div className='flex items-center space-x-2'>
							<CreditCard className='text-red-500' />
							<div>
								<p className='text-sm text-muted-foreground'>Total Expenses</p>
								<p className='font-bold'>
									{formatCurrency(financialSummary.totalExpenses)}
								</p>
							</div>
						</div>
						<div className='col-span-2 flex items-center space-x-2'>
							<DollarSign className='text-blue-500' />
							<div>
								<p className='text-sm text-muted-foreground'>Net Savings</p>
								<p className='font-bold text-lg'>
									{formatCurrency(financialSummary.netSavings)}
								</p>
							</div>
						</div>
					</div>
				) : (
					<p>No financial data available</p>
				)}
			</CardContent>
		</Card>
	);

	// Render recent transactions card
	const renderRecentTransactionsCard = () => (
		<Card>
			<CardHeader>
				<CardTitle className='flex items-center'>
					<CreditCard className='mr-2' /> Recent Transactions
				</CardTitle>
				<CardDescription>Your latest financial activities</CardDescription>
			</CardHeader>
			<CardContent>
				{isLoading ? (
					<p>Loading transactions...</p>
				) : recentTransactions.length > 0 ? (
					<div className='space-y-2'>
						{recentTransactions.map((transaction) => (
							<div
								key={transaction.id}
								className='flex justify-between items-center p-2 border-b last:border-b-0'>
								<div className='flex items-center space-x-2'>
									{transaction.type === 'expense' ? (
										<CreditCard className='text-red-500' />
									) : (
										<TrendingUp className='text-green-500' />
									)}
									<div>
										<p className='font-medium'>{transaction.category}</p>
										<p className='text-sm text-muted-foreground'>
											{DateUtils.formatDate(transaction.date)}
										</p>
									</div>
								</div>
								<span
									className={`font-bold ${
										transaction.type === 'expense'
											? 'text-red-600'
											: 'text-green-600'
									}`}>
									{formatCurrency(transaction.amount)}
								</span>
							</div>
						))}
					</div>
				) : (
					<p>No recent transactions</p>
				)}
			</CardContent>
		</Card>
	);

	return (
		<div className='container mx-auto p-4 space-y-6'>
			<h1 className='text-3xl font-bold'>My Profile</h1>

			<div className='grid md:grid-cols-3 gap-6'>
				<div className='md:col-span-1'>{renderUserInfoCard()}</div>
				<div className='md:col-span-2 space-y-6'>
					{renderFinancialSummaryCard()}
					{renderRecentTransactionsCard()}
				</div>
			</div>

			<div className='flex justify-end space-x-4'>
				<Button variant='outline'>Edit Profile</Button>
				<Button>View Full Report</Button>
			</div>
		</div>
	);
};
