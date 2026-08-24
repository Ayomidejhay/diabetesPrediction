export default function Card({ title, children }: { title?: string; children: React.ReactNode }) {
  return (
    <section className="card">
      {title && <h2 className="h2 mb-4">{title}</h2>}
      {children}
    </section>
  );
}
