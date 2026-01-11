import { Calendar, MapPin, Users, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import DistancePill from "@/components/ui/distance-pill";
import { useNavigate } from "react-router-dom";

interface EventCardProps {
  id: string;
  title: string;
  category: string;
  date: string;
  location: string;
  price: number;
  image: string;
  rating: number;
  attendees: number;
  badge?: "hot" | "new" | "featured" | "trending";
  onClick?: () => void;
}

const badgeStyles = {
  hot: "bg-destructive text-destructive-foreground",
  new: "bg-success text-success-foreground",
  featured: "bg-warning text-warning-foreground",
  trending: "bg-secondary text-secondary-foreground",
};

const EventCard = ({
  id,
  title,
  category,
  date,
  location,
  price,
  image,
  rating,
  attendees,
  badge,
  onClick,
}: EventCardProps) => {
  const navigate = useNavigate();

  const handleOpen = () => {
    if (onClick) return onClick();
    if (id) navigate(`/events/${id}/book`);
  };

  const handleBook = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (id) navigate(`/events/${id}/book`);
  };
  return (
    <div
      onClick={handleOpen}
      className="group glass-card overflow-hidden cursor-pointer hover-lift flex flex-col w-full max-w-full"
    >
      {/* Image */}
      <div className="relative h-48 overflow-hidden flex-shrink-0">
        <img
          src={image}
          alt={title}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent" />
        
        {badge && (
          <Badge className={`absolute top-3 right-3 ${badgeStyles[badge]}`}>
            {badge.charAt(0).toUpperCase() + badge.slice(1)}
          </Badge>
        )}
        
        <Badge className="absolute top-3 left-3 bg-primary/20 text-primary backdrop-blur-sm border-primary/30">
          {category}
        </Badge>
      </div>

      {/* Content */}
      <div className="p-4 sm:p-5">
        <h3 className="text-base sm:text-lg font-bold text-foreground mb-2 line-clamp-2 group-hover:text-primary transition-colors break-words">
          {title}
        </h3>

        <div className="space-y-2 mb-4 pb-4 border-b border-border/50">
          <div className="flex items-center gap-2 text-muted-foreground text-xs sm:text-sm">
            <Calendar className="w-4 h-4 text-accent flex-shrink-0" />
            <span className="truncate">{date}</span>
          </div>
          <div className="flex items-center justify-between gap-2 text-muted-foreground text-xs sm:text-sm min-w-0">
            <div className="flex items-center gap-2 min-w-0 flex-1">
              <MapPin className="w-4 h-4 text-secondary flex-shrink-0" />
              <span className="truncate">{location}</span>
            </div>
            <div className="flex-shrink-0">
              <DistancePill destination={location} />
            </div>
          </div>
        </div>

        <Button variant="gradient" className="w-full text-sm" onClick={handleBook}>
          Book Now
        </Button>
      </div>
    </div>
  );
};

export default EventCard;
