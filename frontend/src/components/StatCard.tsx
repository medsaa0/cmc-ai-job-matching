import clsx from "clsx";
import { LucideIcon } from "lucide-react";

interface Props {
  title: string;
  value: string | number;
  icon: LucideIcon;
  color?: "blue" | "green" | "orange" | "purple" | "teal";
  subtitle?: string;
}

const colorMap = {
  blue: "bg-blue-50 text-blue-700 border-blue-100",
  green: "bg-green-50 text-green-700 border-green-100",
  orange: "bg-orange-50 text-orange-700 border-orange-100",
  purple: "bg-purple-50 text-purple-700 border-purple-100",
  teal: "bg-teal-50 text-teal-700 border-teal-100",
};

const iconColorMap = {
  blue: "bg-blue-100 text-blue-600",
  green: "bg-green-100 text-green-600",
  orange: "bg-orange-100 text-orange-600",
  purple: "bg-purple-100 text-purple-600",
  teal: "bg-teal-100 text-teal-600",
};

export default function StatCard({ title, value, icon: Icon, color = "blue", subtitle }: Props) {
  return (
    <div className={clsx("card border", colorMap[color])}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide opacity-70">{title}</p>
          <p className="text-3xl font-bold mt-1">{value}</p>
          {subtitle && <p className="text-xs mt-1 opacity-60">{subtitle}</p>}
        </div>
        <div className={clsx("p-3 rounded-xl", iconColorMap[color])}>
          <Icon size={24} />
        </div>
      </div>
    </div>
  );
}
