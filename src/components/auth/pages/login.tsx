import React from "react";
import LoginForm from "../forms/login-form";

function LoginPage() {
	return (
		<div className="content-center space-y-4 flex-col w-full">
			<h1>Login Page</h1>
			<LoginForm />
		</div>
	);
}

export default LoginPage;
