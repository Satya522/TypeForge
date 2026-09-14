export default function LearnLoading() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-[#000000]">
      <div className="flex flex-col items-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-500 border-t-transparent" />
        <p className="mt-4 text-sm font-medium text-zinc-400">Loading Learning Paths...</p>
      </div>
    </div>
  );
}
