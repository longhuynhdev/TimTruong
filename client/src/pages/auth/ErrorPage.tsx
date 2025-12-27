import { useRouteError, isRouteErrorResponse } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import PageMetadata from "@/components/PageMetadata";

const ErrorPage = () => {
  const error = useRouteError();

  let errorMessage: string;
  let errorStatus: string;

  if (isRouteErrorResponse(error)) {
    errorMessage = error.data?.message || error.statusText || "An error occurred";
    errorStatus = error.status.toString();
  } else if (error instanceof Error) {
    errorMessage = error.message;
    errorStatus = "Error";
  } else {
    errorMessage = "An unexpected error occurred";
    errorStatus = "Unknown Error";
  }

  const handleGoHome = () => {
    window.location.href = "/";
  };

  const handleReload = () => {
    window.location.reload();
  };

  return (
    <>
      <PageMetadata title="Lỗi" />
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="max-w-md w-full shadow-lg bg-card border-border">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold text-destructive">
            {errorStatus}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-center text-muted-foreground">
            {errorMessage}
          </p>
          <div className="flex gap-3 justify-center">
            <Button
              onClick={handleReload}
              variant="outline"
              className="px-6"
            >
              Thử lại
            </Button>
            <Button
              onClick={handleGoHome}
              className="px-6"
            >
              Về trang chủ
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
    </>
  );
};

export default ErrorPage;