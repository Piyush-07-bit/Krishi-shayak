import { useEffect, useMemo, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { 
  Users, 
  MessageCircle,
  ThumbsUp,
  ThumbsDown,
  ArrowLeft,
  Plus,
  Reply,
  Flag,
  Search,
  TrendingUp,
  Mic,
  MicOff,
  ShieldCheck
} from "lucide-react";
import { Link } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/services/supabase";

// Types
type QAAnswer = {
  id: string;
  questionId: string;
  content: string;
  createdAt: string;
  upvotes: number;
  downvotes: number;
  verified?: boolean;
  authorAnon: boolean;
};

type QAQuestion = {
  id: string;
  title: string;
  content: string;
  cropTag?: string;
  diseaseTag?: string;
  panchayat?: string;
  createdAt: string;
  trending?: boolean;
  answers: QAAnswer[];
};

// Very lightweight moderation: heuristics + optional HuggingFace API
async function moderateText(text: string): Promise<{ ok: boolean; reason?: string; score?: number }> {
  const lower = text.toLowerCase();
  const banned = ["suicide", "kill yourself", "acid attack", "hate", "terrorist", "porn", "abuse", "abusive", "fake news", "spam link"];
  if (banned.some(w => lower.includes(w))) {
    return { ok: false, reason: "Content contains harmful or abusive terms" };
  }
  // Too many links or all-caps shouting
  const links = (text.match(/https?:\/\//gi) || []).length;
  if (links > 2) return { ok: false, reason: "Too many links (possible spam)" };
  if (text.length > 12 && text === text.toUpperCase()) return { ok: false, reason: "Please avoid ALL CAPS" };

  // Optional: Hugging Face moderation (Detoxify) if key is available
  const hfKey = (import.meta as any).env?.VITE_HF_API_KEY as string | undefined;
  if (hfKey) {
    try {
      const resp = await fetch("https://api-inference.huggingface.co/models/unitary/unbiased-toxic-roberta", {
        method: "POST",
        headers: { "Authorization": `Bearer ${hfKey}`, "Content-Type": "application/json" },
        body: JSON.stringify({ inputs: text })
      });
      if (resp.ok) {
        const result = await resp.json();
        // result is array of labels with scores; flag if any toxicity label > 0.8
        const labels = Array.isArray(result) ? result[0] : [];
        const toxicScore = labels?.find((l: any) => (l.label || "").toLowerCase().includes("toxic"))?.score || 0;
        if (toxicScore > 0.8) return { ok: false, reason: "AI flagged content as toxic", score: toxicScore };
      }
    } catch {
      // ignore HF errors and allow heuristic result
    }
  }
  return { ok: true };
}

function computeVerified(answers: QAAnswer[]): string | null {
  // rank by (upvotes - downvotes); must be unflagged (we have no async moderation here), and non-empty
  if (!answers.length) return null;
  const sorted = [...answers].sort((a, b) => (b.upvotes - b.downvotes) - (a.upvotes - a.downvotes));
  const top = sorted[0];
  if (!top) return null;
  // Require at least 2 net upvotes to verify
  const net = top.upvotes - top.downvotes;
  return net >= 2 ? top.id : null;
}

const CommunityPage = () => {
  const { toast } = useToast();
  // Q&A state
  const [questions, setQuestions] = useState<QAQuestion[]>([]);
  const [loading, setLoading] = useState(false);
  // Create Question Dialog
  const [isCreating, setIsCreating] = useState(false);
  const [newQ, setNewQ] = useState({ title: "", content: "", cropTag: "", diseaseTag: "", panchayat: "" });
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCrop, setFilterCrop] = useState<string>("");
  const [filterDisease, setFilterDisease] = useState<string>("");
  const [filterPanchayat, setFilterPanchayat] = useState<string>("");
  // Answer dialog
  const [activeQuestionId, setActiveQuestionId] = useState<string | null>(null);
  const [answerText, setAnswerText] = useState("");
  const [answerAnon, setAnswerAnon] = useState(true);
  // Voice to text
  const [recording, setRecording] = useState(false);
  const recognitionRef = useRef<any>(null);

  // Try to load from Supabase; if not available, load sample
  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        if (!supabase) throw new Error("supabase not configured");
        const { data: qRows, error: qErr } = await supabase
          .from("community_questions")
          .select("id, title, content, cropTag, diseaseTag, panchayat, createdAt")
          .order("createdAt", { ascending: false });
        if (qErr) throw qErr;
        const qIds = (qRows || []).map((q: any) => q.id);
        const { data: aRows, error: aErr } = await supabase
          .from("community_answers")
          .select("id, questionId, content, createdAt, upvotes, downvotes, verified, authorAnon")
          .in("questionId", qIds.length ? qIds : ["-no-"]);
        if (aErr) throw aErr;
        const grouped: Record<string, QAAnswer[]> = {};
        (aRows || []).forEach((a: any) => {
          const ans: QAAnswer = {
            id: String(a.id),
            questionId: String(a.questionId),
            content: a.content,
            createdAt: a.createdAt || new Date().toISOString(),
            upvotes: a.upvotes || 0,
            downvotes: a.downvotes || 0,
            verified: !!a.verified,
            authorAnon: a.authorAnon ?? true,
          };
          (grouped[ans.questionId] ||= []).push(ans);
        });
        const list: QAQuestion[] = (qRows || []).map((q: any) => ({
          id: String(q.id),
          title: q.title,
          content: q.content,
          cropTag: q.cropTag || "",
          diseaseTag: q.diseaseTag || "",
          panchayat: q.panchayat || "",
          createdAt: q.createdAt || new Date().toISOString(),
          trending: false,
          answers: grouped[String(q.id)] || [],
        }));
        setQuestions(list);
      } catch {
        // Fallback mock data
        const mock: QAQuestion[] = [
          {
            id: "1",
            title: "Best organic fertilizer for banana plants?",
            content: "I'm looking for suggestions on organic fertilizers for banana cultivation. Currently using cow dung manure but want to try something more effective.",
            cropTag: "Banana",
            diseaseTag: "",
            panchayat: "Palakkad",
            createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
            trending: true,
            answers: [
              { id: "a1", questionId: "1", content: "Vermicompost + Panchagavya foliar spray every 15 days works well.", createdAt: new Date().toISOString(), upvotes: 6, downvotes: 1, authorAnon: true },
              { id: "a2", questionId: "1", content: "Add farmyard manure and maintain mulching to retain moisture.", createdAt: new Date().toISOString(), upvotes: 4, downvotes: 0, authorAnon: true },
            ],
          },
          {
            id: "2",
            title: "Successful tomato harvest using drip irrigation",
            content: "Got 40% more yield with drip + proper spacing. AMA!",
            cropTag: "Tomato",
            diseaseTag: "",
            panchayat: "Thrissur",
            createdAt: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
            trending: false,
            answers: [
              { id: "a3", questionId: "2", content: "How many emitters per plant did you use?", createdAt: new Date().toISOString(), upvotes: 2, downvotes: 0, authorAnon: true },
              { id: "a4", questionId: "2", content: "Use 16 mm laterals with 20 cm spacing.", createdAt: new Date().toISOString(), upvotes: 3, downvotes: 1, authorAnon: true },
            ],
          },
          {
            id: "3",
            title: "Pest alert: White fly attack in chili plants",
            content: "Neem oil not very effective. Any organic solutions?",
            cropTag: "Chili",
            diseaseTag: "Whitefly",
            panchayat: "Kozhikode",
            createdAt: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
            trending: true,
            answers: [
              { id: "a5", questionId: "3", content: "Release Encarsia formosa if available; also try yellow sticky traps.", createdAt: new Date().toISOString(), upvotes: 7, downvotes: 0, authorAnon: true },
              { id: "a6", questionId: "3", content: "Soap solution (0.5%) + neem weekly.", createdAt: new Date().toISOString(), upvotes: 2, downvotes: 0, authorAnon: true },
            ],
          },
          {
            id: "4",
            title: "Government subsidy for solar water pumps",
            content: "Anyone applied for the new solar pump subsidy?",
            cropTag: "General",
            diseaseTag: "",
            panchayat: "Kottayam",
            createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
            trending: false,
            answers: [
              { id: "a7", questionId: "4", content: "Visit local agriculture office; keep land ownership docs and Aadhaar.", createdAt: new Date().toISOString(), upvotes: 1, downvotes: 0, authorAnon: true },
            ],
          },
        ];
        setQuestions(mock);
      } finally {
        setLoading(false);
      }
    };
    void load();
  }, []);

  // Create Question
  const createQuestion = async () => {
    if (!newQ.title || !newQ.content) {
      toast({ title: "Missing fields", description: "Title and details are required", variant: "destructive" });
      return;
    }
    const mod = await moderateText(`${newQ.title}\n${newQ.content}`);
    if (!mod.ok) {
      toast({ title: "Blocked by moderation", description: mod.reason || "Content not allowed", variant: "destructive" });
      return;
    }
    const q: QAQuestion = {
      id: String(Date.now()),
      title: newQ.title,
      content: newQ.content,
      cropTag: newQ.cropTag || "",
      diseaseTag: newQ.diseaseTag || "",
      panchayat: newQ.panchayat || "",
      createdAt: new Date().toISOString(),
      trending: false,
      answers: [],
    };
    setQuestions(prev => [q, ...prev]);
    setIsCreating(false);
    setNewQ({ title: "", content: "", cropTag: "", diseaseTag: "", panchayat: "" });
    // Persist if possible
    try {
      await supabase.from("community_questions").insert([{
        id: q.id,
        title: q.title,
        content: q.content,
        cropTag: q.cropTag,
        diseaseTag: q.diseaseTag,
        panchayat: q.panchayat,
        createdAt: q.createdAt,
      }]);
    } catch {}
    toast({ title: "Question posted", description: "Thanks for contributing anonymously!" });
  };

  // Answer creation
  const submitAnswer = async (qid: string) => {
    if (!answerText.trim()) return;
    const mod = await moderateText(answerText);
    if (!mod.ok) {
      toast({ title: "Blocked by moderation", description: mod.reason || "Content not allowed", variant: "destructive" });
      return;
    }
    const ans: QAAnswer = {
      id: `${qid}-${Date.now()}`,
      questionId: qid,
      content: answerText.trim(),
      createdAt: new Date().toISOString(),
      upvotes: 0,
      downvotes: 0,
      authorAnon: answerAnon,
    };
    setQuestions(prev => prev.map(q => q.id === qid ? { ...q, answers: [ans, ...q.answers] } : q));
    setActiveQuestionId(null);
    setAnswerText("");
    // Persist if possible
    try {
      await supabase.from("community_answers").insert([{
        id: ans.id,
        questionId: qid,
        content: ans.content,
        createdAt: ans.createdAt,
        upvotes: 0,
        downvotes: 0,
        verified: false,
        authorAnon: ans.authorAnon,
      }]);
    } catch {}
    toast({ title: "Answer posted", description: "Thanks for sharing your practice!" });
  };

  // Voting with local guard
  const voteKey = (aid: string) => `dk-vote-${aid}`;
  const onVote = (qid: string, aid: string, dir: "up" | "down") => {
    const current = localStorage.getItem(voteKey(aid));
    const next = current === dir ? null : dir; // toggle
    localStorage.setItem(voteKey(aid), next || "");
    setQuestions(prev => prev.map(q => {
      if (q.id !== qid) return q;
      const answers = q.answers.map(a => {
        if (a.id !== aid) return a;
        let up = a.upvotes, down = a.downvotes;
        if (current === "up") up -= 1; if (current === "down") down -= 1;
        if (next === "up") up += 1; if (next === "down") down += 1;
        return { ...a, upvotes: Math.max(0, up), downvotes: Math.max(0, down) };
      });
      // recompute verified
      const verifiedId = computeVerified(answers);
      const final = answers.map(a => ({ ...a, verified: a.id === verifiedId }));
      return { ...q, answers: final };
    }));
    // Best-effort persist
    try {
      const q = questions.find(q => q.id === qid);
      const a = q?.answers.find(a => a.id === aid);
      if (a) {
        void supabase.from("community_answers").update({ upvotes: a.upvotes, downvotes: a.downvotes, verified: !!a.verified }).eq("id", aid);
      }
    } catch {}
  };

  // Voice-to-text controls
  const canVoice = typeof window !== "undefined" && ("webkitSpeechRecognition" in window || "SpeechRecognition" in window);
  const startVoice = () => {
    if (!canVoice || recording) return;
    const Rec: any = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
    const rec = new Rec();
    rec.lang = "en-IN"; // You can switch to "ml-IN" when supported for Malayalam
    rec.continuous = false;
    rec.interimResults = false;
    rec.onresult = (e: any) => {
      const transcript = e.results[0][0].transcript;
      setAnswerText(prev => (prev ? prev + " " : "") + transcript);
    };
    rec.onerror = () => { setRecording(false); };
    rec.onend = () => { setRecording(false); };
    recognitionRef.current = rec;
    setRecording(true);
    rec.start();
  };
  const stopVoice = () => {
    try { recognitionRef.current?.stop?.(); } catch {}
    setRecording(false);
  };

  const filtered = useMemo(() => {
    return questions.filter(q => {
      const term = searchTerm.toLowerCase();
      const matchesTerm = !term || q.title.toLowerCase().includes(term) || q.content.toLowerCase().includes(term);
      const cropOk = !filterCrop || (q.cropTag || "").toLowerCase() === filterCrop.toLowerCase();
      const disOk = !filterDisease || (q.diseaseTag || "").toLowerCase() === filterDisease.toLowerCase();
      const panOk = !filterPanchayat || (q.panchayat || "").toLowerCase() === filterPanchayat.toLowerCase();
      return matchesTerm && cropOk && disOk && panOk;
    });
  }, [questions, searchTerm, filterCrop, filterDisease, filterPanchayat]);

  const getCategoryColor = (label: string) => {
    const colors: Record<string, string> = {
      "Trending": "bg-blue-500/20 text-blue-700 dark:text-blue-300",
      "Verified": "bg-emerald-500/20 text-emerald-700 dark:text-emerald-300",
      "General": "bg-muted text-muted-foreground",
    };
    return colors[label] || colors.General;
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
            <h1 className="text-2xl font-bold text-foreground">Community Hub</h1>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" asChild>
              <Link to="/chat-room">Chat Room</Link>
            </Button>
          <Dialog open={isCreating} onOpenChange={setIsCreating}>
            <DialogTrigger asChild>
              <Button className="gradient-primary text-primary-foreground">
                <Plus className="h-4 w-4 mr-2" />
                Ask Anonymously
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Ask the Community (Anonymous)</DialogTitle>
                <DialogDescription>
                  Share your farming question. Harmful or abusive content will be blocked.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <Input placeholder="Question title" value={newQ.title} onChange={(e) => setNewQ({ ...newQ, title: e.target.value })} />
                <Textarea placeholder="Describe your problem or question..." value={newQ.content} onChange={(e) => setNewQ({ ...newQ, content: e.target.value })} className="min-h-[120px]" />
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <Select value={newQ.cropTag || undefined} onValueChange={(v) => setNewQ({ ...newQ, cropTag: v })}>
                    <SelectTrigger><SelectValue placeholder="Crop" /></SelectTrigger>
                    <SelectContent>
                      {['Banana','Tomato','Chili','Paddy','Coconut','General'].map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                    </SelectContent>
                  </Select>
                  <Select value={newQ.diseaseTag || undefined} onValueChange={(v) => setNewQ({ ...newQ, diseaseTag: v === 'none' ? '' : v })}>
                    <SelectTrigger><SelectValue placeholder="Disease" /></SelectTrigger>
                    <SelectContent>
                      {['Whitefly','Blight','Rust','Wilt'].map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                      <SelectItem value="none">None</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select value={newQ.panchayat || undefined} onValueChange={(v) => setNewQ({ ...newQ, panchayat: v })}>
                    <SelectTrigger><SelectValue placeholder="Panchayat" /></SelectTrigger>
                    <SelectContent>
                      {['Palakkad','Thrissur','Kozhikode','Kottayam','Alappuzha'].map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex justify-end space-x-2">
                  <Button variant="outline" onClick={() => setIsCreating(false)}>
                    Cancel
                  </Button>
                  <Button onClick={createQuestion} className="gradient-primary text-primary-foreground">
                    Submit Question
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
              <Users className="h-8 w-8 mx-auto mb-2 text-primary" />
              <p className="text-2xl font-bold">1,248</p>
              <p className="text-sm text-muted-foreground">Active Members</p>
            </CardContent>
          </Card>
          <Card className="agricultural-card">
            <CardContent className="p-4 text-center">
              <MessageCircle className="h-8 w-8 mx-auto mb-2 text-blue-500" />
              <p className="text-2xl font-bold">{questions.length}</p>
              <p className="text-sm text-muted-foreground">Total Posts</p>
            </CardContent>
          </Card>
          <Card className="agricultural-card">
            <CardContent className="p-4 text-center">
              <TrendingUp className="h-8 w-8 mx-auto mb-2 text-green-500" />
              <p className="text-2xl font-bold">2</p>
              <p className="text-sm text-muted-foreground">Trending</p>
            </CardContent>
          </Card>
        </div>

        {/* Search + Filters */}
        <Card className="agricultural-card mb-6">
          <CardContent className="p-4 space-y-3">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search questions..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-10" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <Select value={(filterCrop || 'all')} onValueChange={(v) => setFilterCrop(v === 'all' ? '' : v)}>
                <SelectTrigger><SelectValue placeholder="Filter by crop" /></SelectTrigger>
                <SelectContent>
                  {['all','Banana','Tomato','Chili','Paddy','Coconut','General'].map(c => <SelectItem key={c} value={c}>{c === 'all' ? 'All crops' : c}</SelectItem>)}
                </SelectContent>
              </Select>
              <Select value={(filterDisease || 'all')} onValueChange={(v) => setFilterDisease(v === 'all' ? '' : v)}>
                <SelectTrigger><SelectValue placeholder="Filter by disease" /></SelectTrigger>
                <SelectContent>
                  {['all','Whitefly','Blight','Rust','Wilt'].map(c => <SelectItem key={c} value={c}>{c === 'all' ? 'All diseases' : c}</SelectItem>)}
                </SelectContent>
              </Select>
              <Select value={(filterPanchayat || 'all')} onValueChange={(v) => setFilterPanchayat(v === 'all' ? '' : v)}>
                <SelectTrigger><SelectValue placeholder="Filter by panchayat" /></SelectTrigger>
                <SelectContent>
                  {['all','Palakkad','Thrissur','Kozhikode','Kottayam','Alappuzha'].map(c => <SelectItem key={c} value={c}>{c === 'all' ? 'All panchayats' : c}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Questions List */}
        <div className="space-y-4">
          {filtered.map((q) => {
            const verifiedId = computeVerified(q.answers);
            const answers = q.answers
              .map(a => ({ ...a, verified: a.id === verifiedId }))
              .sort((a,b) => (b.verified ? 1 : 0) - (a.verified ? 1 : 0) || (b.upvotes - b.downvotes) - (a.upvotes - a.downvotes));
            return (
              <Card key={q.id} className="agricultural-card">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-3">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src="" />
                        <AvatarFallback>AN</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-semibold text-foreground">Anonymous Farmer</p>
                        <p className="text-sm text-muted-foreground">{q.panchayat || 'Kerala'} • {new Date(q.createdAt).toLocaleString()}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      {q.trending && (
                        <Badge variant="secondary" className="text-xs">
                          <TrendingUp className="h-3 w-3 mr-1" />
                          Trending
                        </Badge>
                      )}
                      {q.cropTag && <Badge className="bg-green-500/20 text-green-700 dark:text-green-300 text-xs">{q.cropTag}</Badge>}
                      {q.diseaseTag && <Badge className="bg-red-500/20 text-red-700 dark:text-red-300 text-xs">{q.diseaseTag}</Badge>}
                    </div>
                  </div>
                  <CardTitle className="text-lg mt-3">{q.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-foreground mb-4">{q.content}</p>

                  {/* Answers */}
                  <div className="space-y-3">
                    {answers.map(a => (
                      <div key={a.id} className="rounded-lg border border-border p-3">
                        <div className="flex items-center justify-between mb-1">
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Avatar className="h-6 w-6">
                              <AvatarImage src="" />
                              <AvatarFallback>AN</AvatarFallback>
                            </Avatar>
                            <span>{a.authorAnon ? 'Anonymous' : 'Member'}</span>
                            <span>• {new Date(a.createdAt).toLocaleString()}</span>
                          </div>
                          {a.verified && (
                            <Badge className={getCategoryColor('Verified')}>
                              <ShieldCheck className="h-3 w-3 mr-1" />
                              Verified Practice
                            </Badge>
                          )}
                        </div>
                        <p className="mb-2 text-foreground">{a.content}</p>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-primary" onClick={() => onVote(q.id, a.id, 'up')}>
                              <ThumbsUp className="h-4 w-4 mr-1" /> {a.upvotes}
                            </Button>
                            <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-primary" onClick={() => onVote(q.id, a.id, 'down')}>
                              <ThumbsDown className="h-4 w-4 mr-1" /> {a.downvotes}
                            </Button>
                          </div>
                          <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-destructive">
                            <Flag className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                    {answers.length === 0 && (
                      <p className="text-sm text-muted-foreground">No answers yet. Be the first to share a safe, effective practice.</p>
                    )}
                  </div>

                  {/* Add Answer */}
                  <div className="mt-4">
                    <Dialog open={activeQuestionId === q.id} onOpenChange={(o) => { setActiveQuestionId(o ? q.id : null); setAnswerText(""); }}>
                      <DialogTrigger asChild>
                        <Button variant="outline">
                          <Reply className="h-4 w-4 mr-2" /> Add Answer (Anonymous)
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-md">
                        <DialogHeader>
                          <DialogTitle>Share your practice</DialogTitle>
                          <DialogDescription>Keep it respectful and useful. Harmful or abusive content will be blocked.</DialogDescription>
                        </DialogHeader>
                        <div className="space-y-3">
                          <Textarea value={answerText} onChange={(e) => setAnswerText(e.target.value)} placeholder="Type your answer..." className="min-h-[120px]" />
                          <div className="flex items-center justify-between">
                            <Button type="button" variant="ghost" size="sm" onClick={recording ? stopVoice : startVoice} disabled={!canVoice}>
                              {recording ? <MicOff className="h-4 w-4 mr-2" /> : <Mic className="h-4 w-4 mr-2" />} {recording ? 'Stop' : 'Voice to Text'}
                            </Button>
                            <div className="text-xs text-muted-foreground">Posting as Anonymous</div>
                          </div>
                          <div className="flex justify-end gap-2">
                            <Button variant="outline" onClick={() => { setActiveQuestionId(null); setAnswerText(""); }}>Cancel</Button>
                            <Button onClick={() => submitAnswer(q.id)} className="gradient-primary text-primary-foreground">Submit Answer</Button>
                          </div>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {filtered.length === 0 && (
          <Card className="agricultural-card">
            <CardContent className="p-6 text-center">
              <Users className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-muted-foreground mb-4">No posts found matching your search.</p>
              <Button onClick={() => setIsCreating(true)} className="gradient-primary text-primary-foreground">
                <Plus className="h-4 w-4 mr-2" />
                Create First Post
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default CommunityPage;