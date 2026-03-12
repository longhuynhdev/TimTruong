import type { ReactNode } from "react";

/**
 * Represents a single logo item in the LogoCloud grid
 */
export interface LogoItem {
	/** Display name of the logo (used for accessibility and tooltips) */
	name: string;
	/** React node containing the icon (typically an SVG or Image component) */
	icon: ReactNode;
}

/**
 * University logos for the LogoCloud component.
 * Images are loaded from /public/universities-logo/
 */
export const defaultLogos: LogoItem[] = [
	{
		name: "HCMUS",
		icon: (
			<img
				src="/universities-logo/hcmus.png"
				alt="HCMUS"
				className="w-full h-full object-contain"
			/>
		),
	},
	{
		name: "HCMUT",
		icon: (
			<img
				src="/universities-logo/hcmut.png"
				alt="HCMUT"
				className="w-full h-full object-contain"
			/>
		),
	},
	{
		name: "UIT",
		icon: (
			<img
				src="/universities-logo/uit.svg"
				alt="UIT"
				className="w-full h-full object-contain"
			/>
		),
	},
	{
		name: "IU",
		icon: (
			<img
				src="/universities-logo/iu.png"
				alt="IU"
				className="w-full h-full object-contain"
			/>
		),
	},
	{
		name: "UEL",
		icon: (
			<img
				src="/universities-logo/uel.png"
				alt="UEL"
				className="w-full h-full object-contain"
			/>
		),
	},
	{
		name: "UHS",
		icon: (
			<img
				src="/universities-logo/uhs.svg"
				alt="UHS"
				className="w-full h-full object-contain"
			/>
		),
	},
	{
		name: "USSH",
		icon: (
			<img
				src="/universities-logo/ussh.png"
				alt="USSH"
				className="w-full h-full object-contain"
			/>
		),
	},
	{
		name: "HCMUE",
		icon: (
			<img
				src="/universities-logo/hcmue.svg"
				alt="HCMUE"
				className="w-full h-full object-contain"
			/>
		),
	},
	{
		name: "SGU",
		icon: (
			<img
				src="/universities-logo/sgu.png"
				alt="SGU"
				className="w-full h-full object-contain"
			/>
		),
	},
	{
		name: "HCM-UTE",
		icon: (
			<img
				src="/universities-logo/hcm-ute.png"
				alt="HCM-UTE"
				className="w-full h-full object-contain"
			/>
		),
	},
	{
		name: "UEH",
		icon: (
			<img
				src="/universities-logo/ueh.png"
				alt="UEH"
				className="w-full h-full object-contain"
			/>
		),
	},
	{
		name: "IUH",
		icon: (
			<img
				src="/universities-logo/iuh.png"
				alt="IUH"
				className="w-full h-full object-contain"
			/>
		),
	},
	{
		name: "HUIT",
		icon: (
			<img
				src="/universities-logo/huit.png"
				alt="HUIT"
				className="w-full h-full object-contain"
			/>
		),
	},
	{
		name: "UTH",
		icon: (
			<img
				src="/universities-logo/uth.png"
				alt="UTH"
				className="w-full h-full object-contain"
			/>
		),
	},
	{
		name: "UTC",
		icon: (
			<img
				src="/universities-logo/utc.png"
				alt="UTC"
				className="w-full h-full object-contain"
			/>
		),
	},
	{
		name: "UAH",
		icon: (
			<img
				src="/universities-logo/uah.webp"
				alt="UAH"
				className="w-full h-full object-contain"
			/>
		),
	},
	{
		name: "ULAW",
		icon: (
			<img
				src="/universities-logo/ulaw.webp"
				alt="ULAW"
				className="w-full h-full object-contain"
			/>
		),
	},
	{
		name: "OU",
		icon: (
			<img
				src="/universities-logo/ou.png"
				alt="OU"
				className="w-full h-full object-contain"
			/>
		),
	},
];
