import { Link } from "wouter";
import { Button } from "@/components/ui/button";

export default function NotFoundPage() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center text-center px-4">
      <div>
        <p className="text-6xl font-bold text-primary mb-4">404</p>
        <h1 className="text-xl font-bold mb-2">Page not found</h1>
        <p className="text-muted-foreground mb-8">This page doesn't exist on VYBE.</p>
        <Link href="/"><Button>Go Home</Button></Link>
      </div>
    </div>
  );
}
