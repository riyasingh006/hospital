import { Cross } from "lucide-react";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="sign-in-page relative flex min-h-screen items-center justify-center overflow-hidden bg-[#F5F8FC] px-4 py-10 sm:px-8">
      {/* extremely subtle healthcare decoration — CSS only */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.5]"
        style={{
          backgroundImage:
            "radial-gradient(circle, rgba(37,99,235,0.10) 1px, transparent 1.4px)",
          backgroundSize: "26px 26px",
        }}
      />
      <Cross
        aria-hidden
        className="pointer-events-none absolute -left-10 -top-10 h-56 w-56 rotate-12 text-[#2563EB] opacity-[0.05]"
      />
      <Cross
        aria-hidden
        className="pointer-events-none absolute -bottom-14 -right-12 h-64 w-64 -rotate-12 text-[#2E9B47] opacity-[0.05]"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-[-180px] h-[420px] w-[720px] -translate-x-1/2 rounded-full"
        style={{
          background:
            "radial-gradient(closest-side, rgba(37,99,235,0.08), transparent)",
        }}
      />

      <main
        id="main-content"
        className="relative z-10 w-full max-w-[600px]"
      >
        {children}
      </main>
    </div>
  );
}
