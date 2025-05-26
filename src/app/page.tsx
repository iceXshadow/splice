import { Hero, Interviews } from "@/components/home/home-components";

export default function Home() {
	return (
		<div className="flex h-screen w-full flex-col gap-12">
			<Hero />
			<Interviews />
		</div>
	);
}
