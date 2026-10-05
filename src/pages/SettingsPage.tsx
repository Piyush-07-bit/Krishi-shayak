import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { 
  Settings, 
  User,
  Bell,
  Moon,
  Sun,
  Globe,
  Shield,
  Download,
  Trash2,
  ArrowLeft,
  Camera,
  Save
} from "lucide-react";
import { Link } from "react-router-dom";
import { useTheme } from "next-themes";
import { useToast } from "@/hooks/use-toast";

const SettingsPage = () => {
  const { theme, setTheme } = useTheme();
  const { toast } = useToast();
  const [user, setUser] = useState<any>(null);
  const [settings, setSettings] = useState({
    notifications: {
      weather: true,
      pest: true,
      market: false,
      community: true,
      schemes: true
    },
    accessibility: {
      largeText: false,
      highContrast: false,
      screenReader: false
    },
    privacy: {
      profileVisible: true,
      locationSharing: true,
      dataCollection: false
    },
    language: "en"
  });

  useEffect(() => {
    const userData = localStorage.getItem("digital-krishi-user");
    if (userData) {
      setUser(JSON.parse(userData));
    }
    
    // Load settings from localStorage
    const savedSettings = localStorage.getItem("digital-krishi-settings");
    if (savedSettings) {
      setSettings(JSON.parse(savedSettings));
    }
  }, []);

  const saveSettings = () => {
    localStorage.setItem("digital-krishi-settings", JSON.stringify(settings));
    toast({
      title: "Settings Saved",
      description: "Your preferences have been updated successfully"
    });
  };

  const updateSetting = (category: string, key: string, value: any) => {
    if (category === "") {
      setSettings(prev => ({ ...prev, [key]: value }));
    } else {
      setSettings(prev => ({
        ...prev,
        [category]: {
          ...(prev[category as keyof typeof prev] as any),
          [key]: value
        }
      }));
    }
  };

  const exportData = () => {
    const data = {
      user,
      settings,
      exportDate: new Date().toISOString()
    };
    
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(data, null, 2));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", "digital-krishi-data.json");
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
    
    toast({
      title: "Data Exported",
      description: "Your data has been exported successfully"
    });
  };

  const clearAllData = () => {
    if (window.confirm("Are you sure you want to clear all data? This action cannot be undone.")) {
      localStorage.removeItem("digital-krishi-settings");
      localStorage.removeItem("farm-diary-entries");
      toast({
        title: "Data Cleared",
        description: "All local data has been cleared"
      });
    }
  };

  if (!user) {
    return <div className="min-h-screen bg-background p-4">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto p-4 max-w-4xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-4">
            <Button variant="ghost" size="sm" asChild>
              <Link to="/dashboard">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Link>
            </Button>
            <h1 className="text-2xl font-bold text-foreground">Settings</h1>
          </div>
          <Button onClick={saveSettings} className="gradient-primary text-primary-foreground">
            <Save className="h-4 w-4 mr-2" />
            Save Changes
          </Button>
        </div>

        <div className="space-y-6">
          {/* Profile Settings */}
          <Card className="agricultural-card">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <User className="h-5 w-5" />
                <span>Profile Settings</span>
              </CardTitle>
              <CardDescription>Manage your personal information</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-4">
                <Avatar className="h-20 w-20">
                  <AvatarImage src={user.profilePhoto} />
                  <AvatarFallback>{user.fullName?.charAt(0)}</AvatarFallback>
                </Avatar>
                <Button variant="outline" size="sm">
                  <Camera className="h-4 w-4 mr-2" />
                  Change Photo
                </Button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="fullName">Full Name</Label>
                  <Input id="fullName" value={user.fullName || "Not provided"} readOnly />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input id="phone" value={user.phone} readOnly />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" value={user.email || "Not provided"} readOnly />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="city">City</Label>
                  <Input id="city" value={user.city || "Not provided"} readOnly />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="state">State</Label>
                  <Input id="state" value={user.state || "Not provided"} readOnly />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Theme & Display */}
          <Card className="agricultural-card">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                {theme === "dark" ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
                <span>Theme & Display</span>
              </CardTitle>
              <CardDescription>Customize your app appearance</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label>Dark Mode</Label>
                  <p className="text-sm text-muted-foreground">Toggle between light and dark theme</p>
                </div>
                <Switch 
                  checked={theme === "dark"} 
                  onCheckedChange={() => setTheme(theme === "dark" ? "light" : "dark")}
                />
              </div>
              
              <Separator />
              
              {/* Accessibility section removed as requested */}
            </CardContent>
          </Card>

          {/* Language & Region card removed as requested */}

          {/* Notifications */}
          <Card className="agricultural-card">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Bell className="h-5 w-5" />
                <span>Notifications</span>
              </CardTitle>
              <CardDescription>Choose what notifications you want to receive</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label>Weather Alerts</Label>
                  <p className="text-sm text-muted-foreground">Get notified about weather changes and alerts</p>
                </div>
                <Switch 
                  checked={settings.notifications.weather}
                  onCheckedChange={(checked) => updateSetting("notifications", "weather", checked)}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <Label>Pest Warnings</Label>
                  <p className="text-sm text-muted-foreground">Receive pest and disease alerts</p>
                </div>
                <Switch 
                  checked={settings.notifications.pest}
                  onCheckedChange={(checked) => updateSetting("notifications", "pest", checked)}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <Label>Market Updates</Label>
                  <p className="text-sm text-muted-foreground">Price updates and market trends</p>
                </div>
                <Switch 
                  checked={settings.notifications.market}
                  onCheckedChange={(checked) => updateSetting("notifications", "market", checked)}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <Label>Community Activity</Label>
                  <p className="text-sm text-muted-foreground">New posts and replies in community</p>
                </div>
                <Switch 
                  checked={settings.notifications.community}
                  onCheckedChange={(checked) => updateSetting("notifications", "community", checked)}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <Label>Government Schemes</Label>
                  <p className="text-sm text-muted-foreground">New schemes and deadlines</p>
                </div>
                <Switch 
                  checked={settings.notifications.schemes}
                  onCheckedChange={(checked) => updateSetting("notifications", "schemes", checked)}
                />
              </div>
            </CardContent>
          </Card>

          {/* Privacy & Security */}
          <Card className="agricultural-card">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Shield className="h-5 w-5" />
                <span>Privacy & Security</span>
              </CardTitle>
              <CardDescription>Control your privacy and data sharing</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label>Profile Visibility</Label>
                  <p className="text-sm text-muted-foreground">Make your profile visible to other farmers</p>
                </div>
                <Switch 
                  checked={settings.privacy.profileVisible}
                  onCheckedChange={(checked) => updateSetting("privacy", "profileVisible", checked)}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <Label>Location Sharing</Label>
                  <p className="text-sm text-muted-foreground">Share location for better weather and market data</p>
                </div>
                <Switch 
                  checked={settings.privacy.locationSharing}
                  onCheckedChange={(checked) => updateSetting("privacy", "locationSharing", checked)}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <Label>Usage Analytics</Label>
                  <p className="text-sm text-muted-foreground">Help improve the app by sharing usage data</p>
                </div>
                <Switch 
                  checked={settings.privacy.dataCollection}
                  onCheckedChange={(checked) => updateSetting("privacy", "dataCollection", checked)}
                />
              </div>
            </CardContent>
          </Card>

          {/* Data Management */}
          <Card className="agricultural-card">
            <CardHeader>
              <CardTitle>Data Management</CardTitle>
              <CardDescription>Export or clear your data</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-col sm:flex-row gap-4">
                <Button variant="outline" onClick={exportData} className="flex-1">
                  <Download className="h-4 w-4 mr-2" />
                  Export My Data
                </Button>
                <Button variant="destructive" onClick={clearAllData} className="flex-1">
                  <Trash2 className="h-4 w-4 mr-2" />
                  Clear All Data
                </Button>
              </div>
              
              <div className="p-4 bg-muted/30 rounded-lg">
                <p className="text-sm text-muted-foreground">
                  <strong>Note:</strong> This demo app stores data locally. In production, 
                  data would be securely stored on servers with proper backup and recovery.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;