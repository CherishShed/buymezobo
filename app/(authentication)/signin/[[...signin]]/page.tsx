'use client';

import { Logo } from '@/components/common/Logo';
import { Button } from '@/components/ui/button';
import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { LoadingOutlined } from '@ant-design/icons';
import * as z from 'zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { login } from '@/actions/signin';
import { useAuth as getAuth } from '@/actions/use-auth';
import { PasswordInput } from '@/components/ui/passwordInput';
import { signIn } from 'next-auth/react';
import { FcGoogle } from 'react-icons/fc';
import { redirect } from 'next/navigation';
import { useUser } from '@/store/UserDataStore';
import { toast } from 'sonner';

const SignInSchema = z.object({
	email: z.string().email().min(1, { message: 'This field is required' }).trim(),
	password: z
		.string()
		.min(6, { message: 'Password must be a minimum of 6 characters' })
		.max(25, { message: 'Password must not be more than 25 characters' })
		.trim(),
});

export default function Page() {
	const [loading, setLoading] = useState(false);
	const { updateUser } = useUser();
	useEffect(() => {
		const fetchProfile = async () => {
			setLoading(true);
			const { user } = await getAuth();
			if (user) {
				redirect('/dashboard');
			}
			updateUser(user);
			setLoading(false);
		};
		fetchProfile();
	}, []);
	const form = useForm<z.infer<typeof SignInSchema>>({
		resolver: zodResolver(SignInSchema),
		defaultValues: { email: '', password: '' },
	});

	async function onSubmit(values: z.infer<typeof SignInSchema>) {
		const isValid = await form.trigger();
		if (isValid) {
			try {
				login(values).then(async () => {
					setLoading(true);
					const { user } = await getAuth();
					if (user) {
						updateUser(user);
						toast.success('Welcome back!');
					} else {
						toast.error('Login failed. Please try again.');
					}
				});
			} catch (error) {
				throw error;
			} finally {
				setLoading(false);
			}
		}
		form.reset();
	}

	return (
		<section className=" relative flex justify-center items-center w-full h-full">
			<nav className=" absolute top-3">
				<Logo className="hidden lg:block" />
			</nav>
			<Form {...form}>
				<form
					onSubmit={form.handleSubmit(onSubmit)}
					className=" flex flex-col gap-8 w-[60%] lg:w-[60%] xl:w-[40%] min-w-[22rem] px-2.5 md:px-4 lg:px-8 py-10 h-fit border-solid border-slate-300  
                    "
				>
					<div className="space-y-3">
						<p className="text-2xl font-bold -tracking-wide">Sign In</p>
						<p className="text-sm text-gray-500 tracking-wide">to continue to buymezobo</p>
					</div>
					<FormField
						control={form.control}
						name="email"
						render={({ field }) => (
							<FormItem>
								<FormLabel>
									Email address <span className=" text-red-500">*</span>
								</FormLabel>
								<FormControl>
									<Input className="w-full resize-none" {...field} placeholder="" />
								</FormControl>
								<FormMessage />
							</FormItem>
						)}
					/>

					<FormField
						control={form.control}
						name="password"
						render={({ field }) => (
							<FormItem>
								<FormLabel>
									Password <span className=" text-red-500">*</span>
								</FormLabel>
								<FormControl>
									<PasswordInput className="w-full resize-none" {...field} placeholder="" />
								</FormControl>
								<FormMessage />
							</FormItem>
						)}
					/>

					<div id="providers" className=" space-y-2">
						<Button className="text-sm md:text-base font-semibold self-center w-full " disabled={loading}>
							{loading ? <LoadingOutlined /> : 'Continue'}
						</Button>
						<Button
							type="button"
							onClick={() => {
								signIn('google');
							}}
							className=" flex gap-2 bg-inherit text-xs text-black border-[1px] border-solid border-slate-300 w-full hover:text-initial hover:bg-initial shadow-md rounded-sm hover:shadow-none font-bold"
						>
							<FcGoogle className=" text-lg" />
							Continue with Google
						</Button>
					</div>

					<p className=" text-sm font-light">
						Do not have an account?{' '}
						<a href="/signup" className="font-semibold text-purple-800 hover:underline">
							Create a new account
						</a>
					</p>
				</form>
			</Form>
		</section>
	);
}
