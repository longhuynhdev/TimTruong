import { useRouter } from "@tanstack/react-router";
import PageMetadata from "@/components/PageMetadata";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

// TanStack Router passes { error, reset } to error components.
// reset() re-runs the failed route (retry). No need for window.location hacks.
const ErrorPage = ({ error, reset }: { error: Error; reset: () => void }) => {
	const router = useRouter();

	return (
		<>
			<PageMetadata title="Lỗi" noindex />
			<div className="min-h-screen flex items-center justify-center bg-background p-4">
				<Card className="max-w-md w-full shadow-lg bg-card border-border">
					<CardHeader className="text-center">
						<CardTitle className="text-2xl font-bold text-destructive">
							Lỗi
						</CardTitle>
					</CardHeader>
					<CardContent className="space-y-4">
						<p className="text-center text-muted-foreground">{error.message}</p>
						<div className="flex gap-3 justify-center">
							<Button onClick={reset} variant="outline" className="px-6">
								Thử lại
							</Button>
							<Button
								onClick={() => router.navigate({ to: "/" })}
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
