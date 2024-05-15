'use client';
import { FC, useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import Image from 'next/image';
import { QRMaker } from './QrMaker';
import { FaXmark } from 'react-icons/fa6';
import { FaArrowDown } from 'react-icons/fa';
import { getCurrentUser } from '@/lib/authentication';

interface Option {
	title: string;
	image: string;
	description: string;
	action: string;
}

interface Props {
	mainOptions: Option[];
}

const ButtonGraphicsCard: FC<Props> = ({ mainOptions }) => {
	const [isModalOpen, setIsModalOpen] = useState(false);
	const [selectedOption, setSelectedOption] = useState<Option | null>(null);

	const openModal = (option: Option) => {
		setIsModalOpen(true);
		setSelectedOption(option);
	};
	const closeModal = () => {
		setIsModalOpen(false);
		setSelectedOption(null);
	};

	const downloadQr = () => {
		getCurrentUser().then((user) => {
			const canvas = document.querySelector('canvas') as HTMLCanvasElement;
			const a = document.createElement('a');
			a.href = canvas.toDataURL('image/png');
			a.download = `${user?.userName}-qr.png`;
			a.click();
		});
	};

	return (
		<div className="grid md:grid-cols-1 lg:grid-cols-2 place-items-stretch gap-4 lg:gap-7 xl:gap-9 ">
			{mainOptions.map((option, index) => (
				<Card key={index} className="text-center py-3 rounded-xl shadow-md">
					<CardHeader className="space-y-2">
						<Image
							src={option.image}
							width={180}
							height={100}
							alt={option.title}
							className="object-cover mx-auto cursor-pointer"
						/>
					</CardHeader>
					<CardContent className="p-0 my-3 space-y-2">
						<CardTitle className="text-2xl font-semibold">{option.title}</CardTitle>
						<CardDescription className="w-3/4 mx-auto text-zinc-900 text-sm">
							{option.description}
						</CardDescription>
					</CardContent>
					<CardFooter className="flex justify-center">
						<button
							className="border border-zinc-900 py-2 px-5 rounded-3xl text-sm font-semibold hover:-translate-y-1 transition-all duration-100"
							onClick={() => {
								if (option.title === 'QR Code') {
									openModal(option);
								}
							}}
						>
							{option.action}
						</button>
					</CardFooter>
				</Card>
			))}
			{isModalOpen && selectedOption && (
				<dialog open className="fixed inset-0 z-50 overflow-y-auto rounded-lg ">
					<div className="flex items-center justify-center w-[300px] h-[320px] overflow-hidden">
						<div className="fixed inset-0 bg-black opacity-90"></div>
						<div className="bg-white rounded-lg p-8 z-50">
							<div className="flex justify-between px-8">
								<button className="text-black" onClick={downloadQr}>
									<FaArrowDown className="text-2xl" />
								</button>
								<button className="text-black" onClick={closeModal}>
									<FaXmark className="text-3xl" />
								</button>
							</div>
							<QRMaker />
						</div>
					</div>
				</dialog>
			)}
		</div>
	);
};

export default ButtonGraphicsCard;
