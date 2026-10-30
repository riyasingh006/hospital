/** Home route group — the landing page ships its own header/footer per its
 * dedicated design; other public pages keep the shared site chrome. */
export default function HomeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
