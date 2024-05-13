import { useInterface } from '@/store/InterfaceStore';
import React, { useEffect, useState } from 'react';

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Bank } from '@/types/bank';
import axios from 'axios';
import { CONFIG } from '@/utility/config';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Button } from '../ui/button';
import { Input } from '../ui/input';

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import Loader from '../common/Loader';
export default function PayoutInfoModal() {
	const { type, isOpen, onClose, data } = useInterface();
	const open = isOpen && type == 'payoutInfoModal';
	const [loading, setLoading] = useState(false);
	const [readyToLoadBanks, setReadyToLoadBanks] = useState(false);

	const [banks, setBanks] = useState<Bank[]>([]);

	useEffect(() => {
		const fetchBanks = async () => {
			try {
				setLoading(true);
				const response = await axios.get('https://api.paystack.co/bank', {
					headers: {
						Authorization: `Bearer ${CONFIG.paystack_key}`,
					},
				});
				setBanks(response.data.data);
				console.log(response.data.data);
			} catch (error) {
				console.error('Error fetching banks:', error);
			} finally {
				setLoading(false);
			}
		};
		if (open == true || readyToLoadBanks == true) {
			fetchBanks();
		}
	}, [open, readyToLoadBanks]);

	const formSchema = z.object({
		accountNumber: z.string(),
		banckCode: z.string(),
	});

	const form = useForm<z.infer<typeof formSchema>>({
		resolver: zodResolver(formSchema),
		defaultValues: {
			banckCode: '',
		},
	});

	const handleBankSelect = (bank: any) => {
		form.setValue('banckCode', bank);
	};

	async function onSubmit(values: z.infer<typeof formSchema>) {
		const data = {
			accountNumber: values.accountNumber,
			bankCode: values.banckCode,
			bankAccountName: '',
		};

		try {
			setLoading(true);
			const response = await axios.get(
				`https://api.paystack.co/bank/resolve?account_number=${values.accountNumber}&bank_code=${values.banckCode}`,
				{
					headers: {
						Authorization: `Bearer ${CONFIG.paystack_key}`,
					},
				},
			);

			const responseData = response.data;

			if (!responseData.status) {
				throw new Error('Failed to resolve bank info');
			}

			data.bankAccountName = responseData.data.account_name;

			console.table(data);

			console.log('Bank account resolved successfully.');

			try {
				const postResponse = await axios.post('/api/profile/payoutInfo', data);
				console.log('POST request sent to /api/auth/aftersignup:', postResponse.data);
				if (postResponse.status === 200) {
					onClose();
				}
			} catch (error) {
				console.error('Error sending POST request to /api/auth/aftersignup:', error);
			}
		} catch (err) {
			console.error('Error resolving bank account:', err);
		} finally {
			setLoading(false);
		}
	}

	return (
		<Dialog open={open} onOpenChange={onClose}>
			<DialogContent className="space-y-4">
				<DialogHeader>
					<DialogTitle>Payout info for {data.creator?.userName}?</DialogTitle>
					<DialogDescription>
						To enable payouts, you'll need to provide your bank details to our payment partner.
					</DialogDescription>
				</DialogHeader>
				<Form {...form}>
					<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-3">
						<FormField
							control={form.control}
							name="accountNumber"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Account number</FormLabel>
									<FormControl>
										<Input className="" placeholder="Enter your account number" {...field} />
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>

						<FormField
							control={form.control}
							name="banckCode"
							render={({ field }) => (
								<FormItem className="flex flex-col">
									<FormLabel>Bank Account</FormLabel>
									<Select onValueChange={field.onChange} defaultValue={field.value}>
										<SelectTrigger onClick={() => setReadyToLoadBanks(true)} className="w-[full]">
											<SelectValue placeholder="Select Bank" />
										</SelectTrigger>
										<SelectContent>
											{loading ? (
												<Loader />
											) : (
												banks.map((bank) => (
													<SelectItem
														key={bank.code}
														value={bank.code}
														onSelect={handleBankSelect}
													>
														{bank.name}
													</SelectItem>
												))
											)}
										</SelectContent>
									</Select>

									<FormDescription>choose your bank for the payout</FormDescription>
									<FormMessage />
								</FormItem>
							)}
						/>

						<Button disabled={loading} type="submit">
							{data.creator?.transferRecipientCode ? 'Update Bank Info' : 'Save Bank Info'}
						</Button>
					</form>
				</Form>
			</DialogContent>
		</Dialog>
	);
}