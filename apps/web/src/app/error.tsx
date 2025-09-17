// apps/web/src/app/error.tsx
"use client";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error;
  reset: () => void;
}) {
  return (
    <html>
      <body className="h-screen flex flex-col items-center justify-center">
        <h2 className="text-xl font-bold">Something went wrong!</h2>
        <p className="mt-2 text-gray-600">{error.message}</p>
        <button
          onClick={() => reset()}
          className="mt-4 px-4 py-2 bg-blue-500 text-white rounded"
        >
          Try again
        </button>
      </body>
    </html>
  );
}
