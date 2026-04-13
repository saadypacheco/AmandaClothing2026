export default function SoftwareLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="bg-amanda-white text-amanda-black">
      {children}
    </div>
  );
}
