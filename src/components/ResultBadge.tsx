export default function ResultBadge({ prediction, probability }: { prediction: number; probability: number }) {
  const positive = prediction === 1;
  const pct = (probability * 100).toFixed(2);
  return (
    <div className={`badge ${positive ? "border-red-600 text-red-700" : "border-emerald-600 text-emerald-700"}`}>
      {positive ? "Diabetes" : "No Diabetes"} • {pct}%
    </div>
  );
}
