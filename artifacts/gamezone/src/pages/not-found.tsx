import { Link } from "wouter";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center space-y-6">
      <div className="text-9xl font-heading font-bold text-muted/20 absolute -z-10">404</div>
      <h1 className="text-4xl font-heading font-bold uppercase">Game Over</h1>
      <p className="text-muted-foreground max-w-md">
        The page you're looking for has been moved, deleted, or never existed in this dimension.
      </p>
      <Link href="/">
        <Button size="lg" className="mt-4">
          Return to Base
        </Button>
      </Link>
    </div>
  );
}
