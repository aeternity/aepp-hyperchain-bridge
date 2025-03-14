export default function Button({
  children,
  onClick,
  className,
}: {
  children: React.ReactNode;
  onClick: () => void;
  className?: string;
}) {
  return (
    <div
      onClick={onClick}
      className={`text-aepink-100 hover:bg-aepink-100 cursor-pointer rounded-xl border px-2.5 py-1 text-sm font-medium hover:text-white ${className}`}
    >
      {children}
    </div>
  );
}
