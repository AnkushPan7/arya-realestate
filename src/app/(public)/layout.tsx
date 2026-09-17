import { Footer, Header, WhatsAppButton } from "@/components/public";
import { Providers } from "@/components/providers";
import { RouteTransition } from "@/components/ui/RouteTransition";

export default function PublicLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <Providers>
      <RouteTransition>
        <Header />
        <main className="min-h-[50vh]">{children}</main>
        <Footer />
      </RouteTransition>
      <WhatsAppButton />
    </Providers>
  );
}
