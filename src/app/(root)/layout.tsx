import { redirect } from "next/navigation";
import { ReactNode } from "react";

import Navbar from "@/components/navbar";
import { isAuthenticated } from "@/lib/actions/auth.action";

const Layout = async ({ children }: { children: ReactNode }) => {
	const isUserAuthenticated = await isAuthenticated();
	if (!isUserAuthenticated) redirect("/login");

	return (
		<div className="root-layout">
			<Navbar />
			{children}
		</div>
	);
};

export default Layout;
