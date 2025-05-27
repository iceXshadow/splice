/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { login, register } from "@/lib/actions/auth.action";
import { auth } from "@/lib/firebase/client";
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from "firebase/auth";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import FormField from "./form-field";

const authFormSchema = (type: FormType) => {
	return z.object({
		name: type === "register" ? z.string().min(3, "Name is required") : z.string().optional(),
		email: z.string().email("Invalid email address"),
		password: z.string().min(6, "Password must be at least 6 characters"),
	});
};

const AuthForm = ({ type }: { type: FormType }) => {
	const router = useRouter();
	const formSchema = authFormSchema(type);

	// 1. Define your form.
	const form = useForm<z.infer<typeof formSchema>>({
		resolver: zodResolver(formSchema),
		defaultValues: {
			name: "",
			email: "",
			password: "",
		},
	});

	// 2. Define a submit handler.
	async function onSubmit(values: z.infer<typeof formSchema>) {
		try {
			if (type === "register") {
				const { name, email, password } = values;

				const userCredentials = await createUserWithEmailAndPassword(auth, email, password);

				const user = await register({
					uid: userCredentials.user.uid,
					name: name!,
					email,
					password,
				});

				if (!user?.success) {
					toast.error(user?.message);
					return;
				}

				toast.success("Registration successful!");
				router.push("/login");
			} else {
				const { email, password } = values;

				const userCredentials = await signInWithEmailAndPassword(auth, email, password);

				const idToken = await userCredentials.user.getIdToken();

				if (!idToken) {
					toast.error("Failed to retrieve user token. Please try again.");
					return;
				}

				await login({
					email,
					idToken,
				});

				toast.success("Login successful!");
				router.push("/");
			}
		} catch (error) {
			console.log(error);
			toast.error(`Something went wrong: ${error}`);
		}
	}

	const isLogin = type === "login";

	return (
		<div className="bg-secondary h-fit w-full rounded-2xl p-0.5 lg:min-w-[566px]">
			<div className="flex min-h-full flex-col gap-6 rounded-2xl px-10 py-14">
				<h2 className="text-primary text-4xl font-bold">Splice</h2>

				<h3 className="text-secondary-foreground font-semibold">Practice job interviews with AI Interviewer</h3>

				<Form {...form}>
					<form onSubmit={form.handleSubmit(onSubmit)} className="mt-4 w-full space-y-4">
						{!isLogin && <FormField control={form.control} name="name" label="Name" placeholder="Enter your name" />}

						<FormField control={form.control} name="email" label="Email" placeholder="Enter your email" type="email" />

						<FormField
							control={form.control}
							name="password"
							label="Password"
							placeholder="Enter your password"
							type="password"
						/>

						<Button
							type="submit"
							className="bg-primary text-secondary hover:bg-primary/90 w-full cursor-pointer transition-colors duration-200"
						>
							{isLogin ? "SignIn" : "Create an Account"}
						</Button>
					</form>
				</Form>

				<p className="text-center">
					{isLogin ? "Don't have an account?" : "Already have an account?"}
					<Link href={!isLogin ? "/login" : "/register"} className="text-primary ml-1 font-semibold">
						{!isLogin ? "Login" : "Resigter"}
					</Link>
				</p>
			</div>
		</div>
	);
};

export default AuthForm;
