import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertCircle, Home } from "lucide-react";
import { Link } from "wouter";

export default function NotFound() {
  return (
    <div className="min-h-[100dvh] w-full flex items-center justify-center bg-gray-50 pb-[env(safe-area-inset-bottom)]">
      <Card className="w-full max-w-md mx-4 sm:grid-cols-1">
        <CardContent className="pt-6 overflow-x-auto">
          <div className="flex flex-wrap mb-4 gap-2">
            <AlertCircle className="h-8 w-8 text-red-500" />
            <h1 className="text-2xl font-bold text-gray-900">404 Page Not Found</h1>
          </div>

          <p className="mt-4 text-sm text-gray-600">
            Did you forget to add the page to the router?
          </p>

          <Button asChild className="mt-6 w-full min-h-[48px]">
            <Link href="/">
              <Home className="h-4 w-4 mr-2" />
              Go home
            </Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
