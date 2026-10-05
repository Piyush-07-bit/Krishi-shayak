import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  MessageCircle, 
  Camera, 
  CloudRain, 
  TrendingUp, 
  FileText, 
  Users, 
  BookOpen, 
  Settings,
  Bell,
  Menu,
  X,
  Home,
  User,
  LogOut
} from "lucide-react";
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Link, useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/services/supabase";

const Dashboard = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    // Get current session user from Supabase
    const getUserProfile = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate("/login");
        return;
      }
      // Fetch user profile from Supabase users table
      const { data: userProfile } = await supabase.from('users').select('*').eq('id', user.id).single();
      if (userProfile) {
        setUser(userProfile);
      } else {
        // If no profile, force logout
        navigate("/login");
      }
    };
    getUserProfile();
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem("digital-krishi-token");
    localStorage.removeItem("digital-krishi-user");
    toast({
      title: "Logged out",
      description: "You have been successfully logged out",
    });
    navigate("/");
  };

  const sidebarItems = [
    { icon: Home, label: "Home", href: "/dashboard", active: true },
    { icon: MessageCircle, label: "My Queries", href: "/queries", count: 3 },
    { icon: Camera, label: "Upload Image", href: "/analyze" },
    { icon: CloudRain, label: "Weather", href: "/weather" },
    { icon: TrendingUp, label: "Market Prices", href: "/market" },
    { icon: FileText, label: "Schemes", href: "/schemes" },
    { icon: BookOpen, label: "Farm Diary", href: "/diary" },
    { icon: Users, label: "Community", href: "/community", count: 12 },
    { icon: Settings, label: "Settings", href: "/settings" },
  ];

  const quickStats = [
    { label: "Pending Queries", value: "3", change: "+2", trend: "up" },
    { label: "Weather Alerts", value: "1", change: "New", trend: "warning" },
    { label: "Market Updates", value: "5", change: "Today", trend: "neutral" },
    { label: "Diary Entries", value: "24", change: "+3", trend: "up" },
  ];

  const recentActivities = [
    {
      type: "query",
      title: "Disease identification for tomato plants",
      time: "2 hours ago",
      status: "Answered"
    },
    {
      type: "weather",
      title: "Pest alert for your region",
      time: "4 hours ago",
      status: "Active"
    },
    {
      type: "market",
      title: "Price update for banana",
      time: "6 hours ago",
      status: "Updated"
    },
    {
      type: "diary",
      title: "Added irrigation log",
      time: "1 day ago",
      status: "Saved"
    }
  ];

  if (!user) {
    return <div>Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="fixed inset-0 bg-black/50" onClick={() => setSidebarOpen(false)} />
          <div className="fixed left-0 top-0 h-full w-64 bg-card border-r border-border animate-slide-in">
            <SidebarContent 
              items={sidebarItems} 
              user={user} 
              onLogout={handleLogout}
              onClose={() => setSidebarOpen(false)}
            />
          </div>
        </div>
      )}

      {/* Desktop Sidebar */}
      <div className="hidden lg:fixed lg:left-0 lg:top-0 lg:h-full lg:w-64 lg:bg-card lg:border-r lg:border-border lg:block">
        <SidebarContent 
          items={sidebarItems} 
          user={user} 
          onLogout={handleLogout}
        />
      </div>

      {/* Main Content */}
      <div className="lg:ml-64">
        {/* Top Navigation */}
        <header className="sticky top-0 z-40 bg-background/95 backdrop-blur border-b border-border">
          <div className="flex items-center justify-between p-4">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden"
              >
                <Menu className="h-5 w-5" />
              </Button>
              <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
            </div>
            
            <div className="flex items-center space-x-3">
              <Dialog open={notificationsOpen} onOpenChange={setNotificationsOpen}>
                <DialogTrigger asChild>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="relative hover:bg-muted transition-colors"
                  >
                    <Bell className="h-5 w-5" />
                    <span className="absolute -top-1 -right-1 h-3 w-3 bg-destructive rounded-full text-xs"></span>
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Notifications</DialogTitle>
                    <DialogDescription>
                      {/* You can replace this with actual notifications */}
                      No new notifications.
                    </DialogDescription>
                  </DialogHeader>
                </DialogContent>
              </Dialog>
              <Avatar className="h-8 w-8">
                <AvatarImage src={user.profilePhoto} />
                <AvatarFallback>{user.fullName?.charAt(0)}</AvatarFallback>
              </Avatar>
            </div>
          </div>
        </header>

        {/* Dashboard Content */}
        <main className="p-4 space-y-6">
          {/* Welcome Section */}
          <div className="agricultural-card gradient-primary text-primary-foreground">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold mb-1">
                  Welcome back, {user.fullName}! 🌾
                </h2>
                <p className="text-primary-foreground/80">
                  {user.city && user.state ? `${user.city}, ${user.state}` : user.city ? user.city : user.state ? user.state : ""}
                </p>
                  {/* Removed welcome message as requested */}
              </div>
              <div className="text-right">
                <p className="text-primary-foreground/80 text-sm">Today</p>
                <p className="text-lg font-semibold">
                  {new Date().toLocaleDateString()}
                </p>
              </div>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {quickStats.map((stat, index) => (
              <Card key={index} className="agricultural-card">
                <CardContent className="p-4">
                  <div className="text-center space-y-2">
                    <p className="text-2xl font-bold text-foreground">{stat.value}</p>
                    <p className="text-sm text-muted-foreground">{stat.label}</p>
                    <Badge 
                      variant={stat.trend === "warning" ? "destructive" : "secondary"}
                      className="text-xs"
                    >
                      {stat.change}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Quick Actions */}
          <Card className="agricultural-card">
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>
                Get started with your most common farming tasks
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <Button asChild className="h-auto p-4 gradient-primary text-primary-foreground">
                  <Link to="/chat" className="flex flex-col items-center space-y-2">
                    <MessageCircle className="h-6 w-6" />
                    <span className="text-sm">Ask Query</span>
                  </Link>
                </Button>
                
                <Button asChild variant="outline" className="h-auto p-4 hover:bg-muted/50 hover:border-primary/20 transition-colors">
                  <Link to="/analyze" className="flex flex-col items-center space-y-2">
                    <Camera className="h-6 w-6" />
                    <span className="text-sm">Analyze Image</span>
                  </Link>
                </Button>
                
                <Button asChild variant="outline" className="h-auto p-4">
                  <Link to="/weather" className="flex flex-col items-center space-y-2">
                    <CloudRain className="h-6 w-6" />
                    <span className="text-sm">Weather</span>
                  </Link>
                </Button>
                
                <Button asChild variant="outline" className="h-auto p-4">
                  <Link to="/market" className="flex flex-col items-center space-y-2">
                    <TrendingUp className="h-6 w-6" />
                    <span className="text-sm">Market Prices</span>
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Recent Activities */}
          <Card className="agricultural-card">
            <CardHeader>
              <CardTitle>Recent Activities</CardTitle>
              <CardDescription>
                Your latest farming activities and updates
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {recentActivities.map((activity, index) => (
                <div key={index} className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
                  <div className="flex items-center space-x-3">
                    <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
                      {activity.type === "query" && <MessageCircle className="h-4 w-4 text-primary" />}
                      {activity.type === "weather" && <CloudRain className="h-4 w-4 text-warning" />}
                      {activity.type === "market" && <TrendingUp className="h-4 w-4 text-success" />}
                      {activity.type === "diary" && <BookOpen className="h-4 w-4 text-secondary" />}
                    </div>
                    <div>
                      <p className="font-medium text-foreground">{activity.title}</p>
                      <p className="text-sm text-muted-foreground">{activity.time}</p>
                    </div>
                  </div>
                  <Badge variant="outline">{activity.status}</Badge>
                </div>
              ))}
            </CardContent>
          </Card>
        </main>
      </div>
    </div>
  );
};

