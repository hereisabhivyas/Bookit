import { useState, useEffect, useRef } from "react";
import { io as ioClient, Socket } from "socket.io-client";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Send, Users, Lock, Globe, Settings, Trash2, LogOut, Edit2, UserMinus, Shield, Plus, Check, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { API_URL } from "@/lib/api";

interface Message {
  _id: string;
  senderId: string;
  senderName: string;
  content: string;
  createdAt: string;
  type: string;
}

interface Community {
  _id: string;
  name: string;
  icon: string;
  description: string;
  members: number;
  isPrivate: boolean;
  requireApproval: boolean;
  allowMemberInvites: boolean;
  category: string;
  createdBy: string;
  createdAt: string;
  membership?: {
    role: string;
    status: string;
    joinedAt: string;
  };
}

interface Member {
  _id: string;
  userEmail: string;
  userName: string;
  role: string;
  status: string;
  joinedAt: string;
}

const apiBase = API_URL;

const CommunityChat = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const [community, setCommunity] = useState<Community | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [members, setMembers] = useState<Member[]>([]);
  const [pendingRequests, setPendingRequests] = useState<Member[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [socket, setSocket] = useState<Socket | null>(null);
  const [seenIds, setSeenIds] = useState<Set<string>>(new Set());
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [addMemberDialogOpen, setAddMemberDialogOpen] = useState(false);
  const [addMemberForm, setAddMemberForm] = useState({ userEmail: "", userName: "" });
  const [addingMember, setAddingMember] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [leaveDialogOpen, setLeaveDialogOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [editFormData, setEditFormData] = useState({
    name: "",
    description: "",
    icon: "",
    category: "",
    isPrivate: false,
    requireApproval: false,
    allowMemberInvites: true,
  });
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // Membership flags must be defined before effects that reference them
  const currentUserEmail = localStorage.getItem('userEmail');
  const isAdmin = community?.createdBy === currentUserEmail;
  const isMember = community?.membership?.status === 'active';
  const isPending = community?.membership?.status === 'pending';

  useEffect(() => {
    fetchCommunityData();
  }, [id]);

  // Auto-join support via invite link query param
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const shouldJoin = params.get('join');
    const token = localStorage.getItem('token');
    if (!id || !token) return;
    if (shouldJoin === 'true') {
      // If user is not yet a member, attempt to join directly
      if (!isMember) {
        (async () => {
          try {
            const resp = await fetch(`${apiBase}/api/communities/${id}/join`, {
              method: 'POST',
              headers: { 'Authorization': `Bearer ${token}` },
            });
            if (resp.ok) {
              const data = await resp.json();
              toast({
                title: 'Join Request Submitted',
                description: data.message || 'You will be added or approved shortly.',
              });
              // Refresh community data to reflect membership status
              fetchCommunityData();
            } else {
              const data = await resp.json();
              toast({ title: 'Join Failed', description: data.error || 'Unable to join community.', variant: 'destructive' });
            }
          } catch (e: any) {
            toast({ title: 'Error', description: e?.message || 'Unable to join community.', variant: 'destructive' });
          }
        })();
      }
    }
  }, [id, location.search, isMember]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (settingsOpen && isMember) {
      fetchMembers();
      if (isAdmin) {
        fetchPendingRequests();
      }
    }
  }, [settingsOpen]);

  // Setup live socket connection
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!id || !token) return;
    const s = ioClient(apiBase, {
      transports: ['websocket'],
      withCredentials: true,
    });
    setSocket(s);

    s.on('connect', () => {
      s.emit('join-community', { communityId: id, token });
    });

    s.on('joined', () => {
      // ready to receive live messages
    });

    s.on('message:new', (msg: Message) => {
      setSeenIds(prev => {
        const next = new Set(prev);
        if (!next.has(msg._id)) {
          next.add(msg._id);
          setMessages(prevMsgs => [...prevMsgs, msg]);
        }
        return next;
      });
    });

    s.on('error', (payload: any) => {
      console.warn('Socket error:', payload);
    });

    return () => {
      s.disconnect();
      setSocket(null);
    };
  }, [id]);

  useEffect(() => {
    if (community) {
      setEditFormData({
        name: community.name,
        description: community.description,
        icon: community.icon,
        category: community.category,
        isPrivate: community.isPrivate,
        requireApproval: community.requireApproval,
        allowMemberInvites: community.allowMemberInvites,
      });
    }
  }, [community]);

  const fetchCommunityData = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      toast({
        title: "Authentication Required",
        description: "Please login to view communities",
        variant: "destructive",
      });
      navigate('/auth');
      return;
    }

    try {
      const [communityRes, messagesRes] = await Promise.all([
        fetch(`${apiBase}/api/communities/${id}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        }),
        fetch(`${apiBase}/api/communities/${id}/messages`, {
          headers: { 'Authorization': `Bearer ${token}` }
        })
      ]);

      if (communityRes.ok) {
        const communityData = await communityRes.json();
        setCommunity(communityData);

        // If not a member, show appropriate message
        if (!communityData.membership || communityData.membership.status !== 'active') {
          if (communityData.membership?.status === 'pending') {
            toast({
              title: "Pending Approval",
              description: "Your join request is pending approval",
            });
          }
        }
      }

      if (messagesRes.ok) {
        const messagesData = await messagesRes.json();
        setMessages(messagesData);
      } else if (messagesRes.status === 403) {
        // Not a member
        setMessages([]);
      }
    } catch (error) {
      console.error('Error fetching community data:', error);
      toast({
        title: "Error",
        description: "Failed to load community",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchMembers = async () => {
    const token = localStorage.getItem('token');
    if (!token) return;

    try {
      const response = await fetch(`${apiBase}/api/communities/${id}/members`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        const data = await response.json();
        setMembers(data);
      }
    } catch (error) {
      console.error('Error fetching members:', error);
    }
  };

  const fetchPendingRequests = async () => {
    const token = localStorage.getItem('token');
    if (!token) return;

    try {
      const response = await fetch(`${apiBase}/api/communities/${id}/pending-requests`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        const data = await response.json();
        setPendingRequests(data);
      }
    } catch (error) {
      console.error('Error fetching pending requests:', error);
    }
  };

  const handleLeaveCommunity = async () => {
    const token = localStorage.getItem('token');
    if (!token) return;

    try {
      const response = await fetch(`${apiBase}/api/communities/${id}/leave`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        toast({
          title: "Success",
          description: "You have left the community",
        });
        navigate('/communities');
      } else {
        const data = await response.json();
        throw new Error(data.error || 'Failed to leave community');
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
    setLeaveDialogOpen(false);
  };

  const handleDeleteCommunity = async () => {
    const token = localStorage.getItem('token');
    if (!token) return;

    try {
      const response = await fetch(`${apiBase}/api/communities/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        toast({
          title: "Success",
          description: "Community deleted successfully",
        });
        navigate('/communities');
      } else {
        const data = await response.json();
        throw new Error(data.error || 'Failed to delete community');
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
    setDeleteDialogOpen(false);
  };

  const handleRemoveMember = async (memberEmail: string) => {
    const token = localStorage.getItem('token');
    if (!token) return;

    try {
      const response = await fetch(`${apiBase}/api/communities/${id}/members/${encodeURIComponent(memberEmail)}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        toast({
          title: "Success",
          description: "Member removed successfully",
        });
        fetchMembers();
        setCommunity(prev => prev ? { ...prev, members: prev.members - 1 } : null);
      } else {
        const data = await response.json();
        throw new Error(data.error || 'Failed to remove member');
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleApproveRequest = async (memberEmail: string) => {
    const token = localStorage.getItem('token');
    if (!token) return;

    try {
      const response = await fetch(`${apiBase}/api/communities/${id}/requests/${encodeURIComponent(memberEmail)}/approve`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        toast({
          title: "Success",
          description: "Request approved",
        });
        fetchPendingRequests();
        fetchMembers();
        setCommunity(prev => prev ? { ...prev, members: prev.members + 1 } : null);
      } else {
        const data = await response.json();
        throw new Error(data.error || 'Failed to approve request');
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleRejectRequest = async (memberEmail: string) => {
    const token = localStorage.getItem('token');
    if (!token) return;

    try {
      const response = await fetch(`${apiBase}/api/communities/${id}/requests/${encodeURIComponent(memberEmail)}/reject`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        toast({
          title: "Success",
          description: "Request rejected",
        });
        fetchPendingRequests();
      } else {
        const data = await response.json();
        throw new Error(data.error || 'Failed to reject request');
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleAddMember = async () => {
    const token = localStorage.getItem('token');
    if (!token || !addMemberForm.userEmail || !addMemberForm.userName) return;

    setAddingMember(true);
    try {
      const response = await fetch(`${apiBase}/api/communities/${id}/add-member`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          userEmail: addMemberForm.userEmail,
          userName: addMemberForm.userName
        })
      });

      if (response.ok) {
        toast({
          title: "Success",
          description: "Member added successfully",
        });
        setAddMemberForm({ userEmail: "", userName: "" });
        setAddMemberDialogOpen(false);
        fetchMembers();
        setCommunity(prev => prev ? { ...prev, members: prev.members + 1 } : null);
      } else {
        const data = await response.json();
        throw new Error(data.error || 'Failed to add member');
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setAddingMember(false);
    }
  };

  const handleUpdateCommunity = async () => {
    const token = localStorage.getItem('token');
    if (!token) return;

    try {
      const response = await fetch(`${apiBase}/api/communities/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(editFormData)
      });

      if (response.ok) {
        const updatedCommunity = await response.json();
        setCommunity(prev => prev ? { ...prev, ...updatedCommunity } : null);
        setEditMode(false);
        toast({
          title: "Success",
          description: "Community updated successfully",
        });
      } else {
        const data = await response.json();
        throw new Error(data.error || 'Failed to update community');
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleUploadIcon = async () => {
    if (!logoFile) return;
    setUploadingLogo(true);
    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('Not authenticated');
      const formData = new FormData();
      formData.append('images', logoFile);
      const resp = await fetch(`${apiBase}/upload/images`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: formData,
      });
      if (!resp.ok) {
        const data = await resp.json().catch(() => ({}));
        throw new Error(data.error || 'Failed to upload logo');
      }
      const data = await resp.json();
      const url = data?.urls?.[0];
      if (!url) throw new Error('No logo URL returned');
      setEditFormData(prev => ({ ...prev, icon: url }));
      setLogoFile(null);
      toast({ title: 'Logo uploaded', description: 'Logo has been set for this community.' });
    } catch (e: any) {
      toast({ title: 'Upload failed', description: e?.message || 'Unable to upload logo', variant: 'destructive' });
    } finally {
      setUploadingLogo(false);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || sending) return;

    const token = localStorage.getItem('token');
    if (!token) return;

    setSending(true);
    try {
      const response = await fetch(`${apiBase}/api/communities/${id}/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ content: newMessage.trim() }),
      });

      if (response.ok) {
        const message = await response.json();
        // Optimistically clear input; socket broadcast will add message
        setNewMessage("");
        // Avoid duplicate push: mark seen id so socket handler skips
        setSeenIds(prev => new Set(prev).add(message._id));
        setMessages(prevMsgs => {
          if (prevMsgs.find(m => m._id === message._id)) return prevMsgs;
          return [...prevMsgs, message];
        });
      } else {
        throw new Error('Failed to send message');
      }
    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        title: "Error",
        description: "Failed to send message",
        variant: "destructive",
      });
    } finally {
      setSending(false);
    }
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (days === 0) {
      return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    } else if (days === 1) {
      return 'Yesterday';
    } else if (days < 7) {
      return date.toLocaleDateString('en-US', { weekday: 'short' });
    } else {
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  

  const emojiOptions = ["👥", "🎵", "💻", "🎨", "🏀", "🍔", "🎭", "📚", "🎮", "✈️", "💪", "🎬"];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading community...</p>
        </div>
      </div>
    );
  }

  if (!community) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="text-center">
          <p className="text-muted-foreground text-lg mb-4">Community not found</p>
          <Button onClick={() => navigate('/communities')}>Back to Communities</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border/50 bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate('/communities')}
                className="gap-2"
              >
                <ArrowLeft className="w-4 h-4" />
                Back
              </Button>
              <div className="flex items-center gap-3">
                {community.icon && (community.icon.startsWith('http') || community.icon.startsWith('data:')) ? (
                  <img src={community.icon} alt="Community Logo" className="w-10 h-10 rounded object-cover border" />
                ) : (
                  <div className="text-3xl">{community.icon || '👥'}</div>
                )}
                <div>
                  <h1 className="text-xl font-bold flex items-center gap-2">
                    {community.name}
                    {community.isPrivate ? (
                      <Lock className="w-4 h-4 text-muted-foreground" />
                    ) : (
                      <Globe className="w-4 h-4 text-muted-foreground" />
                    )}
                  </h1>
                  <p className="text-sm text-muted-foreground flex items-center gap-2">
                    <Users className="w-3 h-3" />
                    {community.members} members
                  </p>
                </div>
              </div>
            </div>
            <Button variant="outline" size="sm" className="gap-2" onClick={() => setSettingsOpen(true)}>
              <Settings className="w-4 h-4" />
              Settings
            </Button>
          </div>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-hidden">
        {!isMember ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center max-w-md px-4">
              {isPending ? (
                <>
                  <Lock className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
                  <h2 className="text-2xl font-bold mb-2">Join Request Pending</h2>
                  <p className="text-muted-foreground mb-6">
                    Your request to join this community is awaiting approval from the admins.
                  </p>
                </>
              ) : (
                <>
                  <Users className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
                  <h2 className="text-2xl font-bold mb-2">Join to Start Chatting</h2>
                  <p className="text-muted-foreground mb-6">
                    {community.description}
                  </p>
                </>
              )}
            </div>
          </div>
        ) : (
          <ScrollArea className="h-full" ref={scrollAreaRef}>
            <div className="container mx-auto px-4 py-6 max-w-4xl">
              {messages.length === 0 ? (
                <div className="text-center py-20">
                  <p className="text-muted-foreground">
                    No messages yet. Start the conversation!
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {messages.map((message, index) => {
                    const isOwnMessage = message.senderId === currentUserEmail;
                    const showAvatar =
                      index === 0 ||
                      messages[index - 1].senderId !== message.senderId ||
                      new Date(message.createdAt).getTime() -
                        new Date(messages[index - 1].createdAt).getTime() >
                        300000; // 5 minutes

                    return (
                      <div
                        key={message._id}
                        className={`flex gap-3 ${isOwnMessage ? 'flex-row-reverse' : ''}`}
                      >
                        {showAvatar && !isOwnMessage && (
                          <Avatar className="w-8 h-8 mt-1">
                            <AvatarFallback className="bg-primary/10 text-primary text-xs">
                              {getInitials(message.senderName)}
                            </AvatarFallback>
                          </Avatar>
                        )}
                        {!showAvatar && !isOwnMessage && <div className="w-8" />}

                        <div className={`flex-1 max-w-[70%] ${isOwnMessage ? 'ml-auto' : ''}`}>
                          {showAvatar && (
                            <div
                              className={`text-xs font-semibold mb-1 ${
                                isOwnMessage ? 'text-right' : ''
                              }`}
                            >
                              {isOwnMessage ? 'You' : message.senderName}
                            </div>
                          )}
                          <div
                            className={`rounded-2xl px-4 py-2 ${
                              isOwnMessage
                                ? 'bg-primary text-primary-foreground rounded-tr-sm'
                                : 'bg-muted rounded-tl-sm'
                            }`}
                          >
                            <p className="text-sm break-words">{message.content}</p>
                          </div>
                          <div
                            className={`text-xs text-muted-foreground mt-1 ${
                              isOwnMessage ? 'text-right' : ''
                            }`}
                          >
                            {formatTime(message.createdAt)}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                  <div ref={messagesEndRef} />
                </div>
              )}
            </div>
          </ScrollArea>
        )}
      </div>

      {/* Message Input */}
      {isMember && (
        <div className="border-t border-border/50 bg-card/50 backdrop-blur-sm">
          <div className="container mx-auto px-4 py-4 max-w-4xl">
            <form onSubmit={handleSendMessage} className="flex gap-2">
              <Input
                placeholder={
                  community.isPrivate
                    ? "Type an encrypted message..."
                    : "Type a message..."
                }
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                className="flex-1"
                disabled={sending}
              />
              <Button type="submit" size="icon" disabled={sending || !newMessage.trim()}>
                <Send className="w-4 h-4" />
              </Button>
            </form>
            {community.isPrivate && (
              <p className="text-xs text-muted-foreground mt-2 flex items-center gap-1">
                <Lock className="w-3 h-3" />
                Messages are end-to-end encrypted
              </p>
            )}
          </div>
        </div>
      )}

      {/* Settings Dialog */}
      <Dialog open={settingsOpen} onOpenChange={setSettingsOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Settings className="w-5 h-5" />
              Community Settings
            </DialogTitle>
            <DialogDescription>
              View and manage community details
            </DialogDescription>
          </DialogHeader>

          <Tabs defaultValue="info" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="info">Info</TabsTrigger>
              <TabsTrigger value="members">Members ({members.length})</TabsTrigger>
              {isAdmin && <TabsTrigger value="manage">Manage</TabsTrigger>}
            </TabsList>

            <TabsContent value="info" className="space-y-4 mt-4">
              {!editMode ? (
                <>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3 p-4 rounded-lg bg-muted/50">
                      {community.icon && (community.icon.startsWith('http') || community.icon.startsWith('data:')) ? (
                        <img src={community.icon} alt="Community Logo" className="w-12 h-12 rounded object-cover border" />
                      ) : (
                        <div className="text-4xl">{community.icon || '👥'}</div>
                      )}
                      <div className="flex-1">
                        <h3 className="text-xl font-bold">{community.name}</h3>
                        <p className="text-sm text-muted-foreground">{community.category}</p>
                      </div>
                      {isAdmin && (
                        <Button variant="outline" size="sm" onClick={() => setEditMode(true)} className="gap-2">
                          <Edit2 className="w-3 h-3" />
                          Edit
                        </Button>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label>Description</Label>
                      <p className="text-sm p-3 rounded-lg bg-muted/30">{community.description}</p>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Privacy</Label>
                        <div className="flex items-center gap-2 p-3 rounded-lg bg-muted/30">
                          {community.isPrivate ? <Lock className="w-4 h-4" /> : <Globe className="w-4 h-4" />}
                          <span className="text-sm">{community.isPrivate ? 'Private' : 'Public'}</span>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label>Members</Label>
                        <div className="flex items-center gap-2 p-3 rounded-lg bg-muted/30">
                          <Users className="w-4 h-4" />
                          <span className="text-sm">{community.members} members</span>
                        </div>
                      </div>
                    </div>

                    {/* Direct Join Link */}
                    <div className="space-y-2">
                      <Label>Direct Join Link</Label>
                      <div className="flex items-center gap-2">
                        <Input
                          readOnly
                          value={`${window.location.origin}/communities/${community._id}?join=true`}
                        />
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => navigator.clipboard.writeText(`${window.location.origin}/communities/${community._id}?join=true`).then(() => {
                            toast({ title: 'Copied', description: 'Invite link copied to clipboard.' });
                          })}
                        >
                          Copy
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => window.open(`${window.location.origin}/communities/${community._id}?join=true`, '_blank')}
                        >
                          Open
                        </Button>
                      </div>
                      <p className="text-xs text-muted-foreground">Share this link for users to join directly. If the community requires approval, their request will be marked pending.</p>
                    </div>

                    <div className="space-y-2">
                      <Label className="flex items-center gap-2">
                        <Shield className="w-4 h-4" />
                        Admin
                      </Label>
                      <p className="text-sm p-3 rounded-lg bg-muted/30">{community.createdBy}</p>
                    </div>

                    <div className="space-y-2">
                      <Label>Settings</Label>
                      <div className="space-y-2 p-3 rounded-lg bg-muted/30">
                        <div className="flex justify-between text-sm">
                          <span>Require Approval to Join</span>
                          <Badge variant={community.requireApproval ? "default" : "secondary"}>
                            {community.requireApproval ? "Yes" : "No"}
                          </Badge>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span>Members Can Invite Others</span>
                          <Badge variant={community.allowMemberInvites ? "default" : "secondary"}>
                            {community.allowMemberInvites ? "Yes" : "No"}
                          </Badge>
                        </div>
                      </div>
                    </div>

                    <div className="pt-4">
                      {isAdmin ? (
                        <Button
                          variant="destructive"
                          className="w-full gap-2"
                          onClick={() => setDeleteDialogOpen(true)}
                        >
                          <Trash2 className="w-4 h-4" />
                          Delete Community
                        </Button>
                      ) : (
                        <Button
                          variant="outline"
                          className="w-full gap-2 text-destructive hover:bg-destructive hover:text-destructive-foreground"
                          onClick={() => setLeaveDialogOpen(true)}
                        >
                          <LogOut className="w-4 h-4" />
                          Leave Community
                        </Button>
                      )}
                    </div>
                  </div>
                </>
              ) : (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Community Name</Label>
                    <Input
                      value={editFormData.name}
                      onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Logo</Label>
                    <div className="flex items-center gap-3 flex-wrap">
                      {editFormData.icon && (editFormData.icon.startsWith('http') || editFormData.icon.startsWith('data:')) ? (
                        <img src={editFormData.icon} alt="Logo Preview" className="w-16 h-16 rounded object-cover border" />
                      ) : (
                        <div className="w-16 h-16 rounded bg-muted flex items-center justify-center text-2xl">{editFormData.icon || '👥'}</div>
                      )}
                      <Input type="file" accept="image/*" onChange={(e) => setLogoFile(e.target.files?.[0] || null)} className="max-w-xs" />
                      <Button variant="outline" size="sm" onClick={handleUploadIcon} disabled={!logoFile || uploadingLogo}>
                        {uploadingLogo ? 'Uploading...' : 'Upload Logo'}
                      </Button>
                      {editFormData.icon && (editFormData.icon.startsWith('http') || editFormData.icon.startsWith('data:')) && (
                        <Button variant="ghost" size="sm" onClick={() => setEditFormData({ ...editFormData, icon: '' })}>Remove</Button>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground">Upload a square image to use as your community logo.</p>
                  </div>

                  <div className="space-y-2">
                    <Label>Category</Label>
                    <Select
                      value={editFormData.category}
                      onValueChange={(value) => setEditFormData({ ...editFormData, category: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
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

                  <div className="space-y-2">
                    <Label>Description</Label>
                    <Textarea
                      value={editFormData.description}
                      onChange={(e) => setEditFormData({ ...editFormData, description: e.target.value })}
                      rows={4}
                    />
                  </div>

                  <div className="space-y-4 p-4 rounded-lg bg-muted/50">
                    <div className="flex items-center justify-between">
                      <Label>Private Community</Label>
                      <Switch
                        checked={editFormData.isPrivate}
                        onCheckedChange={(checked) => setEditFormData({ ...editFormData, isPrivate: checked })}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label>Require Join Approval</Label>
                      <Switch
                        checked={editFormData.requireApproval}
                        onCheckedChange={(checked) => setEditFormData({ ...editFormData, requireApproval: checked })}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label>Allow Member Invites</Label>
                      <Switch
                        checked={editFormData.allowMemberInvites}
                        onCheckedChange={(checked) => setEditFormData({ ...editFormData, allowMemberInvites: checked })}
                      />
                    </div>
                  </div>

                  <div className="flex gap-2 pt-4">
                    <Button variant="outline" className="flex-1" onClick={() => setEditMode(false)}>
                      Cancel
                    </Button>
                    <Button variant="gradient" className="flex-1" onClick={handleUpdateCommunity}>
                      Save Changes
                    </Button>
                  </div>
                </div>
              )}
            </TabsContent>

            <TabsContent value="members" className="space-y-3 mt-4">
              {isAdmin && pendingRequests.length > 0 && (
                <>
                  <div className="mb-4 p-3 rounded-lg bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800">
                    <h3 className="font-semibold text-sm mb-3">Pending Join Requests ({pendingRequests.length})</h3>
                    <div className="space-y-2">
                      {pendingRequests.map((request) => (
                        <div key={request._id} className="flex items-center justify-between p-2 rounded-lg bg-white dark:bg-slate-800">
                          <div className="flex items-center gap-3 flex-1">
                            <Avatar className="w-8 h-8">
                              <AvatarFallback className="bg-primary/10 text-primary text-xs">
                                {getInitials(request.userName)}
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex-1 min-w-0">
                              <p className="font-medium text-sm">{request.userName}</p>
                              <p className="text-xs text-muted-foreground truncate">{request.userEmail}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-7 px-2 text-success hover:bg-success hover:text-white"
                              onClick={() => handleApproveRequest(request.userEmail)}
                            >
                              Approve
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-7 px-2 text-destructive hover:bg-destructive hover:text-white"
                              onClick={() => handleRejectRequest(request.userEmail)}
                            >
                              Reject
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="border-t pt-3" />
                </>
              )}
              
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold text-sm">Members ({members.length})</h3>
                {isAdmin && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-7 px-2 text-xs gap-1"
                    onClick={() => setAddMemberDialogOpen(true)}
                  >
                    <Plus className="w-3 h-3" />
                    Add Member
                  </Button>
                )}
              </div>

              <ScrollArea className="h-[300px]">
                {members.map((member) => (
                  <div key={member._id} className="flex items-center justify-between p-3 rounded-lg hover:bg-muted/50">
                    <div className="flex items-center gap-3">
                      <Avatar className="w-10 h-10">
                        <AvatarFallback className="bg-primary/10 text-primary">
                          {getInitials(member.userName)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">{member.userName}</p>
                        <p className="text-xs text-muted-foreground">{member.userEmail}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {member.userEmail === community.createdBy && (
                        <Badge variant="default" className="gap-1">
                          <Shield className="w-3 h-3" />
                          Admin
                        </Badge>
                      )}
                      {isAdmin && member.userEmail !== community.createdBy && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-destructive hover:bg-destructive hover:text-destructive-foreground"
                          onClick={() => handleRemoveMember(member.userEmail)}
                        >
                          <UserMinus className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </ScrollArea>
            </TabsContent>

            {isAdmin && (
              <TabsContent value="manage" className="space-y-4 mt-4">
                <div className="p-4 rounded-lg bg-destructive/10 border border-destructive/20">
                  <h3 className="font-semibold text-destructive mb-2">Danger Zone</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Once you delete a community, there is no going back. All messages and members will be removed.
                  </p>
                  <Button variant="destructive" onClick={() => setDeleteDialogOpen(true)}>
                    Delete Community
                  </Button>
                </div>
              </TabsContent>
            )}
          </Tabs>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the community,
              remove all members, and delete all messages.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteCommunity}>
              Delete Community
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Leave Confirmation Dialog */}
      <AlertDialog open={leaveDialogOpen} onOpenChange={setLeaveDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Leave Community?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to leave this community? You can join again later if you change your mind.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleLeaveCommunity} className="bg-destructive hover:bg-destructive/90">
              Leave Community
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Add Member Dialog */}
      <Dialog open={addMemberDialogOpen} onOpenChange={setAddMemberDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Member to Community</DialogTitle>
            <DialogDescription>
              Directly add a user to your community
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="memberEmail">Email Address</Label>
              <Input
                id="memberEmail"
                placeholder="user@example.com"
                type="email"
                value={addMemberForm.userEmail}
                onChange={(e) => setAddMemberForm({ ...addMemberForm, userEmail: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="memberName">Full Name</Label>
              <Input
                id="memberName"
                placeholder="John Doe"
                value={addMemberForm.userName}
                onChange={(e) => setAddMemberForm({ ...addMemberForm, userName: e.target.value })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setAddMemberForm({ userEmail: "", userName: "" });
                setAddMemberDialogOpen(false);
              }}
            >
              Cancel
            </Button>
            <Button
              variant="gradient"
              onClick={handleAddMember}
              disabled={addingMember || !addMemberForm.userEmail || !addMemberForm.userName}
            >
              {addingMember ? "Adding..." : "Add Member"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CommunityChat;
