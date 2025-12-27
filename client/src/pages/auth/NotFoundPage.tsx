import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { FileQuestion } from "lucide-react";
import { Link } from "react-router-dom";
import PageMetadata from "@/components/PageMetadata";

const NotFoundPage = () => {
  return (
    <>
      <PageMetadata title="Không tìm thấy trang" />
      <div className="flex-1 flex items-center justify-center">
      <Card className="w-full max-w-md">
        <CardHeader>
          <div className="flex items-center justify-center w-20 h-20 rounded-full bg-muted mx-auto">
            <FileQuestion className="h-10 w-10 text-muted-foreground" />
          </div>
          <CardTitle className="text-center pt-4 text-3xl font-bold">
            404
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center">
          <p className="text-xl font-semibold">Trang không tồn tại</p>
          <p className="text-muted-foreground mt-2">
            Oops! Trang bạn đang tìm kiếm không tồn tại.
          </p>
        </CardContent>
        <CardFooter className="flex justify-center">
          <Button asChild>
            <Link to="/">Về lại trang chủ</Link>
          </Button>
        </CardFooter>
      </Card>
    </div>
    </>
  );
};

export default NotFoundPage;
