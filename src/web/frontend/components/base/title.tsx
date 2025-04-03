interface Props {
  title: string;
  subtitle: string;
  className?: string;
}

export default function Title({ title, subtitle, className }: Props) {
  return (
    <div className={`mb-5 ${className}`}>
      <h1 className="mb-2 text-4xl font-semibold">{title}</h1>
      <span className="font-roboto text-muted-foreground mb-3 flex text-sm">
        {subtitle}
      </span>
    </div>
  );
}
