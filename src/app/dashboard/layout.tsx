export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen">
      <nav className="border-b px-6 py-4">
        <span className="font-semibold">Crescia</span>
      </nav>
      <main className="p-6">{children}</main>
    </div>
  );
}
