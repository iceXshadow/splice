import Link from "next/link";
import { Logo } from "./ui/icons";

const Navbar = () => {
	return (
		<nav className="h-16 w-full border-b">
			<Link href="/" className="flex h-full w-full items-center gap-2">
				<Logo />
				<h2 className="font-semibold">Splice</h2>
			</Link>
		</nav>
	);
};

export default Navbar;
