import Link from "next/link";
import { redirect } from "next/navigation";
import { LoginForm } from "@/components/LoginForm";
import { getCurrentUser } from "@/lib/api";

export default async function LoginPage() {
  // Already signed in — no need to show the form.
  const user = await getCurrentUser();
  if (user) redirect("/");

  return (
    <div className="mx-auto max-w-sm space-y-5">
      <div>
        <Link
          href="/"
          className="text-sm text-neutral-500 hover:underline dark:text-neutral-400"
        >
          ← Back to tickets
        </Link>
        <h1 className="mt-2 text-xl font-semibold tracking-tight">Admin sign in</h1>
        <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
          Sign in as an admin to change ticket status and add responses.
        </p>
      </div>

      <div className="rounded-lg border border-neutral-200 bg-white p-5 dark:border-neutral-800 dark:bg-neutral-900">
        <LoginForm />
      </div>

      <p className="text-center text-xs text-neutral-500 dark:text-neutral-500">
        Demo admin: <code>admin@example.com</code> / <code>password</code>
      </p>
    </div>
  );
}
