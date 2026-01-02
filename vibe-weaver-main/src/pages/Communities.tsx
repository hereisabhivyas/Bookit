import { useState, useEffect } from "react";
import Navbar from "@/components/layout/Navbar";
import CommunityCard from "@/components/cards/CommunityCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Plus, Users, TrendingUp, Star, Clock, Lock, Globe, UserPlus } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";

const Communities = () => {
  const [activeFilter, setActiveFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [communities, setCommunities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const { toast } = useToast();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [membershipMap, setMembershipMap] = useState<Record<string, 'active' | 'pending' | null>>({});

  // Form state
  const [formData, setFormData] = useState({
    name: "",
    icon: "👥",
    description: "",
    category: "",
    isPrivate: false,
    requireApproval: false,
    allowMemberInvites: true,
  });

  useEffect(() => {
    const token = localStorage.getItem('token');
    setIsLoggedIn(!!token);
    fetchCommunities();
  }, []);

  const fetchCommunities = async () => {
    try {
      const response = await fetch('http://localhost:3000/api/communities');
      const data = await response.json();
      setCommunities(data);
      // After loading communities, if logged in, fetch membership status per community
      const token = localStorage.getItem('token');
      if (token && Array.isArray(data) && data.length > 0) {
        const results = await Promise.all(
          data.map(async (c: any) => {
            try {
              const res = await fetch(`http://localhost:3000/api/communities/${c._id}`, {
                headers: { Authorization: `Bearer ${token}` },
              });
              if (!res.ok) return { id: c._id, status: null };
              const json = await res.json();
              const status = json?.membership?.status ?? null;
              return { id: c._id, status };
            } catch {
              return { id: c._id, status: null };
            }
          })
        );
        const map: Record<string, 'active' | 'pending' | null> = {};
        results.forEach(r => {
          if (r && r.id) map[r.id] = (r.status === 'active' || r.status === 'pending') ? r.status : null;
        });
        setMembershipMap(map);
      }
    } catch (error) {
      console.error('Error fetching communities:', error);
      toast({
        title: "Error",
        description: "Failed to load communities",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCreateCommunity = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const token = localStorage.getItem('token');
    if (!token) {
      toast({
        title: "Authentication Required",
        description: "Please login to create a community",
        variant: "destructive",
      });
      return;
    }

    try {
      const response = await fetch('http://localhost:3000/api/communities', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          ...formData,
          members: 1,
          events: 0,
          posts: 0,
          tags: [formData.category],
          image: `https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=600&h=400&fit=crop`,
          badge: '',
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create community');
      }

      toast({
        title: "Success!",
        description: "Community created successfully",
      });

      setDialogOpen(false);
      setFormData({
        name: "",
        icon: "👥",
        description: "",
        category: "",
        isPrivate: false,
        requireApproval: false,
        allowMemberInvites: true,
      });
      fetchCommunities();
    } catch (error) {
      console.error('Error creating community:', error);
      toast({
        title: "Error",
        description: "Failed to create community",
        variant: "destructive",
      });
    }
  };

  const emojiOptions = ["👥", "🎵", "💻", "🎨", "🏀", "🍔", "🎭", "📚", "🎮", "✈️", "💪", "🎬"];

  const filterOptions = [
    { id: "all", label: "All", icon: Users },
    { id: "popular", label: "Popular", icon: TrendingUp },
    { id: "featured", label: "Featured", icon: Star },
    { id: "new", label: "New", icon: Clock },
  ];

  const filteredCommunities = communities.filter((community) => {
    const matchesSearch = community.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         community.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = activeFilter === "all" || community.badge === activeFilter;
    return matchesSearch && (activeFilter === "all" || activeFilter === "popular" || matchesFilter);
  });

  const joinedCommunities = filteredCommunities.filter((c: any) => membershipMap[c._id] === 'active');
  // Only show public communities in the not-joined list (hide private communities unless user is a member)
  const notJoinedCommunities = filteredCommunities.filter((c: any) => membershipMap[c._id] !== 'active' && !c.isPrivate);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero */}
      <section className="pt-24 pb-12 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-secondary/10 via-transparent to-accent/10" />
        <div className="absolute top-20 left-10 w-72 h-72 bg-secondary/20 rounded-full blur-3xl" />
        <div className="absolute bottom-10 right-10 w-96 h-96 bg-accent/20 rounded-full blur-3xl" />
        
        <div className="container mx-auto px-4 relative">
          <div className="text-center mb-10">
            <h1 className="text-4xl md:text-6xl font-black mb-4">
              <span className="gradient-text">Communities</span>
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Find your tribe and connect with like-minded people
            </p>
          </div>

          {/* Search & Create */}
          <div className="glass-card p-4 max-w-3xl mx-auto">
            <div className="flex flex-col md:flex-row gap-3">
              <div className="flex-1 relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  placeholder="Search communities..."
                  className="pl-12 h-12 bg-muted/50 border-border/50"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogTrigger asChild>
                  <Button variant="gradient" size="lg" className="h-12 gap-2">
                    <Plus className="w-5 h-5" />
                    Create Community
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>Create New Community</DialogTitle>
                    <DialogDescription>
                      Create a space for people to connect and share interests
                    </DialogDescription>
                  </DialogHeader>
                  <form onSubmit={handleCreateCommunity} className="space-y-6">
                    {/* Community Name */}
                    <div className="space-y-2">
                      <Label htmlFor="name">Community Name *</Label>
                      <Input
                        id="name"
                        placeholder="Enter community name"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        required
                      />
                    </div>

                    {/* Icon Selection */}
                    <div className="space-y-2">
                      <Label>Community Icon</Label>
                      <div className="grid grid-cols-6 gap-2">
                        {emojiOptions.map((emoji) => (
                          <button
                            key={emoji}
                            type="button"
                            onClick={() => setFormData({ ...formData, icon: emoji })}
                            className={`p-3 text-2xl rounded-lg border-2 transition-all hover:scale-110 ${
                              formData.icon === emoji
                                ? 'border-primary bg-primary/10'
                                : 'border-border bg-muted/50'
                            }`}
                          >
                            {emoji}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Category */}
                    <div className="space-y-2">
                      <Label htmlFor="category">Category *</Label>
                      <Select
                        value={formData.category}
                        onValueChange={(value) => setFormData({ ...formData, category: value })}
                        required
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select a category" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Music">🎵 Music</SelectItem>
                          <SelectItem value="Tech & Startup">💻 Tech & Startup</SelectItem>
                          <SelectItem value="Sports">🏀 Sports</SelectItem>
                          <SelectItem value="Art & Culture">🎨 Art & Culture</SelectItem>
                          <SelectItem value="Food & Drink">🍔 Food & Drink</SelectItem>
                          <SelectItem value="Theater">🎭 Theater</SelectItem>
                          <SelectItem value="Books">📚 Books</SelectItem>
                          <SelectItem value="Gaming">🎮 Gaming</SelectItem>
                          <SelectItem value="Travel">✈️ Travel</SelectItem>
                          <SelectItem value="Fitness">💪 Fitness</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Description */}
                    <div className="space-y-2">
                      <Label htmlFor="description">Description *</Label>
                      <Textarea
                        id="description"
                        placeholder="Describe your community..."
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        rows={4}
                        required
                      />
                    </div>

                    {/* Privacy Settings */}
                    <div className="space-y-4 p-4 rounded-lg bg-muted/50">
                      <h3 className="font-semibold flex items-center gap-2">
                        <Lock className="w-4 h-4" />
                        Privacy & Settings
                      </h3>

                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <Label className="flex items-center gap-2">
                            {formData.isPrivate ? <Lock className="w-4 h-4" /> : <Globe className="w-4 h-4" />}
                            Private Community
                          </Label>
                          <p className="text-sm text-muted-foreground">
                            Only approved members can join and view content
                          </p>
                        </div>
                        <Switch
                          checked={formData.isPrivate}
                          onCheckedChange={(checked) => setFormData({ ...formData, isPrivate: checked })}
                        />
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <Label>Require Join Approval</Label>
                          <p className="text-sm text-muted-foreground">
                            New members need approval to join
                          </p>
                        </div>
                        <Switch
                          checked={formData.requireApproval}
                          onCheckedChange={(checked) => setFormData({ ...formData, requireApproval: checked })}
                        />
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <Label className="flex items-center gap-2">
                            <UserPlus className="w-4 h-4" />
                            Allow Member Invites
                          </Label>
                          <p className="text-sm text-muted-foreground">
                            Members can invite others to join
                          </p>
                        </div>
                        <Switch
                          checked={formData.allowMemberInvites}
                          onCheckedChange={(checked) => setFormData({ ...formData, allowMemberInvites: checked })}
                        />
                      </div>
                    </div>

                    <div className="flex gap-3 pt-4">
                      <Button
                        type="button"
                        variant="outline"
                        className="flex-1"
                        onClick={() => setDialogOpen(false)}
                      >
                        Cancel
                      </Button>
                      <Button type="submit" variant="gradient" className="flex-1">
                        Create Community
                      </Button>
                    </div>
                  </form>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </div>
      </section>

      {/* Filters */}
      <section className="py-6">
        <div className="container mx-auto px-4">
          <div className="flex flex-wrap gap-2 justify-center">
            {filterOptions.map((filter) => {
              const Icon = filter.icon;
              return (
                <Button
                  key={filter.id}
                  variant={activeFilter === filter.id ? "default" : "ghost"}
                  onClick={() => setActiveFilter(filter.id)}
                  className="rounded-full gap-2"
                >
                  <Icon className="w-4 h-4" />
                  {filter.label}
                </Button>
              );
            })}
          </div>
        </div>
      </section>

      {/* Joined Communities */}
      {isLoggedIn && joinedCommunities.length > 0 && (
        <section className="py-8">
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold">Joined Communities</h2>
              <p className="text-muted-foreground">{joinedCommunities.length} joined</p>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {joinedCommunities.map((community: any, index: number) => (
                <div
                  key={community._id || index}
                  className="animate-fade-in-up"
                  style={{ animationDelay: `${index * 0.05}s` }}
                >
                  <CommunityCard 
                    id={community._id || String(index)}
                    name={community.name}
                    icon={community.icon}
                    description={community.description}
                    members={community.members}
                    events={community.events || 0}
                    posts={community.posts || 0}
                    tags={community.tags || []}
                    badge={community.badge}
                    isMember={true}
                  />
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Communities Grid */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                <p className="text-muted-foreground">Loading communities...</p>
              </div>
            </div>
          ) : (
            <>
              <div className="flex items-center justify-between mb-8">
                <p className="text-muted-foreground">
                  <span className="text-foreground font-semibold">{notJoinedCommunities.length}</span> communities
                </p>
              </div>

              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {notJoinedCommunities.map((community, index) => (
                  <div
                    key={community._id || index}
                    className="animate-fade-in-up"
                    style={{ animationDelay: `${index * 0.05}s` }}
                  >
                    <CommunityCard 
                      id={community._id || String(index)}
                      name={community.name}
                      icon={community.icon}
                      description={community.description}
                      members={community.members}
                      events={community.events || 0}
                      posts={community.posts || 0}
                      tags={community.tags || []}
                      badge={community.badge}
                      isMember={membershipMap[community._id] === 'active'}
                    />
                  </div>
                ))}
              </div>

              {notJoinedCommunities.length === 0 && (
                <div className="text-center py-20">
                  <Users className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
                  <p className="text-muted-foreground text-lg mb-2">
                    {searchQuery || activeFilter !== "all" 
                      ? "No communities found." 
                      : "No communities yet. Be the first to create one!"}
                  </p>
                  {(searchQuery || activeFilter !== "all") && (
                    <Button variant="outline" className="mt-4" onClick={() => { setActiveFilter("all"); setSearchQuery(""); }}>
                      Clear Filters
                    </Button>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      </section>
    </div>
  );
};

export default Communities;
