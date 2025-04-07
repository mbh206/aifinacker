// src/hooks/useAccounts.ts
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../store';
import {
	fetchUserAccounts,
	fetchAccount,
	createNewAccount,
	updateExistingAccount,
	inviteAccountMember,
	removeMember,
	updateMemberRole,
	setCurrentAccount,
	clearCurrentAccount,
} from '../store/slices/accountsSlice';
import { addNotification } from '../store/slices/uiSlice';
import { Account, AccountMember } from '../models/types';

/**
 * Custom hook for accounts functionality
 * Provides methods for account management and access to account state
 */
export const useAccounts = () => {
	const dispatch = useAppDispatch();
	const navigate = useNavigate();

	// Select accounts state from the Redux store
	const { accounts, currentAccount, isLoading, error } = useAppSelector(
		(state) => state.accounts
	);

	const { user } = useAppSelector((state) => state.auth);

	// Load the user's accounts when the hook is first used
	useEffect(() => {
		if (user) {
			dispatch(fetchUserAccounts(user.id));
		}
	}, [dispatch, user]);

	// Create a new account
	const createAccount = async (accountData: Partial<Account>) => {
		try {
			const resultAction = await dispatch(createNewAccount(accountData));

			if (createNewAccount.fulfilled.match(resultAction)) {
				dispatch(
					addNotification({
						type: 'success',
						message: 'Account created successfully',
					})
				);
				navigate('/');
				return resultAction.payload;
			}
			return null;
		} catch (error) {
			dispatch(
				addNotification({
					type: 'error',
					message: 'Failed to create account',
				})
			);
			return null;
		}
	};

	// Get a specific account by ID
	const getAccount = async (accountId: string) => {
		try {
			const resultAction = await dispatch(fetchAccount(accountId));

			if (fetchAccount.fulfilled.match(resultAction)) {
				return resultAction.payload;
			}
			return null;
		} catch (error) {
			return null;
		}
	};

	// Update an existing account
	const updateAccount = async (
		accountId: string,
		updates: Partial<Account>
	) => {
		try {
			const resultAction = await dispatch(
				updateExistingAccount({ accountId, updates })
			);

			if (updateExistingAccount.fulfilled.match(resultAction)) {
				dispatch(
					addNotification({
						type: 'success',
						message: 'Account updated successfully',
					})
				);
				return resultAction.payload;
			}
			return null;
		} catch (error) {
			dispatch(
				addNotification({
					type: 'error',
					message: 'Failed to update account',
				})
			);
			return null;
		}
	};

	// Invite a member to an account
	const inviteMember = async (
		accountId: string,
		email: string,
		role: 'admin' | 'member' | 'viewer'
	) => {
		try {
			const resultAction = await dispatch(
				inviteAccountMember({ accountId, email, role })
			);

			if (inviteAccountMember.fulfilled.match(resultAction)) {
				dispatch(
					addNotification({
						type: 'success',
						message: `Invitation sent to ${email}`,
					})
				);
				return true;
			}
			return false;
		} catch (error) {
			dispatch(
				addNotification({
					type: 'error',
					message: 'Failed to send invitation',
				})
			);
			return false;
		}
	};

	// Remove a member from an account
	const removeMemberFromAccount = async (accountId: string, userId: string) => {
		try {
			const resultAction = await dispatch(removeMember({ accountId, userId }));

			if (removeMember.fulfilled.match(resultAction)) {
				dispatch(
					addNotification({
						type: 'success',
						message: 'Member removed successfully',
					})
				);
				return true;
			}
			return false;
		} catch (error) {
			dispatch(
				addNotification({
					type: 'error',
					message: 'Failed to remove member',
				})
			);
			return false;
		}
	};

	// Update a member's role
	const changeMemberRole = async (
		accountId: string,
		userId: string,
		role: 'admin' | 'member' | 'viewer'
	) => {
		try {
			const resultAction = await dispatch(
				updateMemberRole({ accountId, userId, role })
			);

			if (updateMemberRole.fulfilled.match(resultAction)) {
				dispatch(
					addNotification({
						type: 'success',
						message: 'Member role updated successfully',
					})
				);
				return true;
			}
			return false;
		} catch (error) {
			dispatch(
				addNotification({
					type: 'error',
					message: 'Failed to update member role',
				})
			);
			return false;
		}
	};

	// Switch to a different account
	const switchAccount = (accountId: string) => {
		const account = accounts.find((acc) => acc.id === accountId);

		if (account) {
			dispatch(setCurrentAccount(account));
			navigate('/');
			return true;
		}

		return false;
	};

	// Get all members of the current account
	const getCurrentAccountMembers = (): AccountMember[] => {
		return currentAccount?.members || [];
	};

	// Check if the user is an admin of the current account
	const isCurrentAccountAdmin = (): boolean => {
		if (!currentAccount || !user) return false;

		const currentUser = currentAccount.members.find(
			(member) => member.userId === user.id
		);

		return currentUser?.role === 'admin';
	};

	// Clear the current account
	const clearAccount = () => {
		dispatch(clearCurrentAccount());
	};

	return {
		accounts,
		currentAccount,
		isLoading,
		error,
		createAccount,
		getAccount,
		updateAccount,
		inviteMember,
		removeMemberFromAccount,
		changeMemberRole,
		switchAccount,
		getCurrentAccountMembers,
		isCurrentAccountAdmin,
		clearAccount,
	};
};

export default useAccounts;
