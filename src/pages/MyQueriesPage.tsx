import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, MessageCircle } from "lucide-react";
import { Link } from "react-router-dom";

const MyQueriesPage = () => {
  const stored = localStorage.getItem("digital-krishi-queries");
  const queries: any[] = stored ? JSON.parse(stored) : [];

  useEffect(() => {
    // In a real app, fetch from backend. Here, ensure the key exists for demo.
    if (!stored) {
      localStorage.setItem("digital-krishi-queries", JSON.stringify([]));
    }
  }, [stored]);

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto p-4 max-w-4xl">
        <div className="flex items-center justify-between mb-6">
          <Button variant="ghost" size="sm" asChild>
            <Link to="/dashboard">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Link>
          </Button>
          <h1 className="text-2xl font-bold text-foreground">My Queries</h1>
        </div>

        {queries.length === 0 ? (
          <Card className="agricultural-card">
            <CardContent className="p-6 text-center">
              <MessageCircle className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-muted-foreground mb-4">You have not asked any queries yet.</p>
              <Button asChild className="gradient-primary text-primary-foreground">
                <Link to="/chat">Ask your first question</Link>
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {queries.map((q, idx) => (
              <Card key={idx} className="agricultural-card">
                <CardHeader>
                  <CardTitle className="text-base">{q.text?.slice(0, 80) || "Query"}</CardTitle>
                  <CardDescription>
                    {new Date(q.createdAt || Date.now()).toLocaleString()}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {q.answer && (
                    <div className="space-y-2">
                      <p className="text-sm text-muted-foreground">Answer summary</p>
                      <p className="text-sm line-clamp-3">{q.answer}</p>
                      {q.confidence && (
                        <Badge variant="secondary" className="text-xs">{q.confidence}% confidence</Badge>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyQueriesPage;