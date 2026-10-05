// TODO: Replace 'YOUR_API_KEY' in WeatherPage.tsx with your actual WeatherAPI key.
// You can set it manually in the code or use an environment variable for production.

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  CloudRain, 
  Sun, 
  Cloud, 
  AlertTriangle,
  Wind,
  Droplets,
  Thermometer,
  Eye,
  ArrowLeft
} from "lucide-react";
import { Link } from "react-router-dom";

const WeatherPage = () => {
  const [weatherData, setWeatherData] = useState<any>(null);
  const [alerts, setAlerts] = useState<any[]>([]);

  useEffect(() => {
    // Get user city and state from localStorage
    const userData = localStorage.getItem("digital-krishi-user");
    let city = "";
    let state = "";
    if (userData) {
      try {
        const user = JSON.parse(userData);
        city = user.city || "";
        state = user.state || "";
      } catch {}
    }
    // Debug log
    console.log("WeatherPage city:", city, "state:", state);
    // Only fetch if city and state are available
    if (city && state) {
      // TODO: Replace 'YOUR_API_KEY' with your actual WeatherAPI key
      const apiKey = "94603d4e6e3547e8811203913251709";
      const location = encodeURIComponent(`${city},${state}`);
      fetch(`https://api.weatherapi.com/v1/forecast.json?key=${apiKey}&q=${location}&days=5`)
        .then(res => res.json())
        .then(data => {
          // Map WeatherAPI data to your UI structure
          setWeatherData({
            current: {
              temperature: data.current.temp_c,
              humidity: data.current.humidity,
              windSpeed: data.current.wind_kph,
              visibility: data.current.vis_km,
              condition: data.current.condition.text,
              location: data.location.name + ", " + data.location.region
            },
            forecast: data.forecast.forecastday.map((day: any, idx: number) => ({
              day: idx === 0 ? "Today" : idx === 1 ? "Tomorrow" : `Day ${idx+1}`,
              high: day.day.maxtemp_c,
              low: day.day.mintemp_c,
              condition: day.day.condition.text,
              icon: day.day.condition.text.includes("Rain") ? CloudRain : day.day.condition.text.includes("Cloud") ? Cloud : Sun
            }))
          });
          // Example: setAlerts([]); // You can add logic for alerts based on data
        })
        .catch(() => {
          setWeatherData(null);
        });
    }
  }, []);

  if (!weatherData) {
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
            <h1 className="text-2xl font-bold text-foreground">Weather & Pest Forecast</h1>
          </div>
        </div>

        {/* Current Weather */}
        <Card className="agricultural-card mb-6">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Sun className="h-5 w-5" />
              <span>Current Weather</span>
            </CardTitle>
            <CardDescription>{weatherData.current.location}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="text-center">
                <Thermometer className="h-8 w-8 mx-auto mb-2 text-primary" />
                <p className="text-2xl font-bold">{weatherData.current.temperature}°C</p>
                <p className="text-sm text-muted-foreground">Temperature</p>
              </div>
              <div className="text-center">
                <Droplets className="h-8 w-8 mx-auto mb-2 text-blue-500" />
                <p className="text-2xl font-bold">{weatherData.current.humidity}%</p>
                <p className="text-sm text-muted-foreground">Humidity</p>
              </div>
              <div className="text-center">
                <Wind className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                <p className="text-2xl font-bold">{weatherData.current.windSpeed} km/h</p>
                <p className="text-sm text-muted-foreground">Wind Speed</p>
              </div>
              <div className="text-center">
                <Eye className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                <p className="text-2xl font-bold">{weatherData.current.visibility} km</p>
                <p className="text-sm text-muted-foreground">Visibility</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Alerts */}
        {alerts.length > 0 && (
          <Card className="agricultural-card mb-6">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <AlertTriangle className="h-5 w-5 text-warning" />
                <span>Active Alerts</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {alerts.map((alert, index) => (
                <div key={index} className="border border-border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold text-foreground">{alert.title}</h3>
                    <Badge variant={alert.severity === "high" ? "destructive" : "secondary"}>
                      {alert.severity}
                    </Badge>
                  </div>
                  <p className="text-muted-foreground mb-2">{alert.description}</p>
                  <p className="text-sm font-medium text-primary">Action: {alert.action}</p>
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        {/* 5-Day Forecast */}
        <Card className="agricultural-card">
          <CardHeader>
            <CardTitle>5-Day Forecast</CardTitle>
            <CardDescription>Weather outlook for your area</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              {weatherData.forecast.map((day: any, index: number) => (
                <div key={index} className="text-center p-4 rounded-lg bg-muted/30">
                  <p className="font-medium mb-2">{day.day}</p>
                  <day.icon className="h-8 w-8 mx-auto mb-2 text-primary" />
                  <p className="text-sm text-muted-foreground mb-1">{day.condition}</p>
                  <div className="space-y-1">
                    <p className="font-semibold">{day.high}°</p>
                    <p className="text-sm text-muted-foreground">{day.low}°</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default WeatherPage;