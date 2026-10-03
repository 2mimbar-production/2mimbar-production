export function EmptyState({ message, aksi }: { message: string; aksi?: React.ReactNode }) {
  return (
    <div className="flex flex-col items-center gap-3 rounded-md border border-dashed border-line-strong px-6 py-10 text-center">
      <p className="max-w-sm text-sm text-ink-3">{message}</p>
      {aksi}
    </div>
  );
}
