"use client";

interface LoadMoreButtonProps {
  onClick: () => void;
  loading?: boolean;
  hasMore?: boolean;
}

export function LoadMoreButton({ onClick, loading, hasMore }: LoadMoreButtonProps) {
  if (!hasMore) return null;
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={loading}
      className="btn btn-ghost w-full text-sm"
    >
      {loading ? "Loading..." : "Load more"}
    </button>
  );
}
