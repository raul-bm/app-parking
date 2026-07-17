import NavBar from "./NavBar";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="h-screen bg-gray-900 flex flex-col">
      <main className="flex-1 min-h-0">{children}</main>
      <NavBar />
    </div>
  );
}
