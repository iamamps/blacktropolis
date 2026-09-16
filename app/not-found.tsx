import Link from "next/link";

export default function NotFound() {
  return (
    <div className="mx-auto flex min-h-[60vh] max-w-md flex-col items-center justify-center px-4 text-center">
      <h1 className="mb-2 text-4xl font-black text-white">404</h1>
      <p className="mb-6 text-gray-400">This page couldn't be found.</p>
      <Link href="/" className="rounded-full bt-gold-btn px-6 py-2.5 font-bold">
        Back to Home
      </Link>
    </div>
  );
}
