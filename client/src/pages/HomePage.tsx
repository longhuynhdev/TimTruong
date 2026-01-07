import { LayoutGroup, motion } from "motion/react";
import PageMetadata from "@/components/PageMetadata";
import { TextRotate } from "@/components/ui/text-rotate";

const HomePage = () => {
  return (
    <>
      <PageMetadata
        title="Trang chủ"
        description="TimTruong.app - Hệ thống tư vấn, giúp đỡ các bạn học sinh THPT tìm được đúng trường đại học mong muốn, phù hợp"
      />
      <div className="flex-1 bg-background text-foreground flex items-center justify-center">
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
    </>
  );
};

export default HomePage;
