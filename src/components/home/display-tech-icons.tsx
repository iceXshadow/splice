import { getTechLogos } from "@/lib/utils";
import Image from "next/image";

const DisplayTechIcons = async ({ techStack }: TechIconProps) => {
	const techIcons = await getTechLogos(techStack);
	return (
		<div className="flex flex-row">
			{techIcons.slice(0, 3).map(({ tech, url }, id) => (
				<div
					className={`group relative flex items-center justify-center rounded-full border bg-[#18181b] p-2 ${id !== 0 ? "-ml-1.5" : ""}`}
					key={tech + id}
				>
					<span className="tech-tooltip">{tech}</span>
					<Image src={url} alt={`${tech} logo`} width={24} height={24} className="size-5" />
				</div>
			))}
		</div>
	);
};

export default DisplayTechIcons;
