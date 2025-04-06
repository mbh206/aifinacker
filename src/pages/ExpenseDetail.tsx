import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
	Calendar,
	DollarSign,
	Tag,
	FileText,
	Edit,
	Trash2,
} from 'lucide-react';
import { useCurrency } from '@/hooks/useCurrency';
import { DateUtils } from '@/utils/dateUtils';
import { ConfirmDialog } from '@/components/common/ConfirmDialog';
import { useNotification } from '@/contexts/NotificationContext';
import { apiService } from '@/services/api';

// Expense interface
interface Expense {
	id: string;
	amount: number;
	category: string;
	date: Date;
	description?: string;
	receiptUrl?: string;
}

export const ExpenseDetails: React.FC = () => {
	const { id } = useParams<{ id: string }>();
	const navigate = useNavigate();
	const { formatCurrency } = useCurrency();
	const { addNotification } = useNotification();

	const [expense, setExpense] = useState<Expense | null>(null);
	const [isLoading, setIsLoading] = useState(true);
	const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

	// Fetch expense details
	useEffect(() => {
		const fetchExpenseDetails = async () => {
			try {
				setIsLoading(true);
				// TODO: Replace with actual API call to fetch expense details
				const fetchedExpense = await apiService.getExpenseById(id);
				setExpense(fetchedExpense);
			} catch (error) {
				addNotification('Failed to load expense details', 'error');
				navigate('/expenses');
			} finally {
				setIsLoading(false);
			}
		};

		if (id) {
			fetchExpenseDetails();
		}
	}, [id, navigate, addNotification]);

	// Handle expense deletion
	const handleDeleteExpense = async () => {
		try {
			await apiService.deleteExpense(id);
			addNotification('Expense deleted successfully', 'success');
			navigate('/expenses');
		} catch (error) {
			addNotification('Failed to delete expense', 'error');
		}
	};

	// Handle editing expense
	const handleEditExpense = () => {
		navigate(`/expenses/edit/${id}`);
	};

	// Open receipt
	const openReceipt = () => {
		if (expense?.receiptUrl) {
			window.open(expense.receiptUrl, '_blank');
		}
	};

	if (isLoading) {
		return <div>Loading expense details...</div>;
	}

	if (!expense) {
		return <div>No expense found</div>;
	}

	return (
		<div className='container mx-auto p-4'>
			<Card>
				<CardHeader className='flex flex-row items-center justify-between'>
					<CardTitle>Expense Details</CardTitle>
					<div className='flex space-x-2'>
						<Button
							variant='outline'
							size='icon'
							onClick={handleEditExpense}>
							<Edit className='h-4 w-4' />
						</Button>
						<Button
							variant='destructive'
							size='icon'
							onClick={() => setIsDeleteDialogOpen(true)}>
							<Trash2 className='h-4 w-4' />
						</Button>
					</div>
				</CardHeader>
				<CardContent>
					<div className='grid md:grid-cols-2 gap-4'>
						{/* Amount */}
						<div className='flex items-center space-x-4'>
							<DollarSign className='h-6 w-6 text-muted-foreground' />
							<div>
								<p className='text-sm text-muted-foreground'>Amount</p>
								<p className='text-xl font-bold'>
									{formatCurrency(expense.amount)}
								</p>
							</div>
						</div>

						{/* Category */}
						<div className='flex items-center space-x-4'>
							<Tag className='h-6 w-6 text-muted-foreground' />
							<div>
								<p className='text-sm text-muted-foreground'>Category</p>
								<p className='text-lg'>{expense.category}</p>
							</div>
						</div>

						{/* Date */}
						<div className='flex items-center space-x-4'>
							<Calendar className='h-6 w-6 text-muted-foreground' />
							<div>
								<p className='text-sm text-muted-foreground'>Date</p>
								<p className='text-lg'>{DateUtils.formatDate(expense.date)}</p>
							</div>
						</div>

						{/* Description */}
						{expense.description && (
							<div className='flex items-center space-x-4'>
								<FileText className='h-6 w-6 text-muted-foreground' />
								<div>
									<p className='text-sm text-muted-foreground'>Description</p>
									<p className='text-lg'>{expense.description}</p>
								</div>
							</div>
						)}

						{/* Receipt */}
						{expense.receiptUrl && (
							<div className='col-span-full'>
								<Button
									variant='outline'
									onClick={openReceipt}>
									View Receipt
								</Button>
							</div>
						)}
					</div>
				</CardContent>
			</Card>

			{/* Confirmation Dialog for Deletion */}
			<ConfirmDialog
				isOpen={isDeleteDialogOpen}
				onClose={() => setIsDeleteDialogOpen(false)}
				onConfirm={handleDeleteExpense}
				title='Delete Expense'
				message='Are you sure you want to delete this expense?'
				confirmText='Delete'
				variant='destructive'
			/>
		</div>
	);
};
