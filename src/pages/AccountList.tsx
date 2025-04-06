import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
	Wallet,
	CreditCard,
	PiggyBank,
	TrendingUp,
	Plus,
	MoreHorizontal,
} from 'lucide-react';
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useCurrency } from '@/hooks/useCurrency';
import { useNotification } from '@/contexts/NotificationContext';
import { apiService } from '@/services/api';
import { ConfirmDialog } from '@/components/common/ConfirmDialog';

// Account interface
interface Account {
	id: string;
	name: string;
	type: 'checking' | 'savings' | 'credit' | 'investment';
	balance: number;
	currency: string;
}

export const AccountList: React.FC = () => {
	const { formatCurrency } = useCurrency();
	const { addNotification } = useNotification();

	const [accounts, setAccounts] = useState<Account[]>([]);
	const [isLoading, setIsLoading] = useState(true);
	const [deleteAccountId, setDeleteAccountId] = useState<string | null>(null);

	// Fetch accounts on component mount
	useEffect(() => {
		const fetchAccounts = async () => {
			try {
				setIsLoading(true);
				const fetchedAccounts = await apiService.getAccounts();
				setAccounts(fetchedAccounts);
			} catch (error) {
				addNotification('Failed to load accounts', 'error');
			} finally {
				setIsLoading(false);
			}
		};

		fetchAccounts();
	}, [addNotification]);

	// Get account type icon
	const getAccountIcon = (type: Account['type']) => {
		const iconProps = { className: 'w-6 h-6 mr-2 text-muted-foreground' };
		switch (type) {
			case 'checking':
				return <Wallet {...iconProps} />;
			case 'savings':
				return <PiggyBank {...iconProps} />;
			case 'credit':
				return <CreditCard {...iconProps} />;
			case 'investment':
				return <TrendingUp {...iconProps} />;
		}
	};

	// Handle account deletion
	const handleDeleteAccount = async () => {
		if (!deleteAccountId) return;

		try {
			await apiService.deleteAccount(deleteAccountId);
			setAccounts((prev) =>
				prev.filter((account) => account.id !== deleteAccountId)
			);
			addNotification('Account deleted successfully', 'success');
		} catch (error) {
			addNotification('Failed to delete account', 'error');
		} finally {
			setDeleteAccountId(null);
		}
	};

	// Render account card
	const renderAccountCard = (account: Account) => {
		const isNegative = account.balance < 0;

		return (
			<Card
				key={account.id}
				className='hover:shadow-lg transition-shadow'>
				<CardHeader className='flex flex-row items-center justify-between'>
					<div className='flex items-center'>
						{getAccountIcon(account.type)}
						<span className='font-medium'>{account.name}</span>
					</div>
					<DropdownMenu>
						<DropdownMenuTrigger asChild>
							<Button
								variant='ghost'
								size='icon'>
								<MoreHorizontal className='h-4 w-4' />
							</Button>
						</DropdownMenuTrigger>
						<DropdownMenuContent>
							<DropdownMenuItem onSelect={() => {}}>
								Edit Account
							</DropdownMenuItem>
							<DropdownMenuItem
								className='text-red-600 focus:bg-red-50'
								onSelect={() => setDeleteAccountId(account.id)}>
								Delete Account
							</DropdownMenuItem>
						</DropdownMenuContent>
					</DropdownMenu>
				</CardHeader>
				<CardContent>
					<div className='text-2xl font-bold'>
						<span className={isNegative ? 'text-red-600' : ''}>
							{formatCurrency(account.balance, { currency: account.currency })}
						</span>
					</div>
					<div className='text-sm text-muted-foreground capitalize'>
						{account.type} Account
					</div>
				</CardContent>
			</Card>
		);
	};

	return (
		<div className='container mx-auto p-4'>
			<div className='flex justify-between items-center mb-6'>
				<h1 className='text-3xl font-bold'>My Accounts</h1>
				<Button>
					<Plus className='mr-2 h-4 w-4' /> Add Account
				</Button>
			</div>

			{isLoading ? (
				<div className='text-center'>Loading accounts...</div>
			) : accounts.length > 0 ? (
				<div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
					{accounts.map(renderAccountCard)}
				</div>
			) : (
				<div className='text-center text-muted-foreground'>
					No accounts found. Add an account to get started.
				</div>
			)}

			{/* Confirmation Dialog for Account Deletion */}
			<ConfirmDialog
				isOpen={!!deleteAccountId}
				onClose={() => setDeleteAccountId(null)}
				onConfirm={handleDeleteAccount}
				title='Delete Account'
				message='Are you sure you want to delete this account? This action cannot be undone.'
				confirmText='Delete'
				variant='destructive'
			/>
		</div>
	);
};
