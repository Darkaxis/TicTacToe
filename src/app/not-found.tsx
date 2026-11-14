import Link from "next/link";

export default function NotFound() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-[#090A0D] px-6 text-center text-[#ECEAE4]">
      <div className="border border-white/20 bg-[#0E121A] p-8 clip-chamfer-md space-y-4 max-w-md w-full">
        <div className="font-mono text-xs tracking-[0.22em] text-tactical-crimson uppercase">
          ERROR // 404
        </div>
        <h1 className="font-display text-3xl font-black tracking-[0.08em] uppercase">
          PAGE NOT FOUND
        </h1>
        <Link
          href="/"
          className="inline-flex items-center justify-center border border-tactical-cyan bg-tactical-cyan/10 px-5 py-2 font-mono text-xs uppercase tracking-[0.16em] text-tactical-cyan hover:bg-tactical-cyan hover:text-[#090A0D] transition-colors"
        >
          Return to Grid
        </Link>
      </div>
    </main>
  );
}
