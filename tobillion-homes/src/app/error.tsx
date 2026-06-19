'use client';

export default function Error({ reset }: { error: Error; reset: () => void }) {
  return (
    <div className="min-h-[60vh] flex items-center justify-center bg-emerald-50">
      <div className="text-center max-w-md mx-auto px-4">
        <p className="text-6xl font-bold text-emerald-200 mb-4">!</p>
        <h2 className="text-2xl font-bold text-emerald-900 mb-2">Something went wrong</h2>
        <p className="text-gray-500 mb-6">An unexpected error occurred. Please try again.</p>
        <button
          onClick={reset}
          className="px-6 py-3 bg-emerald-700 text-white font-semibold rounded-xl hover:bg-emerald-800 transition-colors"
        >
          Try Again
        </button>
      </div>
    </div>
  );
}
