import { useInterface } from '@/store/InterfaceStore';
import { zodResolver } from '@hookform/resolvers/zod';
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Dialog, DialogContent, DialogDescription } from '@/components/ui/dialog';
import { Button } from '../ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Textarea } from '../ui/textarea';
import { HeaderImageUpload } from '../tools/HeaderUploadButton';
import { Input } from '../ui/input';
import { toast } from 'sonner';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import queryKeys from '@/query-key-factory';

export default function MakeImagePostModal() {
	const { isOpen, data, onClose, type } = useInterface();
	const open = isOpen && type == 'makeImagePostModal';
	const [loading, setLoading] = useState(false);
	const { creator } = data;
	const [imageUrl, setImageUrl] = useState<string | null>(null);
	const queryClient = useQueryClient();

	const formSchema = z.object({
		title: z.string(),
		caption: z.string(),
	});

	const form = useForm<z.infer<typeof formSchema>>({
		resolver: zodResolver(formSchema),
	});

	const postImageMutation = useMutation({
		mutationFn: async (data: { title: string; caption: string; imageUrl: string | null }) => {
			const response = await fetch('/api/posts', { body: JSON.stringify(data), method: 'POST' });
			if (response.status > 299) throw new Error(response.statusText);
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: queryKeys.post.all });
			form.reset();
			onClose();
			toast.success('Post was successfully uploaded');
		},
		onError: (error) => {
			toast.error('Failed to upload post');
			throw error;
		},
	});

	const updateImage = (image: string) => {
		setImageUrl(image);
	};

	async function onSubmit(values: z.infer<typeof formSchema>) {
		const data = { imageUrl, ...values };
		postImageMutation.mutate(data);
	}

	return (
		<Dialog open={open} onOpenChange={onClose}>
			<DialogContent>
				<DialogDescription>
					<p>Edit {creator?.userName} page</p>
				</DialogDescription>
				<div className="flex ">
					<HeaderImageUpload
						setLoading={setLoading}
						value={creator?.headerImageUrl!}
						onChange={updateImage}
						endpoint="Image"
					/>
				</div>
				<Form {...form}>
					<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-3">
						<FormField
							control={form.control}
							name="title"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Title</FormLabel>
									<FormControl>
										<Input {...field} />
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>

						<FormField
							control={form.control}
							name="caption"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Caption</FormLabel>
									<FormControl>
										<Textarea className="resize-none" {...field} />
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>

						<Button disabled={loading || postImageMutation.isPending} type="submit">
							Upload Post
						</Button>
					</form>
				</Form>
			</DialogContent>
		</Dialog>
	);
}