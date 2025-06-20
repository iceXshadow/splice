import Link from "next/link";
import React from "react";
import { Button } from "../ui/button";

const Redirect = () => {
	return (
		<div className="flex space-x-2 items-center">
			<Link href="/login">
				<Button variant="default">Login</Button>
			</Link>
			<Link href="/register">
				<Button variant="outline">Register</Button>
			</Link>
		</div>
	);
};

export default Redirect;
