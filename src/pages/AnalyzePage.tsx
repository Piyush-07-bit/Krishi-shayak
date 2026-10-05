import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Upload, 
  Camera, 
  ArrowLeft, 
  X, 
  CheckCircle,
  AlertTriangle,
  Leaf,
  Bug,
  Droplets,
  BookOpen,
  MapPin,
  Calendar
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";

interface AnalysisResult {
  diseaseName: string;
  confidence: number;
  severity: "Low" | "Medium" | "High";
  description: string;
  organicTreatments: string[];
  chemicalTreatments: string[];
  preventionTips: string[];
  localResources: string[];
  citation: string;
}

const AnalyzePage = () => {
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [plantType, setPlantType] = useState("");
  const [location, setLocation] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
const { toast } = useToast();
  const navigate = useNavigate();

  const plantTypes = ["Tomato", "Banana", "Paddy", "Maize", "Coconut", "Pepper", "Cardamom", "Ginger"];
  const locations = ["Palakkad", "Thrissur", "Kozhikode", "Kochi", "Alappuzha"];

  const handleImageUpload = (file: File) => {
    if (file) {
      setSelectedImage(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleImageUpload(file);
    }
  };

  const removeImage = () => {
    setSelectedImage(null);
    setImagePreview(null);
    setAnalysisResult(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const analyzeImage = async () => {
    if (!selectedImage || !plantType || !location) {
      toast({
        title: "Missing Information",
        description: "Please upload an image and select plant type and location",
        variant: "destructive"
      });
      return;
    }

    // Soft auth gate on analyze submit
    const token = localStorage.getItem("digital-krishi-token");
    if (!token) {
      toast({
        title: "Login required",
        description: "Please login to analyze images and save results to your account.",
      });
      navigate("/login", { state: { from: "/analyze" } });
      return;
    }

    setIsAnalyzing(true);

    // Mock analysis results
    const mockResults: AnalysisResult[] = [
      {
        diseaseName: "Early Blight (Alternaria solani)",
        confidence: 87,
        severity: "Medium",
        description: "Early blight is a common fungal disease that affects tomato plants, causing dark spots with concentric rings on leaves. It typically occurs during warm, humid conditions and can significantly reduce yield if left untreated.",
        organicTreatments: [
          "Apply neem oil spray (5ml per liter) twice weekly",
          "Use baking soda solution (1 tsp per liter) as preventive spray",
          "Copper-based organic fungicide every 7-10 days",
          "Remove affected leaves and improve air circulation"
        ],
        chemicalTreatments: [
          "Mancozeb 75% WP (2g per liter water)",
          "Chlorothalonil 75% WP (2g per liter water)",
          "Azoxystrobin + Difenoconazole combination",
          "Apply during early morning or evening hours"
        ],
        preventionTips: [
          "Ensure proper plant spacing for air circulation",
          "Water at soil level, avoid wetting leaves",
          "Use drip irrigation instead of overhead spraying",
          "Apply mulch to prevent soil splash on leaves",
          "Rotate crops with non-solanaceous plants"
        ],
        localResources: [
          "Krishi Bhavan, Palakkad - +91 491 2505404",
          "Green Farm Supplies, Main Bazaar - +91 9876543210",
          "Kerala Agricultural University Extension - +91 491 2438011",
          "Local cooperative society for organic inputs"
        ],
        citation: "Kerala Agricultural University Disease Management Guidelines 2024"
      },
      {
        diseaseName: "Bacterial Leaf Spot (Xanthomonas)",
        confidence: 78,
        severity: "High",
        description: "Bacterial leaf spot is a serious bacterial infection causing water-soaked lesions that turn brown with yellow halos. This disease spreads rapidly in warm, wet conditions and can cause significant crop loss.",
        organicTreatments: [
          "Copper sulfate spray (1g per liter) weekly",
          "Bordeaux mixture application every 10 days",
          "Streptomycin-based bio-fungicide",
          "Remove and destroy infected plant material"
        ],
        chemicalTreatments: [
          "Copper oxychloride 50% WP (3g per liter)",
          "Streptomycin + Copper combination",
          "Kasugamycin 3% SL (2ml per liter)",
          "Apply before rain or irrigation"
        ],
        preventionTips: [
          "Use disease-free certified seeds",
          "Maintain proper field sanitation",
          "Avoid working in wet fields",
          "Implement crop rotation practices",
          "Use resistant varieties when available"
        ],
        localResources: [
          "District Plant Protection Officer - +91 491 2522100",
          "Agri-Tech Solutions, Palakkad - +91 9876543211",
          "Farmers Producer Organization contact",
          "IISR Spices Board for organic alternatives"
        ],
        citation: "ICAR Plant Protection Guidelines for Kerala 2024"
      }
    ];

    setTimeout(() => {
      const randomResult = mockResults[Math.floor(Math.random() * mockResults.length)];
      setAnalysisResult(randomResult);
      setIsAnalyzing(false);
      
      toast({
        title: "Analysis Complete",
        description: `Disease identified with ${randomResult.confidence}% confidence`,
      });
    }, 3000);
  };

  const saveToDiary = () => {
    toast({
      title: "Saved to Farm Diary",
      description: "Analysis result has been saved to your farm diary",
    });
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-background/95 backdrop-blur border-b border-border">
        <div className="flex items-center justify-between p-4 max-w-4xl mx-auto">
          <div className="flex items-center space-x-4">
            <Button variant="ghost" size="sm" asChild>
              <Link to="/dashboard">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Link>
            </Button>
            <div>
              <h1 className="text-xl font-bold text-foreground">Disease Analyzer</h1>
              <p className="text-sm text-muted-foreground">
                AI-powered crop disease detection • രോഗനിർണ്ണയം
              </p>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto p-4 space-y-6">
        {/* Upload Section */}
        <Card className="agricultural-card">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Camera className="h-5 w-5" />
              <span>Upload Plant Image</span>
            </CardTitle>
            <CardDescription>
              Take a clear photo of the affected plant part for accurate disease detection
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {!imagePreview ? (
              <div className="border-2 border-dashed border-border rounded-lg p-8">
                <div className="text-center space-y-4">
                  <div className="mx-auto h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Upload className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <p className="text-lg font-medium">Upload Plant Image</p>
                    <p className="text-muted-foreground">
                      Drag and drop or click to select image
                    </p>
                  </div>
                  <div className="flex justify-center space-x-3">
                    <Button onClick={() => fileInputRef.current?.click()}>
                      <Upload className="h-4 w-4 mr-2" />
                      Choose File
                    </Button>
                    <Button variant="outline">
                      <Camera className="h-4 w-4 mr-2" />
                      Take Photo
                    </Button>
                  </div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileSelect}
                    className="hidden"
                  />
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="relative">
                  <img
                    src={imagePreview}
                    alt="Uploaded plant"
                    className="w-full h-64 object-cover rounded-lg"
                  />
                  <Button
                    variant="destructive"
                    size="sm"
                    className="absolute top-2 right-2"
                    onClick={removeImage}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Plant Type *</label>
                    <Select value={plantType} onValueChange={setPlantType}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select plant type" />
                      </SelectTrigger>
                      <SelectContent>
                        {plantTypes.map((plant) => (
                          <SelectItem key={plant} value={plant}>
                            {plant}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Location *</label>
                    <Select value={location} onValueChange={setLocation}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select location" />
                      </SelectTrigger>
                      <SelectContent>
                        {locations.map((loc) => (
                          <SelectItem key={loc} value={loc}>
                            {loc}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <Button
                  onClick={analyzeImage}
                  disabled={isAnalyzing || !plantType || !location}
                  className="w-full gradient-primary text-primary-foreground"
                >
                  {isAnalyzing ? "Analyzing..." : "Analyze Image"}
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Analysis Progress */}
        {isAnalyzing && (
          <Card className="agricultural-card">
            <CardContent className="p-6">
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Leaf className="h-4 w-4 text-primary animate-pulse" />
                  </div>
                  <div>
                    <p className="font-medium">Analyzing plant image...</p>
                    <p className="text-sm text-muted-foreground">
                      AI is examining the image for disease patterns
                    </p>
                  </div>
                </div>
                <Progress value={66} className="h-2" />
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div className="space-y-1">
                    <CheckCircle className="h-5 w-5 text-success mx-auto" />
                    <p className="text-xs text-muted-foreground">Image Processing</p>
                  </div>
                  <div className="space-y-1">
                    <div className="h-5 w-5 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto"></div>
                    <p className="text-xs text-muted-foreground">Disease Detection</p>
                  </div>
                  <div className="space-y-1">
                    <div className="h-5 w-5 border-2 border-muted rounded-full mx-auto"></div>
                    <p className="text-xs text-muted-foreground">Generate Report</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Analysis Results */}
        {analysisResult && !isAnalyzing && (
          <div className="space-y-6">
            {/* Disease Identification */}
            <Card className="agricultural-card">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center space-x-2">
                    <Bug className="h-5 w-5" />
                    <span>Disease Identified</span>
                  </CardTitle>
                  <Badge 
                    variant={
                      analysisResult.severity === "High" ? "destructive" : 
                      analysisResult.severity === "Medium" ? "secondary" : "outline"
                    }
                  >
                    {analysisResult.severity} Severity
                  </Badge>
                </div>
                <CardDescription>{analysisResult.description}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold">{analysisResult.diseaseName}</h3>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-primary">{analysisResult.confidence}%</div>
                    <div className="text-xs text-muted-foreground">Confidence</div>
                  </div>
                </div>
                
                <Progress value={analysisResult.confidence} className="h-2" />
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4">
                  <div className="text-center p-3 rounded-lg bg-muted/30">
                    <Leaf className="h-6 w-6 mx-auto text-primary mb-1" />
                    <div className="text-sm font-medium">Plant</div>
                    <div className="text-xs text-muted-foreground">{plantType}</div>
                  </div>
                  <div className="text-center p-3 rounded-lg bg-muted/30">
                    <MapPin className="h-6 w-6 mx-auto text-secondary mb-1" />
                    <div className="text-sm font-medium">Location</div>
                    <div className="text-xs text-muted-foreground">{location}</div>
                  </div>
                  <div className="text-center p-3 rounded-lg bg-muted/30">
                    <Calendar className="h-6 w-6 mx-auto text-success mb-1" />
                    <div className="text-sm font-medium">Analyzed</div>
                    <div className="text-xs text-muted-foreground">Today</div>
                  </div>
                  <div className="text-center p-3 rounded-lg bg-muted/30">
                    <AlertTriangle className="h-6 w-6 mx-auto text-warning mb-1" />
                    <div className="text-sm font-medium">Action</div>
                    <div className="text-xs text-muted-foreground">Required</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Treatment Recommendations */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Organic Treatments */}
              <Card className="agricultural-card">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Leaf className="h-5 w-5 text-success" />
                    <span>Organic Treatments</span>
                  </CardTitle>
                  <CardDescription>
                    Natural and eco-friendly treatment options
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3">
                    {analysisResult.organicTreatments.map((treatment, index) => (
                      <li key={index} className="flex items-start space-x-2">
                        <CheckCircle className="h-4 w-4 text-success mt-0.5 flex-shrink-0" />
                        <span className="text-sm">{treatment}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>

              {/* Chemical Treatments */}
              <Card className="agricultural-card">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Droplets className="h-5 w-5 text-secondary" />
                    <span>Chemical Treatments</span>
                  </CardTitle>
                  <CardDescription>
                    Chemical fungicides for severe infections
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3">
                    {analysisResult.chemicalTreatments.map((treatment, index) => (
                      <li key={index} className="flex items-start space-x-2">
                        <CheckCircle className="h-4 w-4 text-secondary mt-0.5 flex-shrink-0" />
                        <span className="text-sm">{treatment}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </div>

            {/* Prevention Tips */}
            <Card className="agricultural-card">
              <CardHeader>
                <CardTitle>Prevention Tips</CardTitle>
                <CardDescription>
                  Long-term strategies to prevent disease recurrence
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {analysisResult.preventionTips.map((tip, index) => (
                    <div key={index} className="flex items-start space-x-2">
                      <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <span className="text-xs font-medium text-primary">{index + 1}</span>
                      </div>
                      <span className="text-sm">{tip}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Local Resources */}
            <Card className="agricultural-card">
              <CardHeader>
                <CardTitle>Local Resources</CardTitle>
                <CardDescription>
                  Contact information for local agricultural support
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {analysisResult.localResources.map((resource, index) => (
                    <div key={index} className="flex items-center space-x-3 p-3 rounded-lg bg-muted/30">
                      <MapPin className="h-4 w-4 text-primary flex-shrink-0" />
                      <span className="text-sm">{resource}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Actions */}
            <div className="flex space-x-4">
              <Button onClick={saveToDiary} className="flex-1">
                <BookOpen className="h-4 w-4 mr-2" />
                Save to Farm Diary
              </Button>
              <Button variant="outline" onClick={() => setAnalysisResult(null)} className="flex-1">
                Analyze Another Image
              </Button>
            </div>

            {/* Citation */}
            <div className="text-center">
              <p className="text-xs text-muted-foreground">
                Source: {analysisResult.citation}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AnalyzePage;