import Header from "@/components/home/Header";
import Footer from "@/components/home/Footer";
import { Outlet } from "react-router-dom";
import { Toaster } from "sonner";

const HomeLayout = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 flex flex-col">
        <Outlet />
      </main>
      <Footer />
      <Toaster position="bottom-right" richColors />
    </div>
  );
};
export default HomeLayout;