// Sidebar Component
const SidebarContent = ({ 
  items, 
  user, 
  onLogout, 
  onClose 
}: { 
  items: any[], 
  user: any, 
  onLogout: () => void,
  onClose?: () => void 
}) => (
  <div className="flex flex-col h-full">
    {/* Header */}
    <div className="p-4 border-b border-border">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
              <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
                <img src="/Krishi_Sahayak_logo_main.png" alt="Krishi Sahayak Logo" className="h-7 w-7 object-contain" />
              </div>
              <span className="font-bold text-foreground">Krishi Sahayak</span>
        </div>
        {onClose && (
          <Button variant="ghost" size="sm" onClick={onClose} className="lg:hidden">
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>
    </div>

    {/* Navigation */}
  <nav className="flex-1 p-4 space-y-2 overflow-auto">
      {items.map((item, index) => (
        <Link
          key={index}
          to={item.href}
          onClick={onClose}
          className={`flex items-center justify-between p-3 rounded-lg transition-colors ${
            item.active
              ? "bg-primary text-primary-foreground"
              : "text-muted-foreground hover:text-foreground hover:bg-muted"
          }`}
        >
          <div className="flex items-center space-x-3">
            <item.icon className="h-5 w-5" />
            <span>{item.label}</span>
          </div>
          {item.count && (
            <Badge variant={item.active ? "secondary" : "outline"} className="text-xs">
              {item.count}
            </Badge>
          )}
        </Link>
      ))}
    </nav>

    {/* User Profile */}
    <div className="p-4 border-t border-border">
      <div className="flex items-center space-x-3 mb-3">
        <Avatar className="h-10 w-10">
          <AvatarImage src={user.profilePhoto} />
          <AvatarFallback>{user.fullName?.charAt(0)}</AvatarFallback>
        </Avatar>
        <div className="flex-1 min-w-0">
          <p className="font-medium text-foreground truncate">{user.fullName}</p>
          <p className="text-sm text-muted-foreground truncate">{user.phone}</p>
        </div>
      </div>
      
      <div className="space-y-2">
        <Button variant="ghost" size="sm" className="w-full justify-start">
          <User className="h-4 w-4 mr-2" />
          Profile
        </Button>
        <Button 
          variant="ghost" 
          size="sm" 
          className="w-full justify-start text-destructive hover:text-destructive"
          onClick={onLogout}
        >
          <LogOut className="h-4 w-4 mr-2" />
          Logout
        </Button>
      </div>
    </div>
  </div>
);

export default Dashboard;