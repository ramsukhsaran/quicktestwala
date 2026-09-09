import { getSession } from "@/lib/auth/session";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";

export default async function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar user={session} />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}
