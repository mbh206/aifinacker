import React from 'react';
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogDescription,
	DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

// Interface for ConfirmDialog props
interface ConfirmDialogProps {
	isOpen: boolean;
	onClose: () => void;
	onConfirm: () => void;
	title?: string;
	message?: string;
	confirmText?: string;
	cancelText?: string;
	variant?: 'default' | 'destructive' | 'outline';
}

/**
 * Reusable Confirmation Dialog Component
 * Provides a standardized way to show confirmation prompts across the application
 */
export const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
	isOpen,
	onClose,
	onConfirm,
	title = 'Confirm Action',
	message = 'Are you sure you want to proceed?',
	confirmText = 'Confirm',
	cancelText = 'Cancel',
	variant = 'default',
}) => {
	/**
	 * Handle confirmation action
	 * Calls onConfirm and closes the dialog
	 */
	const handleConfirm = () => {
		onConfirm();
		onClose();
	};

	return (
		<Dialog
			open={isOpen}
			onOpenChange={onClose}>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>{title}</DialogTitle>
					<DialogDescription>{message}</DialogDescription>
				</DialogHeader>

				<DialogFooter>
					<Button
						variant='outline'
						onClick={onClose}>
						{cancelText}
					</Button>
					<Button
						variant={variant}
						onClick={handleConfirm}>
						{confirmText}
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
};

// Example usage hook to manage dialog state
export const useConfirmDialog = () => {
	const [isOpen, setIsOpen] = React.useState(false);
	const [confirmAction, setConfirmAction] = React.useState<(() => void) | null>(
		null
	);

	const openDialog = (action: () => void) => {
		setConfirmAction(() => action);
		setIsOpen(true);
	};

	const closeDialog = () => {
		setIsOpen(false);
	};

	const handleConfirm = () => {
		if (confirmAction) {
			confirmAction();
		}
		closeDialog();
	};

	return {
		ConfirmDialog: (props: Partial<ConfirmDialogProps> = {}) => (
			<ConfirmDialog
				isOpen={isOpen}
				onClose={closeDialog}
				onConfirm={handleConfirm}
				{...props}
			/>
		),
		openDialog,
		closeDialog,
	};
};
