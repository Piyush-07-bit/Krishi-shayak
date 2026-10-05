import { useEffect, useRef, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Mic, MicOff, Paperclip, Send, Vote, Library, Loader2, ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/services/supabase";
import { moderateContent } from "@/services/moderation";
import { translateText } from "@/services/translation";

type Message = {
  id: string;
  user_id: string;
  username: string;
  region?: string | null;
  content: string;
  created_at: string;
  audio_url?: string | null;
  translated?: string;
};

type Poll = {
  id: string;
  question: string;
  options: { id: string; text: string; votes: number }[];
  created_at: string;
};

type Identity = { user_id: string; username: string; region: string };

export default function ChatRoomPage() {
  const { toast } = useToast();
  const [identity, setIdentity] = useState<Identity | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [polls, setPolls] = useState<Poll[]>([]);
  const [text, setText] = useState("");
  const [targetLang, setTargetLang] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const feedRef = useRef<HTMLDivElement | null>(null);

  // Voice recording
  const [recording, setRecording] = useState(false);
  const mediaRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  // Load authenticated identity from Supabase and set region as Global
  useEffect(() => {
    const loadIdentity = async () => {
      try {
        const { data, error } = await supabase.auth.getUser();
        if (error) throw error;
        const user = data.user;
        if (!user) return;
        // Try to get full name from users table, else from metadata/email
        let username: string | null = null;
        try {
          const { data: profile } = await supabase
            .from("users")
            .select("fullName")
            .eq("id", user.id)
            .maybeSingle();
          if (profile?.fullName) username = profile.fullName as string;
        } catch {}
        if (!username) {
          const meta: any = user.user_metadata || {};
          username = meta.fullName || meta.name || (user.email ? user.email.split("@")[0] : "Farmer");
        }
        setIdentity({ user_id: user.id, username, region: "Global" });
      } catch (e) {
        // keep identity null on failure; ProtectedRoute should prevent access
      }
    };
    void loadIdentity();
  }, []);

  useEffect(() => {
    const init = async () => {
      try {
        // Load recent messages
        const { data, error } = await supabase
          .from("messages")
          .select("id, user_id, username, region, content, created_at, audio_url")
          .order("created_at", { ascending: true })
          .limit(200);
        if (!error && data) setMessages(data as Message[]);
      } catch {}

      // Subscribe to realtime INSERTs on messages
      try {
        const channel = supabase
          .channel("room-messages")
          .on("postgres_changes", { event: "INSERT", schema: "public", table: "messages" }, (payload: any) => {
            const row = payload.new as Message;
            setMessages((prev) => [...prev, row]);
            feedRef.current?.scrollTo({ top: feedRef.current.scrollHeight, behavior: "smooth" });
          })
          .subscribe();
        return () => { void supabase.removeChannel(channel); };
      } catch {}
    };
    const cleanup = init();
    return () => { void cleanup; };
  }, []);

  useEffect(() => {
    feedRef.current?.scrollTo({ top: feedRef.current.scrollHeight });
  }, [messages.length]);

  async function sendMessage() {
    if (!text.trim()) return;
    if (!identity) {
      toast({ title: "Not signed in", description: "Please sign in to send messages", variant: "destructive" });
      return;
    }
    setLoading(true);
    try {
      const mod = await moderateContent(text);
      if (!mod.ok) {
        toast({ title: "Message blocked", description: mod.reason || "Not allowed", variant: "destructive" });
        setLoading(false);
        return;
      }
      const content = text.trim();
      const insert = {
        user_id: identity.user_id,
        username: identity.username,
        region: "Global",
        content,
      };
      const { data, error } = await supabase.from("messages").insert(insert).select().single();
      if (error) throw error;
      if (targetLang) {
        const translated = await translateText(content, targetLang);
        setMessages((prev) => prev.map((m) => (m.id === data.id ? { ...m, translated } : m)));
      }
      setText("");
    } catch (e: any) {
      toast({ title: "Failed to send", description: e?.message || "Try again", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }

  async function startRecording() {
    if (recording) return;
    if (!identity) {
      toast({ title: "Not signed in", description: "Please sign in to record a voice message", variant: "destructive" });
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const media = new MediaRecorder(stream);
      chunksRef.current = [];
      media.ondataavailable = (e) => { if (e.data.size > 0) chunksRef.current.push(e.data); };
      media.onstop = async () => {
        const blob = new Blob(chunksRef.current, { type: "audio/webm" });
        if (blob.size < 1024) return; // ignore tiny clips
        setUploading(true);
        try {
          const path = `voice/${identity.user_id}/${Date.now()}.webm`;
          const { error: upErr } = await supabase.storage.from("voice-messages").upload(path, blob, { contentType: "audio/webm" });
          if (!upErr) {
            const { data } = supabase.storage.from("voice-messages").getPublicUrl(path);
            const audio_url = data.publicUrl;
            await supabase.from("messages").insert({
              user_id: identity.user_id,
              username: identity.username,
              region: "Global",
              content: "[voice message]",
              audio_url,
            });
          }
        } finally {
          setUploading(false);
        }
      };
      media.start();
      mediaRef.current = media;
      setRecording(true);
    } catch {
      setRecording(false);
    }
  }
  function stopRecording() {
    try { mediaRef.current?.stop(); } catch {}
    setRecording(false);
  }

  // Simple in-memory polls (can be moved to Supabase)
  const [pollOpen, setPollOpen] = useState(false);
  const [pollQ, setPollQ] = useState("");
  const [pollOpts, setPollOpts] = useState<string>("");
  function createPoll() {
    const options = pollOpts.split("\n").map((s) => s.trim()).filter(Boolean).slice(0, 6);
    if (!pollQ || options.length < 2) return;
    const poll: Poll = {
      id: crypto.randomUUID(),
      question: pollQ,
      options: options.map((t) => ({ id: crypto.randomUUID(), text: t, votes: 0 })),
      created_at: new Date().toISOString(),
    };
    setPolls((p) => [poll, ...p]);
    setPollOpen(false); setPollQ(""); setPollOpts("");
  }
  function votePoll(pid: string, oid: string) {
    setPolls((prev) => prev.map((p) => p.id === pid ? { ...p, options: p.options.map((o) => o.id === oid ? { ...o, votes: o.votes + 1 } : o) } : p));
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto max-w-3xl p-4 space-y-4">
        <div className="flex items-center justify-between">
          <Button variant="ghost" size="sm" asChild>
            <Link to="/community">
              <ArrowLeft className="h-4 w-4 mr-2" /> Back
            </Link>
          </Button>
          <div className="text-sm text-muted-foreground">
            {identity ? (
              <>You are {identity.username} • Global</>
            ) : (
              <>Loading identity…</>
            )}
          </div>
        </div>

        <Card className="agricultural-card">
          <CardHeader className="flex items-center justify-between">
            <CardTitle>Realtime Chat Room</CardTitle>
            <div className="flex gap-2">
              <Dialog open={pollOpen} onOpenChange={setPollOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline"><Vote className="h-4 w-4 mr-2"/> New Poll</Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader><DialogTitle>Create a Poll</DialogTitle></DialogHeader>
                  <div className="space-y-2">
                    <Input placeholder="Poll question" value={pollQ} onChange={(e) => setPollQ(e.target.value)} />
                    <Textarea placeholder="Options (one per line)" value={pollOpts} onChange={(e) => setPollOpts(e.target.value)} />
                    <Button onClick={createPoll}>Create</Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </CardHeader>
          <CardContent>
            <div ref={feedRef} className="h-[60vh] overflow-y-auto space-y-3 pr-1">
              {messages.map((m) => (
                <div key={m.id} className="rounded-lg border border-border p-2">
                  <div className="text-xs text-muted-foreground">{m.username} • {m.region || '—'} • {new Date(m.created_at).toLocaleTimeString()}</div>
                  {m.audio_url ? (
                    <audio controls className="mt-1 w-full"><source src={m.audio_url} type="audio/webm" /></audio>
                  ) : (
                    <div className="mt-1 text-foreground whitespace-pre-wrap">{m.translated || m.content}</div>
                  )}
                </div>
              ))}
              {polls.map((p) => (
                <div key={p.id} className="rounded-lg border border-border p-2">
                  <div className="text-sm font-medium mb-2">📊 {p.question}</div>
                  <div className="grid grid-cols-1 gap-2">
                    {p.options.map((o) => (
                      <Button key={o.id} variant="outline" onClick={() => votePoll(p.id, o.id)} className="flex justify-between">
                        <span>{o.text}</span>
                        <Badge variant="secondary">{o.votes}</Badge>
                      </Button>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-3 grid grid-cols-[auto_1fr_auto] gap-2 items-center">
              <Button variant="ghost" onClick={recording ? stopRecording : startRecording} disabled={uploading || !identity}>
                {recording ? <MicOff className="h-4 w-4"/> : <Mic className="h-4 w-4"/>}
              </Button>
              <Input placeholder="Type a message" value={text} onChange={(e) => setText(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); void sendMessage(); } }} disabled={!identity} />
              <Button onClick={sendMessage} disabled={loading || !identity}>
                {loading ? <Loader2 className="h-4 w-4 animate-spin"/> : <Send className="h-4 w-4"/>}
              </Button>
            </div>

            <div className="mt-2 text-xs text-muted-foreground flex items-center gap-2">
              <span>Translate to:</span>
              <Button size="sm" variant={targetLang === 'hi' ? 'default' : 'outline'} onClick={() => setTargetLang(targetLang === 'hi' ? '' : 'hi')}>Hindi</Button>
              <Button size="sm" variant={targetLang === 'ml' ? 'default' : 'outline'} onClick={() => setTargetLang(targetLang === 'ml' ? '' : 'ml')}>Malayalam</Button>
              <Button size="sm" variant={targetLang === 'ta' ? 'default' : 'outline'} onClick={() => setTargetLang(targetLang === 'ta' ? '' : 'ta')}>Tamil</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
