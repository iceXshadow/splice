import type { Metadata } from "next";
import { Shantell_Sans } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";

const shantellSans = Shantell_Sans({
	subsets: ["latin"],
	weight: "400",
	variable: "--font-shantell-sans",
	adjustFontFallback: true,
});

export const metadata: Metadata = {
	title: "Splice",
	description: "AI powered interview preparation platform",
};

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html lang="en" className="dark">
			<body className={`${shantellSans.className} antialiased`}>
				{children}
				<Toaster />
			</body>
		</html>
	);
}
