import React, { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@/components/ui/select';
import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from '@/components/ui/form';
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { useCurrency } from '@/hooks/useCurrency';

// Expense categories
const EXPENSE_CATEGORIES = [
	'Food',
	'Transportation',
	'Housing',
	'Utilities',
	'Entertainment',
	'Shopping',
	'Healthcare',
	'Personal',
	'Miscellaneous',
] as const;

// Zod validation schema
const quickExpenseSchema = z.object({
	amount: z.number().positive('Amount must be positive'),
	category: z.enum(EXPENSE_CATEGORIES),
	date: z.date(),
	description: z.string().optional(),
});

// Type for form inputs
type QuickExpenseInputs = z.infer<typeof quickExpenseSchema>;

/**
 * QuickExpenseForm Component
 * Provides a fast, lightweight way to log expenses
 */
export const QuickExpenseForm: React.FC = () => {
	const { formatCurrency } = useCurrency();
	const [isSubmitting, setIsSubmitting] = useState(false);

	// Initialize form with react-hook-form and zod
	const form = useForm<QuickExpenseInputs>({
		resolver: zodResolver(quickExpenseSchema),
		defaultValues: {
			amount: undefined,
			category: 'Miscellaneous',
			date: new Date(),
			description: '',
		},
	});

	// Handle form submission
	const onSubmit = async (data: QuickExpenseInputs) => {
		setIsSubmitting(true);
		try {
			// TODO: Implement actual expense saving logic
			// This could be a call to a Firebase service or API
			await new Promise((resolve) => setTimeout(resolve, 500)); // Simulated async operation

			console.log('Expense logged:', data);

			// Reset form after successful submission
			form.reset();
		} catch (error) {
			console.error('Failed to log expense:', error);
		} finally {
			setIsSubmitting(false);
		}
	};

	return (
		<div className='w-full max-w-md p-4 bg-white rounded-lg shadow-md'>
			<h2 className='text-xl font-bold mb-4'>Quick Expense Entry</h2>
			<Form {...form}>
				<form
					onSubmit={form.handleSubmit(onSubmit)}
					className='space-y-4'>
					{/* Amount Input */}
					<FormField
						control={form.control}
						name='amount'
						render={({ field }) => (
							<FormItem>
								<FormLabel>Amount</FormLabel>
								<FormControl>
									<Input
										type='number'
										step='0.01'
										placeholder='Enter expense amount'
										{...field}
										onChange={(e) => field.onChange(parseFloat(e.target.value))}
									/>
								</FormControl>
								<FormMessage />
							</FormItem>
						)}
					/>

					{/* Category Select */}
					<FormField
						control={form.control}
						name='category'
						render={({ field }) => (
							<FormItem>
								<FormLabel>Category</FormLabel>
								<Select
									onValueChange={field.onChange}
									defaultValue={field.value}>
									<FormControl>
										<SelectTrigger>
											<SelectValue placeholder='Select a category' />
										</SelectTrigger>
									</FormControl>
									<SelectContent>
										{EXPENSE_CATEGORIES.map((category) => (
											<SelectItem
												key={category}
												value={category}>
												{category}
											</SelectItem>
										))}
									</SelectContent>
								</Select>
								<FormMessage />
							</FormItem>
						)}
					/>

					{/* Date Picker */}
					<FormField
						control={form.control}
						name='date'
						render={({ field }) => (
							<FormItem className='flex flex-col'>
								<FormLabel>Date</FormLabel>
								<Popover>
									<PopoverTrigger asChild>
										<FormControl>
											<Button
												variant='outline'
												className={cn(
													'w-full pl-3 text-left font-normal',
													!field.value && 'text-muted-foreground'
												)}>
												{field.value ? (
													format(field.value, 'PPP')
												) : (
													<span>Pick a date</span>
												)}
												<CalendarIcon className='ml-auto h-4 w-4 opacity-50' />
											</Button>
										</FormControl>
									</PopoverTrigger>
									<PopoverContent
										className='w-auto p-0'
										align='start'>
										<Calendar
											mode='single'
											selected={field.value}
											onSelect={field.onChange}
											disabled={(date) =>
												date > new Date() || date < new Date('1900-01-01')
											}
											initialFocus
										/>
									</PopoverContent>
								</Popover>
								<FormMessage />
							</FormItem>
						)}
					/>

					{/* Optional Description */}
					<FormField
						control={form.control}
						name='description'
						render={({ field }) => (
							<FormItem>
								<FormLabel>Description (Optional)</FormLabel>
								<FormControl>
									<Input
										placeholder='Add a note about this expense'
										{...field}
									/>
								</FormControl>
								<FormMessage />
							</FormItem>
						)}
					/>

					{/* Submit Button */}
					<Button
						type='submit'
						className='w-full'
						disabled={isSubmitting}>
						{isSubmitting ? 'Logging...' : 'Log Expense'}
					</Button>
				</form>
			</Form>
		</div>
	);
};
