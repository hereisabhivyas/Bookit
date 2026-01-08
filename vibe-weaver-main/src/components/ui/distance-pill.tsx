import { MapPin } from "lucide-react";
import { useDistance } from "@/hooks/use-distance";

interface DistancePillProps {
  destination: string | undefined;
  className?: string;
}

const DistancePill = ({ destination, className }: DistancePillProps) => {
  const { distanceLabel, loading } = useDistance(destination);

  if (!destination || loading || !distanceLabel) return null;

  return (
    <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full bg-secondary/20 text-xs text-secondary-foreground ${className || ""}`}>
      <MapPin className="w-3 h-3" />
      <span>{distanceLabel} away</span>
    </span>
  );
};

export default DistancePill;
