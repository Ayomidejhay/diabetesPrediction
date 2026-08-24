"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  { href: "/", label: "Home" },
  { href: "/predict", label: "Single Predict" },
  { href: "/predict-batch", label: "Batch Predict" },
  { href: "/model-info", label: "Model Info" },
  { href: "/health", label: "Health" },
];

export default function Navbar() {
  const pathname = usePathname();
  return (
    <header className="sticky top-4 z-40 mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 mt-4 mb-8">
      <nav className="flex h-16 items-center justify-between rounded-2xl border border-slate-200/80 bg-white/75 backdrop-blur-md px-6 shadow-sm shadow-slate-100">
        <Link href="/" className="flex items-center gap-2 group cursor-pointer">
          {/* <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-teal-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-teal-500"></span>
          </span> */}
          <span className="font-bold text-slate-800 font-display tracking-tight text-lg group-hover:text-teal-600 transition-colors">
            Diabetes<span className="text-teal-600 font-medium">Predictor</span>
          </span>
        </Link>
        <div className="flex items-center gap-1">
          {links.map((l) => {
            const active = pathname === l.href;
            return (
              <Link
                key={l.href}
                href={l.href}
                className={`rounded-xl px-3 py-1.5 text-xs font-semibold tracking-wide transition-all duration-200 select-none ${
                  active
                    ? "bg-teal-50 text-teal-700 border border-teal-200/50 shadow-sm shadow-teal-500/5"
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                }`}
              >
                {l.label}
              </Link>
            );
          })}
        </div>
      </nav>
    </header>
  );
}
