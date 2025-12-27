import PageMetadata from "@/components/PageMetadata";

const HomePage = () => {
  return (
    <>
      <PageMetadata
        title="Trang chủ"
        description="TimTruong.app - Hệ thống tư vấn, giúp đỡ các bạn học sinh THPT tìm được đúng trường đại học mong muốn, phù hợp"
      />
      <div className="flex-1 bg-background text-foreground">
        <h1 className="text-2xl font-bold">Homepage</h1>
      </div>
    </>
  );
};

export default HomePage;
