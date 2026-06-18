import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="mx-auto max-w-md py-16 text-center">
      <p className="text-6xl font-extrabold text-primary">404</p>
      <h1 className="mt-4 text-xl font-semibold">Page not found</h1>
      <p className="mt-2 text-muted-foreground">
        We couldn&apos;t find that page. / No encontramos esa página.
      </p>
      <Link href="/" className={buttonVariants({ className: "mt-6" })}>
        Home / Inicio
      </Link>
    </div>
  );
}
