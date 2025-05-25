/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import Link from "next/link";
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
	function onSubmit(values: z.infer<typeof formSchema>) {
		try {
			const { password, ...rest } = values;

			if (type === "register") {
				console.log("Registering user:", rest);
				toast.success("Registration successful!");
			} else {
                console.log("Logging in user:", rest);
				toast.success("Login successful!");
			}
		} catch (error) {
			console.log(error);
			toast.error(`Something went wrong: ${error}`);
		}
	}

	const isLogin = type === "login";

	return (
		<div className="p-0.5 rounded-2xl bg-secondary w-full h-fit lg:min-w-[566px]">
			<div className="flex min-h-full flex-col gap-6 rounded-2xl px-10 py-14">
				<h2 className="text-primary font-bold text-4xl">Splice</h2>

				<h3 className="text-secondary-foreground font-semibold">Practice job interviews with AI Interviewer</h3>

				<Form {...form}>
					<form onSubmit={form.handleSubmit(onSubmit)} className="mt-4 w-full space-y-4">
						{!isLogin && 
                            <FormField 
                                control={form.control} 
                                name="name" 
                                label="Name" 
                                placeholder="Enter your name" 
                            />
                        }

						<FormField 
                            control={form.control} 
                            name="email" 
                            label="Email" 
                            placeholder="Enter your email" 
                            type="email" 
                        />

						<FormField
							control={form.control}
							name="password"
							label="Password"
							placeholder="Enter your password"
							type="password"
						/>

						<Button 
                            type="submit"
                            className="cursor-pointer w-full bg-primary text-secondary hover:bg-primary/90 transition-colors duration-200"
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
