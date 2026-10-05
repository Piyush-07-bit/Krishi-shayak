import { 
  MessageCircle, 
  Camera, 
  CloudRain, 
  TrendingUp, 
  FileText, 
  Users, 
  BookOpen, 
  Settings,
  Smartphone,
  Wifi,
  Globe,
  Shield
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const FeaturesSection = () => {
  const mainFeatures = [
    {
      icon: MessageCircle,
      title: "AI-Powered Chat Assistant",
      description: "Get instant answers to farming questions with our intelligent chatbot. Available 24/7 in multiple languages.",
      badge: "Popular",
      color: "text-primary"
    },
    {
      icon: Camera,
      title: "Disease Detection & Analysis",
      description: "Upload crop images for instant disease identification with treatment recommendations and local resource connections.",
      badge: "Advanced AI",
      color: "text-secondary"
    },
    {
      icon: CloudRain,
      title: "Weather & Pest Forecasting",
      description: "Accurate weather predictions, pest risk alerts, and optimal planting recommendations for your specific location.",
      badge: "Real-time",
      color: "text-success"
    },
    {
      icon: TrendingUp,
      title: "Market Intelligence",
      description: "Real-time mandi prices, trend analysis, and smart selling recommendations to maximize your profits.",
      badge: "Profitable",
      color: "text-warning"
    },
    {
      icon: FileText,
      title: "Government Schemes",
      description: "Easy access to agricultural schemes, subsidies, and benefits with eligibility checking and application guidance.",
      badge: "Government",
      color: "text-secondary"
    },
    {
      icon: BookOpen,
      title: "Farm Diary",
      description: "Digital record keeping for all your farming activities, expenses, and harvest data with analytics and insights.",
      badge: "Essential",
      color: "text-primary"
    }
  ];

  const additionalFeatures = [
    {
      icon: Users,
      title: "Community Hub",
      description: "Connect with fellow farmers, share experiences, and learn from agricultural experts in your region."
    },
    {
      icon: Smartphone,
      title: "Mobile Optimized",
      description: "Perfect mobile experience designed for use in the field, with offline capabilities and voice input."
    },
    {
      icon: Globe,
      title: "Multi-language Support",
      description: "Available in English, Hindi, Malayalam, and other regional languages with Google Translate integration."
    },
    {
      icon: Shield,
      title: "Secure & Private",
      description: "Your farming data is protected with enterprise-grade security and privacy safeguards."
    },
    {
      icon: Wifi,
      title: "Offline Capability",
      description: "Key features work offline with data sync when connection is restored, ensuring reliability in rural areas."
    },
    {
      icon: Settings,
      title: "Personalized Experience",
      description: "Customized recommendations based on your crops, location, and farming practices for maximum relevance."
    }
  ];

  return (
    <section id="features" className="py-24 bg-background">
      <div className="mx-auto max-w-7xl px-4 lg:px-6">
        {/* Section Header */}
        <div className="text-center space-y-4 mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground">
            Complete Digital Farming Solution
          </h2>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
            Everything you need to make informed farming decisions, increase productivity, 
            and connect with the agricultural ecosystem.
          </p>
        </div>

        {/* Main Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          {mainFeatures.map((feature, index) => {
            const IconComponent = feature.icon;
            return (
              <Card key={index} className="agricultural-card group hover:scale-105 transition-all duration-300">
                <CardHeader className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className={`h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center ${feature.color}`}>
                      <IconComponent className="h-6 w-6" />
                    </div>
                    <Badge variant="secondary" className="text-xs">
                      {feature.badge}
                    </Badge>
                  </div>
                  <CardTitle className="text-xl">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-base leading-relaxed">
                    {feature.description}
                  </CardDescription>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Additional Features */}
        <div className="space-y-8">
          <div className="text-center">
            <h3 className="text-2xl font-bold text-foreground mb-4">
              Additional Features & Capabilities
            </h3>
            <p className="text-muted-foreground">
              Built with modern technology and farmer-first design principles
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {additionalFeatures.map((feature, index) => {
              const IconComponent = feature.icon;
              return (
                <div key={index} className="flex items-start space-x-4 p-6 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors">
                  <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary flex-shrink-0">
                    <IconComponent className="h-5 w-5" />
                  </div>
                  <div className="space-y-2">
                    <h4 className="font-semibold text-foreground">{feature.title}</h4>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {feature.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Technology Stack */}
        <div className="mt-16 text-center space-y-6">
          <h3 className="text-xl font-semibold text-foreground">
            Powered by Modern Technology
          </h3>
          <div className="flex flex-wrap justify-center gap-4">
            {[
              "Artificial Intelligence",
              "Machine Learning", 
              "Computer Vision",
              "Natural Language Processing",
              "Real-time Analytics",
              "Mobile-first Design",
              "Progressive Web App",
              "Offline Support"
            ].map((tech, index) => (
              <Badge key={index} variant="outline" className="px-3 py-1">
                {tech}
              </Badge>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;