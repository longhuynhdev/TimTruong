import { LayoutGroup, motion } from "motion/react";
import { LogoCloud } from "@/components/home/LogoCloud";
import JsonLd from "@/components/JsonLd";
import PageMetadata from "@/components/PageMetadata";
import { TextRotate } from "@/components/ui/text-rotate";

const SITE_URL = "https://timtruong.app";

const HomePage = () => {
	return (
		<>
			<PageMetadata
				title="Tìm trường đại học phù hợp ở TP.HCM"
				description="TimTruong giúp học sinh THPT tìm trường đại học và ngành học phù hợp ở TP.HCM theo điểm thi, tổ hợp môn. Tra cứu điểm chuẩn, học phí nhanh chóng."
			/>
			<JsonLd
				data={{
					"@context": "https://schema.org",
					"@graph": [
						{
							"@type": "Organization",
							"@id": `${SITE_URL}/#organization`,
							name: "TimTruong",
							url: SITE_URL,
							logo: `${SITE_URL}/logo.svg`,
						},
						{
							"@type": "WebSite",
							"@id": `${SITE_URL}/#website`,
							url: SITE_URL,
							name: "TimTruong",
							inLanguage: "vi-VN",
							publisher: { "@id": `${SITE_URL}/#organization` },
							potentialAction: {
								"@type": "SearchAction",
								target: {
									"@type": "EntryPoint",
									urlTemplate: `${SITE_URL}/tim-kiem?q={search_term_string}`,
								},
								"query-input": "required name=search_term_string",
							},
						},
					],
				}}
			/>
			<div className="flex flex-col">
				{/* SEO heading (visually hidden; the animated hero below is decorative) */}
				<h1 className="sr-only">Tìm trường đại học phù hợp ở TP.HCM</h1>
				{/* Hero Section */}
				<div className="flex-1 bg-background text-foreground flex items-center justify-center min-h-[60vh]">
					<div className="w-full h-full text-2xl sm:text-3xl md:text-5xl flex flex-row items-center justify-center font-light overflow-hidden p-12 sm:p-20 md:p-24">
						<LayoutGroup>
							<motion.div className="flex whitespace-pre" layout>
								<motion.span
									className="pt-0.5 sm:pt-1 md:pt-2"
									layout
									transition={{ type: "spring", damping: 30, stiffness: 400 }}
								>
									Tìm đúng{" "}
								</motion.span>
								<TextRotate
									texts={["trường 🏫", "ngành 📚", "đam mê 🔥"]}
									mainClassName="text-white px-2 sm:px-2 md:px-3 bg-primary overflow-hidden py-0.5 sm:py-1 md:py-2 justify-center rounded-lg"
									staggerFrom="last"
									initial={{ y: "100%" }}
									animate={{ y: 0 }}
									exit={{ y: "-120%" }}
									staggerDuration={0.025}
									splitLevelClassName="overflow-hidden pb-0.5 sm:pb-1 md:pb-1"
									transition={{ type: "spring", damping: 30, stiffness: 400 }}
									rotationInterval={2000}
								/>
							</motion.div>
						</LayoutGroup>
					</div>
				</div>

				{/* Logo Cloud Section */}
				<LogoCloud edgeOpacity={70} />
			</div>
		</>
	);
};

export default HomePage;
