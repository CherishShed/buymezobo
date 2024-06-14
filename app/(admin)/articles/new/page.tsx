'use client';
import Editor from '@/components/Editor/Editor';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Block } from '@blocknote/core';
import React, { useState } from 'react';
import axios from 'axios';
import FileUploader from '@/lib/fileUploader';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { HiX } from 'react-icons/hi';

export default function Page() {
	const [title, setTitle] = useState('Untitled');
	const [blocks, setBlocks] = useState<Block[]>([]);
	const [headerImage, setHeaderImage] = useState<string | null>(null);
	const [loading, setLoading] = useState(false);

	const route = useRouter();

	const onChangeBlocks = (value: any) => {
		setBlocks(value);
	};

	const onChangeTitle = (e: any) => {
		setTitle(e.target.value);
	};

	const saveArticle = async (type: any) => {
		try {
			const respose = await axios.post('/api/articles/create', {
				title: title,
				content: blocks,
				headerImage: headerImage,
				type,
			});
		} catch (e) {}
	};

	const onSaveDraft = async () => {
		await saveArticle('DRAFT');
		toast.success('Article added to draft');
		route.push('/articles');
	};
	const onPublishArticle = async () => {
		await saveArticle('PUBLISHED');
		toast.success('Article Published successfully');
		route.push('/articles');
	};

	const updateImage = (image: string) => {
		setHeaderImage(image);
		setLoading(false);
	};

	const removeImage = () => {
		setHeaderImage(null);
	};

	return (
		<main className="p-5">
			<section className="w-5/6 lg:w-2/3 mx-auto space-y-5">
				<section className="space-y-3">
					<div className="flex justify-end items-center gap-2">
						<FileUploader simple={true} storageRefDir="images" onUploadSuccess={updateImage} />
						<Button disabled={loading} onClick={onSaveDraft} variant={'outline'}>
							Save draft
						</Button>
						<Button disabled={loading} onClick={onPublishArticle} variant={'default'}>
							Publish Article
						</Button>
					</div>
					<div className="flex items-center justify-center">
						<Input className="ring-none focus:ring-none w-fit" value={title} onChange={onChangeTitle} />
					</div>
					{headerImage ? (
						<div
							className="relative flex gap-3 h-40 lg:h-56 bg-center bg-cover bg-no-repeat"
							style={{ backgroundImage: `url(${headerImage})` }}
						>
							<button
								className="absolute w-10 h-10 top-2 right-2 bg-white rounded-full p-1 flex items-center justify-center"
								onClick={removeImage}
							>
								<HiX className="w-6 h-6 text-black" />
							</button>
						</div>
					) : null}
				</section>
				<div className="py-2 rounded-lg bg-white min-h-96">
					<Editor readOnly={false} onEditorChange={onChangeBlocks} />
				</div>
			</section>
		</main>
	);
}