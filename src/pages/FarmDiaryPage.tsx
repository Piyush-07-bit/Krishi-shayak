import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  BookOpen, 
  Plus,
  ArrowLeft,
  Calendar,
  Camera,
  Tag,
  Download,
  Edit,
  Trash2
} from "lucide-react";
import { Link } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";

const FarmDiaryPage = () => {
  const [entries, setEntries] = useState<any[]>([]);
  const [isAddingEntry, setIsAddingEntry] = useState(false);
  const [newEntry, setNewEntry] = useState({
    title: "",
    description: "",
    category: "",
    tags: "",
    images: [] as File[]
  });
  const { toast } = useToast();

  useEffect(() => {
    // Load entries from localStorage
    const savedEntries = localStorage.getItem("farm-diary-entries");
    if (savedEntries) {
      setEntries(JSON.parse(savedEntries));
    } else {
      // Mock initial entries
      const mockEntries = [
        {
          id: 1,
          title: "Rice Planting - Kharif Season",
          description: "Started rice planting in the eastern field. Used variety BPT 5204. Applied basal fertilizer NPK 20:20:0 @ 125 kg/acre.",
          category: "Planting",
          tags: ["rice", "kharif", "fertilizer"],
          date: "2024-01-15",
          images: []
        },
        {
          id: 2,
          title: "Pest Control - Brown Planthopper",
          description: "Noticed brown planthopper attack in paddy field. Applied Imidacloprid 17.8% SL @ 0.3ml/liter. Will monitor for next 3 days.",
          category: "Pest Management",
          tags: ["pest", "paddy", "chemical"],
          date: "2024-01-20",
          images: []
        },
        {
          id: 3,
          title: "Irrigation Schedule Update",
          description: "Updated irrigation schedule due to delayed monsoon. Increased frequency to alternate days. Installed drip irrigation in vegetable patch.",
          category: "Irrigation",
          tags: ["irrigation", "monsoon", "vegetables"],
          date: "2024-01-25",
          images: []
        }
      ];
      setEntries(mockEntries);
      localStorage.setItem("farm-diary-entries", JSON.stringify(mockEntries));
    }
  }, []);

  const saveEntry = () => {
    if (!newEntry.title || !newEntry.description) {
      toast({
        title: "Error",
        description: "Title and description are required",
        variant: "destructive"
      });
      return;
    }

    const entry = {
      id: Date.now(),
      ...newEntry,
      tags: newEntry.tags.split(",").map(tag => tag.trim()),
      date: new Date().toISOString().split("T")[0],
      images: []
    };

    const updatedEntries = [entry, ...entries];
    setEntries(updatedEntries);
    localStorage.setItem("farm-diary-entries", JSON.stringify(updatedEntries));
    
    setNewEntry({ title: "", description: "", category: "", tags: "", images: [] });
    setIsAddingEntry(false);
    
    toast({
      title: "Success",
      description: "Diary entry saved successfully"
    });
  };

  const deleteEntry = (id: number) => {
    const updatedEntries = entries.filter(entry => entry.id !== id);
    setEntries(updatedEntries);
    localStorage.setItem("farm-diary-entries", JSON.stringify(updatedEntries));
    
    toast({
      title: "Deleted",
      description: "Diary entry deleted successfully"
    });
  };

  const exportData = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(entries, null, 2));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", "farm-diary-export.json");
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
    
    toast({
      title: "Exported",
      description: "Farm diary data exported successfully"
    });
  };

  const getCategoryColor = (category: string) => {
    const colors: { [key: string]: string } = {
      "Planting": "bg-green-500/20 text-green-700 dark:text-green-300",
      "Pest Management": "bg-red-500/20 text-red-700 dark:text-red-300",
      "Irrigation": "bg-blue-500/20 text-blue-700 dark:text-blue-300",
      "Fertilizer": "bg-yellow-500/20 text-yellow-700 dark:text-yellow-300",
      "Harvest": "bg-purple-500/20 text-purple-700 dark:text-purple-300",
      "General": "bg-muted text-muted-foreground"
    };
    return colors[category] || colors["General"];
  };

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
            <h1 className="text-2xl font-bold text-foreground">Farm Diary</h1>
          </div>
          <div className="flex items-center space-x-2">
            <Button variant="outline" size="sm" onClick={exportData}>
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
            <Dialog open={isAddingEntry} onOpenChange={setIsAddingEntry}>
              <DialogTrigger asChild>
                <Button className="gradient-primary text-primary-foreground">
                  <Plus className="h-4 w-4 mr-2" />
                  New Entry
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>Add New Diary Entry</DialogTitle>
                  <DialogDescription>
                    Record your farming activities and observations
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <Input
                    placeholder="Entry title"
                    value={newEntry.title}
                    onChange={(e) => setNewEntry({...newEntry, title: e.target.value})}
                  />
                  <Select
                    value={newEntry.category}
                    onValueChange={(value) => setNewEntry({...newEntry, category: value})}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Planting">Planting</SelectItem>
                      <SelectItem value="Pest Management">Pest Management</SelectItem>
                      <SelectItem value="Irrigation">Irrigation</SelectItem>
                      <SelectItem value="Fertilizer">Fertilizer</SelectItem>
                      <SelectItem value="Harvest">Harvest</SelectItem>
                      <SelectItem value="General">General</SelectItem>
                    </SelectContent>
                  </Select>
                  <Textarea
                    placeholder="Describe your farming activity in detail..."
                    value={newEntry.description}
                    onChange={(e) => setNewEntry({...newEntry, description: e.target.value})}
                    className="min-h-[100px]"
                  />
                  <Input
                    placeholder="Tags (comma separated)"
                    value={newEntry.tags}
                    onChange={(e) => setNewEntry({...newEntry, tags: e.target.value})}
                  />
                  <div className="flex justify-end space-x-2">
                    <Button variant="outline" onClick={() => setIsAddingEntry(false)}>
                      Cancel
                    </Button>
                    <Button onClick={saveEntry} className="gradient-primary text-primary-foreground">
                      Save Entry
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <Card className="agricultural-card">
            <CardContent className="p-4 text-center">
              <BookOpen className="h-8 w-8 mx-auto mb-2 text-primary" />
              <p className="text-2xl font-bold">{entries.length}</p>
              <p className="text-sm text-muted-foreground">Total Entries</p>
            </CardContent>
          </Card>
          <Card className="agricultural-card">
            <CardContent className="p-4 text-center">
              <Calendar className="h-8 w-8 mx-auto mb-2 text-blue-500" />
              <p className="text-2xl font-bold">30</p>
              <p className="text-sm text-muted-foreground">Days Active</p>
            </CardContent>
          </Card>
          <Card className="agricultural-card">
            <CardContent className="p-4 text-center">
              <Tag className="h-8 w-8 mx-auto mb-2 text-green-500" />
              <p className="text-2xl font-bold">8</p>
              <p className="text-sm text-muted-foreground">Categories</p>
            </CardContent>
          </Card>
        </div>

        {/* Entries List */}
        <div className="space-y-4">
          {entries.map((entry) => (
            <Card key={entry.id} className="agricultural-card">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg mb-2">{entry.title}</CardTitle>
                    <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                      <div className="flex items-center">
                        <Calendar className="h-4 w-4 mr-1" />
                        {new Date(entry.date).toLocaleDateString()}
                      </div>
                      <Badge className={getCategoryColor(entry.category)}>
                        {entry.category}
                      </Badge>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button variant="ghost" size="sm">
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => deleteEntry(entry.id)}
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-foreground mb-3">{entry.description}</p>
                {entry.tags && entry.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {entry.tags.map((tag: string, index: number) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        <Tag className="h-3 w-3 mr-1" />
                        {tag}
                      </Badge>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        {entries.length === 0 && (
          <Card className="agricultural-card">
            <CardContent className="p-6 text-center">
              <BookOpen className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-muted-foreground mb-4">No diary entries yet. Start recording your farming activities!</p>
              <Button onClick={() => setIsAddingEntry(true)} className="gradient-primary text-primary-foreground">
                <Plus className="h-4 w-4 mr-2" />
                Add Your First Entry
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default FarmDiaryPage;