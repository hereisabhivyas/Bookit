import { Calendar, MapPin, Users, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import DistancePill from "@/components/ui/distance-pill";

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
  return (
    <div
      onClick={onClick}
      className="group glass-card overflow-hidden cursor-pointer hover-lift"
    >
      {/* Image */}
      <div className="relative h-48 overflow-hidden">
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
      <div className="p-5">
        <h3 className="text-lg font-bold text-foreground mb-3 line-clamp-2 group-hover:text-primary transition-colors">
          {title}
        </h3>

        <div className="space-y-2 mb-4">
          <div className="flex items-center gap-2 text-muted-foreground text-sm">
            <Calendar className="w-4 h-4 text-accent" />
            <span>{date}</span>
          </div>
          <div className="flex items-center justify-between gap-2 text-muted-foreground text-sm">
            <div className="flex items-center gap-2 min-w-0">
              <MapPin className="w-4 h-4 text-secondary flex-shrink-0" />
              <span className="truncate">{location}</span>
            </div>
            <DistancePill destination={location} />
          </div>
          <div className="flex items-center gap-2 text-muted-foreground text-sm">
            <Users className="w-4 h-4 text-primary" />
            <span>{attendees} attending</span>
          </div>
        </div>

        <div className="flex items-center justify-between pt-4 border-t border-border/50">
          <div>
            <span className="text-2xl font-bold gradient-text">${price}</span>
            <span className="text-muted-foreground text-sm ml-1">/person</span>
          </div>
          <div className="flex items-center gap-1 text-warning">
            <Star className="w-4 h-4 fill-warning" />
            <span className="font-semibold">{rating.toFixed(1)}</span>
          </div>
        </div>

        <Button variant="gradient" className="w-full mt-4">
          Book Now
        </Button>
      </div>
    </div>
  );
};

export default EventCard;
