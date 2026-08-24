export default function Loader({ label = "Loading..." }: { label?: string }) {
  return (
    <div className="flex items-center gap-2 text-slate-600"><span className="animate-spin">⏳</span> {label}</div>
  );
}
