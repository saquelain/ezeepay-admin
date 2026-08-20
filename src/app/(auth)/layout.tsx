export default function AuthLayout({
    children,
  }: {
    children: React.ReactNode;
  }) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-brand-purple-light via-white to-white px-4">
        {children}
      </div>
    );
  }