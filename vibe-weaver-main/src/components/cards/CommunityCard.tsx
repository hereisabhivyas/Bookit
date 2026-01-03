import { Users, Calendar, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";

interface CommunityCardProps {
  id: string;
  name: string;
  icon: string;
  description: string;
  members: number;
  events: number;
  posts: number;
  tags: string[];
  badge?: "featured" | "new";
  onClick?: () => void;
  isMember?: boolean;
}

const CommunityCard = ({
  id,
  name,
  icon,
  description,
  members,
  events,
  posts,
  tags,
  badge,
  onClick,
  isMember,
}: CommunityCardProps) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [joining, setJoining] = useState(false);

  const handleJoinCommunity = async (e: React.MouseEvent) => {
    e.stopPropagation();
    
    const token = localStorage.getItem('token');
    if (!token) {
      toast({
        title: "Authentication Required",
        description: "Please login to join communities",
        variant: "destructive",
      });
      navigate('/auth');
      return;
    }

    setJoining(true);
    try {
      const response = await fetch(`https://bookit-dijk.onrender.com/api/communities/${id}/join`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (response.ok) {
        toast({
          title: "Success!",
          description: data.message,
        });
        // Navigate to community chat
        navigate(`/communities/${id}/chat`);
      } else {
        throw new Error(data.error || 'Failed to join community');
      }
    } catch (error: any) {
      console.error('Error joining community:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to join community",
        variant: "destructive",
      });
    } finally {
      setJoining(false);
    }
  };

  return (
    <div
      onClick={onClick}
      className="group glass-card overflow-hidden cursor-pointer hover-lift"
    >
      {/* Header */}
      <div className="relative h-32 bg-gradient-to-br from-primary/20 via-accent/20 to-secondary/20 flex items-center justify-center">
        <div className="w-20 h-20 rounded-full bg-card/80 backdrop-blur-sm flex items-center justify-center text-4xl border-2 border-border/50 group-hover:border-primary/50 transition-colors">
          {icon}
        </div>
        {badge && (
          <Badge
            className={`absolute top-3 right-3 ${
              badge === "featured"
                ? "bg-warning/20 text-warning border-warning/30"
                : "bg-success/20 text-success border-success/30"
            }`}
          >
            {badge.charAt(0).toUpperCase() + badge.slice(1)}
          </Badge>
        )}
      </div>

      {/* Content */}
      <div className="p-5">
        <h3 className="text-xl font-bold text-foreground mb-2 group-hover:text-primary transition-colors">
          {name}
        </h3>
        <p className="text-muted-foreground text-sm mb-4 line-clamp-2">
          {description}
        </p>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3 py-4 border-y border-border/50 mb-4">
          <div className="text-center">
            <div className="flex items-center justify-center gap-1 text-primary">
              <Users className="w-4 h-4" />
            </div>
            <div className="text-lg font-bold text-foreground">{members.toLocaleString()}</div>
            <div className="text-xs text-muted-foreground">Members</div>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center gap-1 text-accent">
              <Calendar className="w-4 h-4" />
            </div>
            <div className="text-lg font-bold text-foreground">{events}</div>
            <div className="text-xs text-muted-foreground">Events</div>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center gap-1 text-secondary">
              <MessageCircle className="w-4 h-4" />
            </div>
            <div className="text-lg font-bold text-foreground">{posts}</div>
            <div className="text-xs text-muted-foreground">Posts</div>
          </div>
        </div>

        {/* Tags */}
        <div className="flex flex-wrap gap-2 mb-4">
          {tags.slice(0, 3).map((tag) => (
            <Badge
              key={tag}
              variant="outline"
              className="text-xs bg-muted/50 border-border/50"
            >
              {tag}
            </Badge>
          ))}
        </div>

        {isMember ? (
          <Button 
            variant="outline" 
            className="w-full"
            onClick={() => navigate(`/communities/${id}/chat`)}
          >
            View Community
          </Button>
        ) : (
          <Button 
            variant="gradient" 
            className="w-full" 
            onClick={handleJoinCommunity}
            disabled={joining}
          >
            {joining ? "Joining..." : "Join Community"}
          </Button>
        )}
      </div>
    </div>
  );
};

export default CommunityCard;
