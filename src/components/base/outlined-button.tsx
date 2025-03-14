export default function OutlinedButton({
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
      className={`text-aepink hover:bg-aepink cursor-pointer rounded-xl border px-2.5 py-1 text-sm font-medium hover:text-white ${className}`}
    >
      {children}
    </div>
  );
}
