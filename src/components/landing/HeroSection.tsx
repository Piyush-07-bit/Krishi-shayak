import { Button } from "@/components/ui/button";
import { MessageCircle, Camera, FileSearch, LogIn } from "lucide-react";
import { Link } from "react-router-dom";
import heroImage from "@/assets/hero-farmer-tech.jpg";

const HeroSection = () => {
  return (
    <section className="relative min-h-screen flex items-center">
      {/* Background Image with Overlay */}
      <div className="absolute inset-0 z-0">
        <img 
          src={heroImage} 
          alt="Modern farmer using smartphone in agricultural fields with technology integration"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 hero-gradient"></div>
      </div>

      {/* Content */}
      <div className="relative z-10 mx-auto max-w-7xl px-4 py-16 lg:px-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Text Content */}
          <div className="text-center lg:text-left space-y-8 animate-fade-in">
            <div className="space-y-4">
              <h1 className="text-4xl md:text-6xl font-bold text-white leading-tight">
                Digital Krishi Officer
              </h1>
              <p className="text-xl md:text-2xl text-white/90 font-medium">
                Always Available, Always Farmer-First
              </p>
            </div>
            
            <p className="text-lg text-white/90 max-w-xl lg:max-w-none">
              Get instant AI-powered agricultural guidance, disease detection, weather forecasts, 
              and market intelligence. Your 24/7 digital farming companion.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <Button 
                size="lg" 
                className="bg-white text-primary hover:bg-white/90 shadow-agricultural-lg"
                asChild
              >
                <Link to="/chat">
                  <MessageCircle className="h-5 w-5 mr-2" />
                  Ask a Query
                </Link>
              </Button>
              
              <Button 
                size="lg" 
                variant="outline" 
                className="border-2 border-white text-white bg-white/20 hover:bg-white hover:text-primary backdrop-blur-sm transition-all duration-300 shadow-lg"
                asChild
              >
                <Link to="/analyze">
                  <Camera className="h-5 w-5 mr-2" />
                  Upload Image
                </Link>
              </Button>
            </div>

            {/* Quick Actions */}
            <div className="flex flex-wrap gap-3 justify-center lg:justify-start pt-4">
              <Button 
                variant="ghost" 
                size="sm" 
                className="text-white/80 hover:text-white hover:bg-white/10 backdrop-blur-sm"
                asChild
              >
                <Link to="/schemes">
                  <FileSearch className="h-4 w-4 mr-2" />
                  Check Schemes
                </Link>
              </Button>
              
              <Button 
                variant="ghost" 
                size="sm" 
                className="text-white/80 hover:text-white hover:bg-white/10 backdrop-blur-sm"
                asChild
              >
                <Link to="/login">
                  <LogIn className="h-4 w-4 mr-2" />
                  Login
                </Link>
              </Button>
            </div>
          </div>

          {/* Feature Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 animate-grow">
            <div className="agricultural-card bg-white/10 backdrop-blur-md border-white/20">
              <div className="flex items-center space-x-3 mb-3">
                <div className="h-10 w-10 rounded-lg bg-white/20 flex items-center justify-center">
                  <MessageCircle className="h-5 w-5 text-white" />
                </div>
                <h3 className="font-semibold text-white">AI Chat Assistant</h3>
              </div>
              <p className="text-white/80 text-sm">
                Get instant answers to your farming questions with our AI-powered chat system.
              </p>
            </div>

            <div className="agricultural-card bg-white/10 backdrop-blur-md border-white/20">
              <div className="flex items-center space-x-3 mb-3">
                <div className="h-10 w-10 rounded-lg bg-white/20 flex items-center justify-center">
                  <Camera className="h-5 w-5 text-white" />
                </div>
                <h3 className="font-semibold text-white">Disease Detection</h3>
              </div>
              <p className="text-white/80 text-sm">
                Upload crop images for instant disease identification and treatment recommendations.
              </p>
            </div>

            <div className="agricultural-card bg-white/10 backdrop-blur-md border-white/20">
              <div className="flex items-center space-x-3 mb-3">
                <div className="h-10 w-10 rounded-lg bg-white/20 flex items-center justify-center">
                  <span className="text-white text-lg">🌤️</span>
                </div>
                <h3 className="font-semibold text-white">Weather Forecast</h3>
              </div>
              <p className="text-white/80 text-sm">
                Accurate weather predictions and pest risk alerts for your location.
              </p>
            </div>

            <div className="agricultural-card bg-white/10 backdrop-blur-md border-white/20">
              <div className="flex items-center space-x-3 mb-3">
                <div className="h-10 w-10 rounded-lg bg-white/20 flex items-center justify-center">
                  <span className="text-white text-lg">💰</span>
                </div>
                <h3 className="font-semibold text-white">Market Prices</h3>
              </div>
              <p className="text-white/80 text-sm">
                Real-time market prices and intelligent selling recommendations.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Scroll Indicator */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
        <div className="w-6 h-10 border-2 border-white/30 rounded-full flex justify-center">
          <div className="w-1 h-3 bg-white/50 rounded-full mt-2"></div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;