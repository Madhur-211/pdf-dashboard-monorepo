// apps/web/src/app/not-found.tsx
export default function NotFound() {
  return (
    <div className="h-screen flex flex-col items-center justify-center">
      <h1 className="text-3xl font-bold">404 - Page Not Found</h1>
      <p className="text-gray-600 mt-2">Sorry, this page does not exist.</p>
    </div>
  );
}
