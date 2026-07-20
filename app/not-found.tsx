import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex-1 bg-background grid place-items-center px-4">
      <div className="text-center">
        <div className="text-8xl mb-6">🍽️</div>
        <div className="label-mono mb-3">● 404</div>
        <h1 className="text-4xl font-bold tracking-tight mb-3">Page not found</h1>
        <p className="text-muted-foreground max-w-sm mx-auto leading-relaxed">
          Looks like this page got eaten. Let&apos;s get you back to the menu.
        </p>
        <Link
          href="/"
          className="mt-8 inline-flex pill bg-foreground text-background px-8 py-3.5 font-medium hover:bg-foreground/90 transition-smooth"
        >
          Back to home
        </Link>
      </div>
    </div>
  );
}
