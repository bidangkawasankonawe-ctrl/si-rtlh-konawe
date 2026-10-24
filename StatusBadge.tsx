export function StatusBadge({
  name,
  color,
  size = "md",
}: {
  name: string;
  color: string;
  size?: "sm" | "md";
}) {
  return (
    <span
      className={
        "inline-flex items-center gap-1.5 rounded-full border font-semibold whitespace-nowrap " +
        (size === "sm" ? "px-2 py-0.5 text-[11px]" : "px-2.5 py-1 text-xs")
      }
      style={{
        color,
        backgroundColor: color + "14",
        borderColor: color + "40",
      }}
    >
      <span
        className="h-1.5 w-1.5 rounded-full"
        style={{ backgroundColor: color }}
      />
      {name}
    </span>
  );
}
