interface StatusBadgeProps {
  label: string;
  tone?: "green" | "yellow" | "red" | "blue" | "gray";
}

const toneMap = {
  green: "bg-emerald-400/20 text-emerald-200",
  yellow: "bg-amber-400/20 text-amber-200",
  red: "bg-rose-400/20 text-rose-200",
  blue: "bg-sky-400/20 text-sky-200",
  gray: "bg-white/10 text-white/70"
};

const StatusBadge = ({ label, tone = "gray" }: StatusBadgeProps) => {
  return <span className={`badge ${toneMap[tone]}`}>{label}</span>;
};

export default StatusBadge;
