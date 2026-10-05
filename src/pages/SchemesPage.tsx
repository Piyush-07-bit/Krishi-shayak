import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  FileText, 
  ArrowLeft,
  Search,
  Filter,
  Users,
  IndianRupee,
  Calendar,
  ExternalLink
} from "lucide-react";
import { Link } from "react-router-dom";

const SchemesPage = () => {
  const [schemes, setSchemes] = useState<any[]>([]);
  const [filteredSchemes, setFilteredSchemes] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [cropFilter, setCropFilter] = useState("all");
  const [beneficiaryFilter, setBeneficiaryFilter] = useState("all");

  useEffect(() => {
    // Mock schemes data
    const mockSchemes = [
      {
        id: 1,
        name: "PM-KISAN Samman Nidhi",
        description: "Direct income support of ₹6000 per year to small and marginal farmers",
        amount: "₹6,000 per year",
        crops: ["All crops"],
        beneficiary: "Small & Marginal Farmers",
        eligibility: "Land holding up to 2 hectares",
        deadline: "2024-03-31",
        status: "Active",
        documents: ["Aadhaar", "Land Records", "Bank Account"]
      },
      {
        id: 2,
        name: "Pradhan Mantri Fasal Bima Yojana",
        description: "Crop insurance scheme providing financial support against crop losses",
        amount: "Up to ₹2,00,000",
        crops: ["Paddy", "Wheat", "Sugarcane"],
        beneficiary: "All Farmers",
        eligibility: "Must have crop loan or own cultivation",
        deadline: "2024-04-15",
        status: "Active",
        documents: ["Aadhaar", "Land Records", "Sowing Certificate"]
      },
      {
        id: 3,
        name: "Kerala Farmers Debt Relief Scheme",
        description: "State government initiative for debt waiver for small farmers",
        amount: "Up to ₹1,00,000",
        crops: ["Banana", "Coconut", "Pepper"],
        beneficiary: "Small Farmers",
        eligibility: "Outstanding loan up to ₹1 lakh",
        deadline: "2024-05-30",
        status: "Active",
        documents: ["Loan Certificate", "Income Certificate", "Land Records"]
      },
      {
        id: 4,
        name: "Soil Health Card Scheme",
        description: "Free soil testing and nutrient management recommendations",
        amount: "Free Service",
        crops: ["All crops"],
        beneficiary: "All Farmers",
        eligibility: "Valid land ownership or tenancy",
        deadline: "Ongoing",
        status: "Active",
        documents: ["Land Records", "Farmer ID"]
      },
      {
        id: 5,
        name: "Organic Farming Promotion Scheme",
        description: "Financial assistance for transition to organic farming practices",
        amount: "₹15,000 per hectare",
        crops: ["Vegetables", "Fruits", "Spices"],
        beneficiary: "Progressive Farmers",
        eligibility: "Minimum 1 acre land for organic farming",
        deadline: "2024-06-20",
        status: "Active",
        documents: ["Organic Certification", "Land Records", "Training Certificate"]
      }
    ];
    
    setSchemes(mockSchemes);
    setFilteredSchemes(mockSchemes);
  }, []);

  useEffect(() => {
    let filtered = schemes;
    
    if (searchTerm) {
      filtered = filtered.filter(scheme => 
        scheme.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        scheme.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    if (cropFilter !== "all") {
      filtered = filtered.filter(scheme => 
        scheme.crops.some((crop: string) => 
          crop.toLowerCase().includes(cropFilter.toLowerCase()) || crop === "All crops"
        )
      );
    }
    
    if (beneficiaryFilter !== "all") {
      filtered = filtered.filter(scheme => 
        scheme.beneficiary.toLowerCase().includes(beneficiaryFilter.toLowerCase()) ||
        scheme.beneficiary === "All Farmers"
      );
    }
    
    setFilteredSchemes(filtered);
  }, [searchTerm, cropFilter, beneficiaryFilter, schemes]);

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto p-4 max-w-6xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-4">
            <Button variant="ghost" size="sm" asChild>
              <Link to="/dashboard">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Link>
            </Button>
            <h1 className="text-2xl font-bold text-foreground">Government Schemes</h1>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <Card className="agricultural-card">
            <CardContent className="p-4 text-center">
              <FileText className="h-8 w-8 mx-auto mb-2 text-primary" />
              <p className="text-2xl font-bold">{schemes.length}</p>
              <p className="text-sm text-muted-foreground">Active Schemes</p>
            </CardContent>
          </Card>
          <Card className="agricultural-card">
            <CardContent className="p-4 text-center">
              <Users className="h-8 w-8 mx-auto mb-2 text-blue-500" />
              <p className="text-2xl font-bold">3</p>
              <p className="text-sm text-muted-foreground">Eligible for You</p>
            </CardContent>
          </Card>
          <Card className="agricultural-card">
            <CardContent className="p-4 text-center">
              <IndianRupee className="h-8 w-8 mx-auto mb-2 text-green-500" />
              <p className="text-2xl font-bold">₹21K</p>
              <p className="text-sm text-muted-foreground">Potential Benefit</p>
            </CardContent>
          </Card>
          <Card className="agricultural-card">
            <CardContent className="p-4 text-center">
              <Calendar className="h-8 w-8 mx-auto mb-2 text-orange-500" />
              <p className="text-2xl font-bold">2</p>
              <p className="text-sm text-muted-foreground">Ending Soon</p>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card className="agricultural-card mb-6">
          <CardContent className="p-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search schemes..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <div className="md:w-48">
                <Select value={cropFilter} onValueChange={setCropFilter}>
                  <SelectTrigger>
                    <Filter className="h-4 w-4 mr-2" />
                    <SelectValue placeholder="Filter by crop" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Crops</SelectItem>
                    <SelectItem value="paddy">Paddy</SelectItem>
                    <SelectItem value="banana">Banana</SelectItem>
                    <SelectItem value="coconut">Coconut</SelectItem>
                    <SelectItem value="vegetables">Vegetables</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="md:w-48">
                <Select value={beneficiaryFilter} onValueChange={setBeneficiaryFilter}>
                  <SelectTrigger>
                    <Users className="h-4 w-4 mr-2" />
                    <SelectValue placeholder="Beneficiary type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Farmers</SelectItem>
                    <SelectItem value="small">Small Farmers</SelectItem>
                    <SelectItem value="marginal">Marginal Farmers</SelectItem>
                    <SelectItem value="progressive">Progressive Farmers</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Schemes Grid */}
        <div className="space-y-4">
          {filteredSchemes.map((scheme) => (
            <Card key={scheme.id} className="agricultural-card">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg mb-2">{scheme.name}</CardTitle>
                    <CardDescription className="text-base">{scheme.description}</CardDescription>
                  </div>
                  <Badge variant="secondary" className="ml-4">
                    {scheme.status}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Benefit Amount</p>
                    <p className="font-semibold text-foreground">{scheme.amount}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Crops Covered</p>
                    <p className="font-semibold text-foreground">{scheme.crops.join(", ")}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Beneficiary</p>
                    <p className="font-semibold text-foreground">{scheme.beneficiary}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Deadline</p>
                    <p className="font-semibold text-foreground">{scheme.deadline}</p>
                  </div>
                </div>
                
                <div className="mb-4">
                  <p className="text-sm text-muted-foreground mb-2">Eligibility Criteria</p>
                  <p className="text-sm text-foreground">{scheme.eligibility}</p>
                </div>
                
                <div className="mb-4">
                  <p className="text-sm text-muted-foreground mb-2">Required Documents</p>
                  <div className="flex flex-wrap gap-2">
                    {scheme.documents.map((doc: string, index: number) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {doc}
                      </Badge>
                    ))}
                  </div>
                </div>
                
                <div className="flex flex-col sm:flex-row gap-2">
                  <Button variant="default" size="sm" className="gradient-primary text-primary-foreground">
                    Apply Now
                  </Button>
                  <Button variant="outline" size="sm">
                    <ExternalLink className="h-4 w-4 mr-2" />
                    View Details
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredSchemes.length === 0 && (
          <Card className="agricultural-card">
            <CardContent className="p-6 text-center">
              <p className="text-muted-foreground">No schemes found matching your search criteria.</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default SchemesPage;