type StatusBadgeProps = {
  label: string;
  tone?: "info" | "success" | "warning" | "error" | "neutral";
};

const CLASS: Record<NonNullable<StatusBadgeProps["tone"]>, string> = {
  info: "fr-badge--info",
  success: "fr-badge--success",
  warning: "fr-badge--warning",
  error: "fr-badge--error",
  neutral: "fr-badge--grey",
};

export function StatusBadge({ label, tone = "neutral" }: StatusBadgeProps) {
  return <span className={`fr-badge ${CLASS[tone]}`}>{label}</span>;
}
