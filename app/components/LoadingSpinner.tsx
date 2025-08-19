export default function LoadingSpinner() {
  return (
    <div className="min-h-screen bg-stone-50 flex items-center justify-center">
      <div className="flex items-center space-x-2 text-stone-600">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-stone-600"></div>
        <span className="text-sm">Loading...</span>
      </div>
    </div>
  );
}
