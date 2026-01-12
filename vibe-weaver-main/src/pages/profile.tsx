import { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/layout/Navbar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  User,
  Settings,
  Mail,
  Phone,
  MapPin,
  Bell,
  Lock,
  LogOut,
  CheckCircle,
  Building2,
  Calendar,
  Receipt,
  Camera as CameraIcon,
} from "lucide-react";
import { API_URL } from "@/lib/api";
import { pickImageWithPrompt } from "@/lib/imagePicker";
import { uploadSingleImage } from "@/lib/uploadHelper";

const Profile = () => {
  const apiBase = API_URL;
  const navigate = useNavigate();
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Settings state - MUST be initialized before useEffect
  const [settings, setSettings] = useState({
    emailNotifications: true,
    pushNotifications: false,
    eventReminders: true,
    communityUpdates: true,
    weeklyDigest: true,
    darkMode: false,
  });

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [passwordError, setPasswordError] = useState("");

  // Profile data state
  const [profileData, setProfileData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    location: "",
    bio: "",
    profileImage: "",
  });
  const [profileImageFile, setProfileImageFile] = useState<File | null>(null);
  const [uploadingProfileImage, setUploadingProfileImage] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deletePassword, setDeletePassword] = useState("");
  const [deleteError, setDeleteError] = useState("");
  const [deleting, setDeleting] = useState(false);

  // My venues and events state
  const [myVenues, setMyVenues] = useState([]);
  const [myEvents, setMyEvents] = useState([]);
  const [hasApprovedContent, setHasApprovedContent] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      setLoading(true);
      setError("");
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          setError("Not authenticated");
          setLoading(false);
          return;
        }
        const resp = await axios.get(`${apiBase}/auth/profile`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (resp.data && resp.data.user) {
          setProfileData(resp.data.user);
          if (resp.data.settings) {
            setSettings((prev) => ({ ...prev, ...resp.data.settings }));
          }
        } else {
          setError("Profile data not found");
        }

        // Fetch user's approved venues and events
        try {
          const venuesResp = await axios.get(`${apiBase}/host/my-requests`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          const eventsResp = await axios.get(`${apiBase}/host/my-events`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          
          setMyVenues(venuesResp.data || []);
          setMyEvents(eventsResp.data || []);
          setHasApprovedContent((venuesResp.data?.length > 0) || (eventsResp.data?.length > 0));
        } catch (venueErr) {
          console.error("Error fetching user venues/events:", venueErr);
          // Don't set error, just continue without showing venues/events tab
        }
      } catch (err: any) {
        setError(err?.response?.data?.error || "Failed to load profile");
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const handleProfileChange = (field: string, value: string) => {
    setProfileData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSettingChange = (setting: string) => {
    setSettings((prev) => ({ ...prev, [setting]: !prev[setting] }));
  };

  const handlePasswordChange = (field: string, value: string) => {
    setPasswordForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSaveProfile = async () => {
    setSaving(true);
    setError("");
    try {
      const token = localStorage.getItem("token");
      const resp = await axios.put(`${apiBase}/auth/profile`, profileData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (resp.data) {
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 3000);
      }
    } catch (err: any) {
      setError(err?.response?.data?.error || "Failed to save profile");
    } finally {
      setSaving(false);
    }
  };

  const handleSelectProfilePhoto = async () => {
    try {
      const file = await pickImageWithPrompt();
      if (file) {
        setProfileImageFile(file);
        // Automatically upload after selection
        handleUploadProfilePhoto(file);
      }
    } catch (err: any) {
      console.error("Error selecting image:", err);
      setError("Failed to select image");
      setTimeout(() => setError(""), 3000);
    }
  };

  const handleUploadProfilePhoto = async (fileToUpload?: File) => {
    const file = fileToUpload || profileImageFile;
    if (!file) {
      setError("Please select a photo to upload");
      setTimeout(() => setError(""), 3000);
      return;
    }
    setUploadingProfileImage(true);
    setError("");
    try {
      const token = localStorage.getItem("token");
      
      // Upload using native fetch to avoid CapacitorHttp issues
      const url = await uploadSingleImage(file);

      const saveResp = await axios.put(
        `${apiBase}/auth/profile`,
        { profileImage: url },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (saveResp.data) {
        setProfileData((prev) => ({ ...prev, profileImage: url }));
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 3000);
        setProfileImageFile(null);
      }
    } catch (err: any) {
      setError(err?.response?.data?.error || err?.message || "Failed to upload profile photo");
      setTimeout(() => setError(""), 4000);
    } finally {
      setUploadingProfileImage(false);
    }
  };

  const handleSaveSettings = async () => {
    setSaving(true);
    setError("");
    try {
      const token = localStorage.getItem("token");
      const resp = await axios.put(`${apiBase}/auth/settings`, settings, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (resp.data) {
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 3000);
      }
    } catch (err: any) {
      setError(err?.response?.data?.error || "Failed to save settings");
    } finally {
      setSaving(false);
    }
  };

  const handleUpdatePassword = async () => {
    setPasswordError("");
    if (!passwordForm.currentPassword || !passwordForm.newPassword) {
      setPasswordError("Current and new passwords are required");
      return;
    }
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setPasswordError("New password and confirmation do not match");
      return;
    }
    if (passwordForm.newPassword.length < 6) {
      setPasswordError("Password must be at least 6 characters");
      return;
    }
    setSaving(true);
    try {
      const token = localStorage.getItem("token");
      await axios.put(
        `${apiBase}/auth/password`,
        {
          currentPassword: passwordForm.currentPassword,
          newPassword: passwordForm.newPassword,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
      setPasswordForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
      setPasswordError("");
    } catch (err: any) {
      setPasswordError(err?.response?.data?.error || "Failed to update password. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/auth");
  };

  const handleDeleteAccount = async () => {
    setDeleteError("");
    if (!deletePassword) {
      setDeleteError("Password is required");
      return;
    }
    setDeleting(true);
    try {
      const token = localStorage.getItem("token");
      await axios.delete(`${apiBase}/auth/account`, {
        headers: { Authorization: `Bearer ${token}` },
        data: { password: deletePassword },
      });
      setDeleteOpen(false);
      localStorage.removeItem("token");
      navigate("/auth");
    } catch (err: any) {
      setDeleteError(err?.response?.data?.error || "Failed to delete account. Please try again.");
    } finally {
      setDeleting(false);
    }
  };



  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Navbar />
        <span>Loading profile...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Navbar />
        <span className="text-red-500">{error}</span>
      </div>
    );
  }

  // Prevent reading properties of undefined
  if (!profileData || typeof profileData !== 'object') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Navbar />
        <span className="text-red-500">Profile data is unavailable.</span>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-20 pb-12">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="mb-8 flex items-start justify-between">
            <div>
              <h1 className="text-4xl font-bold mb-2 gradient-text">
                My Profile
              </h1>
              <p className="text-muted-foreground">
                Manage your account and preferences
              </p>
            </div>
            <Button 
              onClick={() => navigate('/bookings')}
              variant="outline"
              className="gap-2"
            >
              <Receipt className="w-4 h-4" />
              Booking History
            </Button>
          </div>

          {saveSuccess && (
            <Alert className="mb-6 bg-green-50 border-green-200">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-800">
                Changes saved successfully!
              </AlertDescription>
            </Alert>
          )}

          <Tabs defaultValue="profile" className="w-full">
            <TabsList className={`grid w-full ${hasApprovedContent ? 'grid-cols-4' : 'grid-cols-3'} mb-6`}>
              <TabsTrigger value="profile" className="gap-2">
                <User className="w-4 h-4" />
                <span className="hidden sm:inline">Profile</span>
              </TabsTrigger>
              <TabsTrigger value="settings" className="gap-2">
                <Settings className="w-4 h-4" />
                <span className="hidden sm:inline">Settings</span>
              </TabsTrigger>
              <TabsTrigger value="security" className="gap-2">
                <Lock className="w-4 h-4" />
                <span className="hidden sm:inline">Security</span>
              </TabsTrigger>
              {hasApprovedContent && (
                <TabsTrigger value="my-content" className="gap-2">
                  <Building2 className="w-4 h-4" />
                  <span className="hidden sm:inline">My Content</span>
                </TabsTrigger>
              )}
            </TabsList>

            {/* Profile Tab */}
            <TabsContent value="profile" className="space-y-6">
              <Card className="p-6">
                <h2 className="text-2xl font-semibold mb-6">
                  Profile Information
                </h2>

                <div className="space-y-6">
                  {/* Avatar Section */}
                  <div className="flex items-center gap-6">
                    {profileData.profileImage ? (
                      <img
                        src={profileData.profileImage}
                        alt="Profile"
                        className="w-24 h-24 rounded-full object-cover border"
                      />
                    ) : (
                      <div className="w-24 h-24 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
                        <span className="text-3xl font-bold text-white">
                          {profileData.firstName?.[0] || ""}
                          {profileData.lastName?.[0] || ""}
                        </span>
                      </div>
                    )}
                    <div>
                      <h3 className="text-lg font-semibold mb-2">
                        Profile Picture
                      </h3>
                      <div className="flex items-center gap-3">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={handleSelectProfilePhoto}
                          disabled={uploadingProfileImage}
                          className="flex items-center gap-2"
                        >
                          <CameraIcon className="w-4 h-4" />
                          {uploadingProfileImage ? "Uploading..." : "Choose Photo"}
                        </Button>
                        {profileImageFile && (
                          <span className="text-sm text-muted-foreground">
                            {profileImageFile.name}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Name Fields */}
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="firstName">First Name</Label>
                      <Input
                        id="firstName"
                        value={profileData.firstName}
                        onChange={(e) =>
                          handleProfileChange("firstName", e.target.value)
                        }
                        placeholder="First name"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="lastName">Last Name</Label>
                      <Input
                        id="lastName"
                        value={profileData.lastName}
                        onChange={(e) =>
                          handleProfileChange("lastName", e.target.value)
                        }
                        placeholder="Last name"
                      />
                    </div>
                  </div>

                  {/* Email */}
                  <div className="space-y-2">
                    <Label htmlFor="email" className="flex items-center gap-2">
                      <Mail className="w-4 h-4" />
                      Email Address
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      value={profileData.email}
                      onChange={(e) =>
                        handleProfileChange("email", e.target.value)
                      }
                      placeholder="Email address"
                    />
                  </div>

                  {/* Phone */}
                  <div className="space-y-2">
                    <Label htmlFor="phone" className="flex items-center gap-2">
                      <Phone className="w-4 h-4" />
                      Phone Number
                    </Label>
                    <Input
                      id="phone"
                      type="tel"
                      value={profileData.phone}
                      onChange={(e) =>
                        handleProfileChange("phone", e.target.value)
                      }
                      placeholder="Phone number"
                    />
                  </div>

                  {/* Location */}
                  <div className="space-y-2">
                    <Label htmlFor="location" className="flex items-center gap-2">
                      <MapPin className="w-4 h-4" />
                      Location
                    </Label>
                    <Input
                      id="location"
                      value={profileData.location}
                      onChange={(e) =>
                        handleProfileChange("location", e.target.value)
                      }
                      placeholder="City, Country"
                    />
                  </div>

                  {/* Bio */}
                  <div className="space-y-2">
                    <Label htmlFor="bio">Bio</Label>
                    <textarea
                      id="bio"
                      value={profileData.bio}
                      onChange={(e) =>
                        handleProfileChange("bio", e.target.value)
                      }
                      placeholder="Tell us about yourself"
                      className="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground"
                      rows={4}
                    />
                  </div>

                  <Button
                    onClick={handleSaveProfile}
                    disabled={saving}
                    className="w-full bg-gradient-to-r from-primary to-secondary"
                  >
                    {saving ? "Saving..." : "Save Profile Changes"}
                  </Button>
                </div>
              </Card>

              <Card className="p-6 bg-gradient-to-br from-primary/5 to-secondary/5 border-primary/20">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center flex-shrink-0">
                    <Building2 className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold mb-2">
                      Become a Venue Host
                    </h3>
                    <p className="text-muted-foreground mb-4">
                      Register your venue and start hosting amazing events. Reach thousands of attendees and grow your business.
                    </p>
                    <Button
                      onClick={() => navigate("/host-registration")}
                      variant="outline"
                      className="gap-2 border-primary/30 hover:bg-primary/10"
                    >
                      <Building2 className="w-4 h-4" />
                      Register Your Venue
                    </Button>
                  </div>
                </div>
              </Card>
            </TabsContent>

            {/* Settings Tab */}
            <TabsContent value="settings" className="space-y-6">
              <Card className="p-6">
                <h2 className="text-2xl font-semibold mb-6">
                  Notification Settings
                </h2>

                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 rounded-lg border border-border/50 hover:border-border transition-colors">
                    <div className="flex items-center gap-3">
                      <Mail className="w-5 h-5 text-muted-foreground" />
                      <div>
                        <p className="font-semibold">Email Notifications</p>
                        <p className="text-sm text-muted-foreground">
                          Receive email updates about your account
                        </p>
                      </div>
                    </div>
                    <Switch
                      checked={settings.emailNotifications}
                      onCheckedChange={() =>
                        handleSettingChange("emailNotifications")
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between p-4 rounded-lg border border-border/50 hover:border-border transition-colors">
                    <div className="flex items-center gap-3">
                      <Bell className="w-5 h-5 text-muted-foreground" />
                      <div>
                        <p className="font-semibold">Push Notifications</p>
                        <p className="text-sm text-muted-foreground">
                          Get push notifications on your device
                        </p>
                      </div>
                    </div>
                    <Switch
                      checked={settings.pushNotifications}
                      onCheckedChange={() =>
                        handleSettingChange("pushNotifications")
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between p-4 rounded-lg border border-border/50 hover:border-border transition-colors">
                    <div className="flex items-center gap-3">
                      <Bell className="w-5 h-5 text-muted-foreground" />
                      <div>
                        <p className="font-semibold">Event Reminders</p>
                        <p className="text-sm text-muted-foreground">
                          Get reminded about upcoming events
                        </p>
                      </div>
                    </div>
                    <Switch
                      checked={settings.eventReminders}
                      onCheckedChange={() =>
                        handleSettingChange("eventReminders")
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between p-4 rounded-lg border border-border/50 hover:border-border transition-colors">
                    <div className="flex items-center gap-3">
                      <User className="w-5 h-5 text-muted-foreground" />
                      <div>
                        <p className="font-semibold">Community Updates</p>
                        <p className="text-sm text-muted-foreground">
                          Stay informed about community activities
                        </p>
                      </div>
                    </div>
                    <Switch
                      checked={settings.communityUpdates}
                      onCheckedChange={() =>
                        handleSettingChange("communityUpdates")
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between p-4 rounded-lg border border-border/50 hover:border-border transition-colors">
                    <div className="flex items-center gap-3">
                      <Mail className="w-5 h-5 text-muted-foreground" />
                      <div>
                        <p className="font-semibold">Weekly Digest</p>
                        <p className="text-sm text-muted-foreground">
                          Get a weekly summary of events
                        </p>
                      </div>
                    </div>
                    <Switch
                      checked={settings.weeklyDigest}
                      onCheckedChange={() =>
                        handleSettingChange("weeklyDigest")
                      }
                    />
                  </div>
                </div>
              </Card>

              <Card className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-semibold">Display Settings</h2>
                  <Button 
                    onClick={handleSaveSettings}
                    disabled={saving}
                    size="sm"
                    className="bg-gradient-to-r from-primary to-secondary"
                  >
                    {saving ? "Saving..." : "Save Settings"}
                  </Button>
                </div>

                <div className="flex items-center justify-between p-4 rounded-lg border border-border/50 hover:border-border transition-colors">
                  <div>
                    <p className="font-semibold">Dark Mode</p>
                    <p className="text-sm text-muted-foreground">
                      Toggle dark theme for the interface
                    </p>
                  </div>
                  <Switch
                    checked={settings.darkMode}
                    onCheckedChange={() => handleSettingChange("darkMode")}
                  />
                </div>
              </Card>
            </TabsContent>

            {/* Security Tab */}
            <TabsContent value="security" className="space-y-6">
              <Card className="p-6">
                <h2 className="text-2xl font-semibold mb-6">
                  Password & Security
                </h2>

                {passwordError && (
                  <Alert className="mb-4 border-red-200 bg-red-50 text-red-800">
                    <AlertDescription>{passwordError}</AlertDescription>
                  </Alert>
                )}

                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="current-password">Current Password</Label>
                    <Input
                      id="current-password"
                      type="password"
                      value={passwordForm.currentPassword}
                      onChange={(e) => handlePasswordChange("currentPassword", e.target.value)}
                      placeholder="Enter your current password"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="new-password">New Password</Label>
                    <Input
                      id="new-password"
                      type="password"
                      value={passwordForm.newPassword}
                      onChange={(e) => handlePasswordChange("newPassword", e.target.value)}
                      placeholder="Enter new password"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="confirm-password">Confirm Password</Label>
                    <Input
                      id="confirm-password"
                      type="password"
                      value={passwordForm.confirmPassword}
                      onChange={(e) => handlePasswordChange("confirmPassword", e.target.value)}
                      placeholder="Confirm new password"
                    />
                  </div>

                  <Button
                    onClick={handleUpdatePassword}
                    disabled={saving}
                    className="w-full bg-gradient-to-r from-primary to-secondary"
                  >
                    {saving ? "Updating..." : "Update Password"}
                  </Button>
                </div>
              </Card>

              <Card className="p-6">
                <h2 className="text-2xl font-semibold mb-6">Danger Zone</h2>

                <div className="space-y-3">
                  <Button
                    variant="outline"
                    className="w-full justify-start gap-2 text-red-600 hover:text-red-700 hover:bg-red-50"
                    onClick={handleLogout}
                  >
                    <LogOut className="w-4 h-4" />
                    Logout
                  </Button>
                  <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
                    <AlertDialogTrigger asChild>
                      <Button
                        variant="outline"
                        className="w-full justify-start gap-2 text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        Delete Account
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Delete account?</AlertDialogTitle>
                        <AlertDialogDescription>
                          This action is permanent and will remove all of your data. Please confirm and enter your password to proceed.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      {deleteError && (
                        <Alert className="border-red-200 bg-red-50 text-red-800">
                          <AlertDescription>{deleteError}</AlertDescription>
                        </Alert>
                      )}
                      <div className="space-y-2">
                        <Label htmlFor="delete-password">Password</Label>
                        <Input
                          id="delete-password"
                          type="password"
                          value={deletePassword}
                          onChange={(e) => setDeletePassword(e.target.value)}
                          placeholder="Enter your password"
                        />
                      </div>
                      <AlertDialogFooter>
                        <AlertDialogCancel disabled={deleting}>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={(e) => {
                            e.preventDefault();
                            handleDeleteAccount();
                          }}
                          className="bg-red-600 hover:bg-red-700"
                          disabled={deleting}
                        >
                          {deleting ? "Deleting..." : "Delete"}
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </Card>
            </TabsContent>

            {/* My Venues and Events Tab */}
            {hasApprovedContent && (
              <TabsContent value="my-content" className="space-y-6">
                {myVenues.length > 0 && (
                  <Card className="p-6">
                    <h2 className="text-2xl font-semibold mb-6 flex items-center gap-2">
                      <Building2 className="w-6 h-6" />
                      My Venues
                    </h2>
                    <div className="grid md:grid-cols-2 gap-4">
                      {myVenues.map((venue: any) => (
                        <div
                          key={venue._id}
                          className="border rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
                          onClick={() => navigate(`/venue/${venue._id}`)}
                        >
                          <div className="flex items-start justify-between mb-2">
                            <h3 className="font-semibold text-lg">{venue.venueName}</h3>
                            <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">
                              Approved
                            </span>
                          </div>
                          <div className="space-y-1 text-sm text-muted-foreground">
                            <p><span className="font-medium">Type:</span> {venue.businessType}</p>
                            <p><span className="font-medium">City:</span> {venue.city}</p>
                            {venue.address && <p><span className="font-medium">Address:</span> {venue.address}</p>}
                            {venue.website && (
                              <p>
                                <span className="font-medium">Website:</span>{" "}
                                <a 
                                  href={venue.website} 
                                  target="_blank" 
                                  rel="noreferrer" 
                                  className="text-primary hover:underline"
                                  onClick={(e) => e.stopPropagation()}
                                >
                                  {venue.website}
                                </a>
                              </p>
                            )}
                            <p className="text-xs pt-2">Submitted: {new Date(venue.createdAt).toLocaleDateString()}</p>
                          </div>
                          <div className="mt-3 pt-3 border-t">
                            <p className="text-xs text-primary font-medium">Click to manage this venue →</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </Card>
                )}

                {myEvents.length > 0 && (
                  <Card className="p-6">
                    <h2 className="text-2xl font-semibold mb-6 flex items-center gap-2">
                      <Calendar className="w-6 h-6" />
                      My Events
                    </h2>
                    <div className="grid md:grid-cols-2 gap-4">
                      {myEvents.map((event: any) => (
                        <div
                          key={event._id}
                          className="border rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
                          onClick={() => navigate(`/event/${event._id}`)}
                        >
                          <div className="flex items-start justify-between mb-2">
                            <h3 className="font-semibold text-lg">{event.title}</h3>
                            <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">
                              Approved
                            </span>
                          </div>
                          {event.image && (
                            <img 
                              src={event.image} 
                              alt={event.title} 
                              className="w-full h-32 object-cover rounded-md mb-3"
                            />
                          )}
                          <div className="space-y-1 text-sm text-muted-foreground">
                            <p><span className="font-medium">Category:</span> {event.category}</p>
                            <p><span className="font-medium">Location:</span> {event.location}</p>
                            <p><span className="font-medium">Date:</span> {new Date(event.date).toLocaleDateString()}</p>
                            {event.startTime && <p><span className="font-medium">Time:</span> {event.startTime} - {event.endTime}</p>}
                            {event.capacity > 0 && <p><span className="font-medium">Capacity:</span> {event.capacity}</p>}
                            <p><span className="font-medium">Price:</span> {event.price > 0 ? `₹${event.price}` : 'Free'}</p>
                            <p className="text-xs pt-2 line-clamp-2">{event.description}</p>
                            <p className="text-xs pt-1">Submitted: {new Date(event.createdAt).toLocaleDateString()}</p>
                          </div>
                          <div className="mt-3 pt-3 border-t">
                            <p className="text-xs text-primary font-medium">Click to manage this event →</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </Card>
                )}

                {myVenues.length === 0 && myEvents.length === 0 && (
                  <Card className="p-12 text-center">
                    <p className="text-muted-foreground">No approved venues or events yet.</p>
                  </Card>
                )}
              </TabsContent>
            )}
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default Profile;
