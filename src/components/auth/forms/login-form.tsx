"use client";

import { Input } from "@/components/ui/input";
import React, { useState } from "react";

const LoginForm = () => {
	const [formData, setFormData] = useState({
		username: "",
		password: "",
	});

	const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const { name, value } = e.target;
		setFormData(prev => ({
			...prev,
			[name]: value,
		}));
	};

	// optional: move login logic to useEffect or a button click
	if (formData.username === "ice" && formData.password === "ice014") {
		alert("Login successful");
	}

	return (
		<div className="w-md">
			<div className="flex flex-col space-y-2">
				<Input
					type="text"
					placeholder="enter username"
					name="username"
					value={formData.username}
					onChange={handleInputChange}
				/>
				<Input
					type="password"
					placeholder="enter password"
					name="password"
					value={formData.password}
					onChange={handleInputChange}
				/>
			</div>
		</div>
	);
};

export default LoginForm;
