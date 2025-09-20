import { createBrowserRouter } from "react-router-dom";
// Pages
import NotFoundPage from "@/pages/auth/NotFoundPage";
import HomePage from "@/pages/HomePage";
import HomeLayout from "@/layouts/HomeLayout";
import SearchPage from "@/pages/SearchPage";
import ErrorPage from "@/pages/auth/ErrorPage";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <HomeLayout />,
    errorElement: <ErrorPage />,
    children: [
      { index: true, element: <HomePage />, errorElement: <ErrorPage /> },
      { path: "search", element: <SearchPage />, errorElement: <ErrorPage /> },
      { path: "*", element: <NotFoundPage /> },
    ],
  },
]);