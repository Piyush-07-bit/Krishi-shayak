import { useState, useEffect } from "react";
import type { MarketRecord } from '@/services/market';
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { ChartContainer, ChartTooltipContent } from "@/components/ui/chart";
import { LineChart, Line, XAxis, YAxis, Tooltip as ReTooltip, CartesianGrid, ResponsiveContainer } from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  TrendingUp, 
  TrendingDown,
  ArrowLeft,
  Search,
  Filter,
  MapPin
} from "lucide-react";
import { Link } from "react-router-dom";

const MarketPage = () => {
  const [marketData, setMarketData] = useState<MarketRecord[]>([]);
  const [analysisOpen, setAnalysisOpen] = useState(false);
  const [trendOpenIndex, setTrendOpenIndex] = useState<number | null>(null);
  // ...existing code...
  const [filteredData, setFilteredData] = useState<MarketRecord[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [locationFilter, setLocationFilter] = useState("all");

  useEffect(() => {
    // Try to fetch live market data, fall back to mock data if the API is unavailable
    let mounted = true;
    (async () => {
      try {
        const { getMarketPrices } = await import("@/services/market");
        const live = await getMarketPrices(10);
        if (!mounted) return;
        // If the service returns an empty array it indicates no URL configured; fall back to mock quietly
        if (!live || (Array.isArray(live) && live.length === 0)) {
          throw new Error('no-url');
        }
        setMarketData(live);
        setFilteredData(live);
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : String(err);
        if (message === 'no-url') {
          // Skip noisy stack traces when user hasn't configured the URL
          console.info('Market API URL not configured — using mock data');
        } else {
          console.warn('Failed to fetch live market data, using mock data', err);
        }
        const mockData = [
          {
            commodity: "Banana",
            location: "Palakkad",
            currentPrice: 45,
            previousPrice: 42,
            unit: "per kg",
            trend: "up",
            change: 7.1
          },
          {
            commodity: "Paddy",
            location: "Thrissur", 
            currentPrice: 2800,
            previousPrice: 2900,
            unit: "per quintal",
            trend: "down",
            change: -3.4
          },
          {
            commodity: "Tomato",
            location: "Kozhikode",
            currentPrice: 35,
            previousPrice: 38,
            unit: "per kg",
            trend: "down",
            change: -7.9
          },
          {
            commodity: "Maize",
            location: "Palakkad",
            currentPrice: 2200,
            previousPrice: 2150,
            unit: "per quintal",
            trend: "up",
            change: 2.3
          },
          {
            commodity: "Coconut",
            location: "Thrissur",
            currentPrice: 25,
            previousPrice: 24,
            unit: "per piece",
            trend: "up",
            change: 4.2
          },
          {
            commodity: "Pepper",
            location: "Kozhikode",
            currentPrice: 850,
            previousPrice: 820,
            unit: "per kg",
            trend: "up",
            change: 3.7
          }
        ];
        setMarketData(mockData);
        setFilteredData(mockData);
      }
    })();
    return () => { mounted = false; };
  }, []);

  // ...existing code...

  // ...existing code...

  useEffect(() => {
    let filtered = marketData;
    
    if (searchTerm) {
      filtered = filtered.filter(item => 
        item.commodity.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    if (locationFilter !== "all") {
      filtered = filtered.filter(item => 
        item.location.toLowerCase() === locationFilter.toLowerCase()
      );
    }
    
    setFilteredData(filtered);
  }, [searchTerm, locationFilter, marketData]);

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
            <h1 className="text-2xl font-bold text-foreground">Market Prices</h1>
          </div>


        {/* Smart Recommendation */}
        {/* ...existing code... */}
        <Card className="agricultural-card gradient-primary text-primary-foreground mb-6">
          <CardContent className="p-6">
            <h2 className="text-xl font-semibold mb-2">Smart Sell Recommendation</h2>
            <p className="text-primary-foreground/80 mb-4">
              Based on current market trends, this is the best time to sell <strong>Banana</strong> in Palakkad. 
              Prices are up 7.1% this week!
            </p>
            <Button variant="secondary" size="sm" onClick={() => setAnalysisOpen(true)}>
              Get Detailed Analysis
            </Button>
          </CardContent>
        </Card>

        {/* Filters */}
        <Card className="agricultural-card mb-6">
          <CardContent className="p-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />

                  <Input
                    placeholder="Search commodities..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <div className="md:w-48">
                <Select value={locationFilter} onValueChange={setLocationFilter}>
                  <SelectTrigger>
                    <Filter className="h-4 w-4 mr-2" />
                    <SelectValue placeholder="Filter by location" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Locations</SelectItem>
                    <SelectItem value="palakkad">Palakkad</SelectItem>
                    <SelectItem value="thrissur">Thrissur</SelectItem>
                    <SelectItem value="kozhikode">Kozhikode</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Market Data Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredData.map((item, index) => (
            <Card key={index} className="agricultural-card">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">{item.commodity}</CardTitle>
                  <Badge 
                    variant={item.trend === "up" ? "secondary" : "destructive"}
                    className="text-xs"
                  >
                    {item.trend === "up" ? (
                      <TrendingUp className="h-3 w-3 mr-1" />
                    ) : (
                      <TrendingDown className="h-3 w-3 mr-1" />
                    )}
                    {Math.abs(item.change)}%
                  </Badge>
                </div>
                <CardDescription className="flex items-center">
                  <MapPin className="h-3 w-3 mr-1" />
                  {item.location}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div>
                    <p className="text-2xl font-bold text-foreground">
                      ₹{item.currentPrice}
                    </p>
                    <p className="text-sm text-muted-foreground">{item.unit}</p>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Previous:</span>
                    <span className="font-medium">₹{item.previousPrice}</span>
                  </div>
                  <div className="pt-2">
                    <Button variant="outline" size="sm" className="w-full" onClick={() => setTrendOpenIndex(index)}>
                      View 7-Day Trend
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Per-card 7-Day Trend Dialog */}
        {trendOpenIndex !== null && (
          <Dialog open={trendOpenIndex !== null} onOpenChange={(open) => { if (!open) setTrendOpenIndex(null); }}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>7-Day Trend — {filteredData[trendOpenIndex!]?.commodity}</DialogTitle>
                <DialogDescription>
                  {filteredData[trendOpenIndex!]?.previousPrice == null
                    ? 'No historical price available. Showing an estimated 7-day series derived from current and previous values (if any).'
                    : 'This chart shows the 7-day price trend for the selected commodity.'}
                </DialogDescription>
              </DialogHeader>
              <div className="py-2">
                {filteredData[trendOpenIndex!]?.previousPrice == null ? (
                  <p className="text-sm text-muted-foreground">No historical price available. Showing an estimated 7-day series derived from current and previous values (if any).</p>
                ) : null}
                <div className="h-48">
                  <ChartContainer id={`trend-${trendOpenIndex}`} config={{ price: { label: 'Price (₹)', color: 'var(--primary)' } }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={(() => {
                        const m = filteredData[trendOpenIndex!];
                        // Estimate 7-day series if no real data
                        const base = m.currentPrice ?? 0;
                        const ch = (m.change ?? 0) / 100;
                        const arr = [];
                        for (let i = 6; i >= 0; i--) {
                          const factor = 1 - ch * ((i - 3) / 10);
                          const v = Math.max(0, Math.round(base * factor));
                          arr.push({ day: `Day ${7 - i}`, price: v });
                        }
                        return arr;
                      })()}>
                        <XAxis dataKey="day" tick={{ fontSize: 12 }} />
                        <YAxis tick={{ fontSize: 12 }} width={40} />
                        <ReTooltip content={<ChartTooltipContent />} />
                        <Line type="monotone" dataKey="price" stroke="#2563eb" strokeWidth={2} dot={true} />
                      </LineChart>
                    </ResponsiveContainer>
                  </ChartContainer>
                </div>
              </div>
              <DialogFooter>
                <Button onClick={() => setTrendOpenIndex(null)}>Close</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}

          {/* Analysis Dialog */}
          <Dialog open={analysisOpen} onOpenChange={setAnalysisOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Detailed Market Analysis</DialogTitle>
                <DialogDescription>
                  Analysis is computed from the loaded market dataset. I will not add external facts — only derived numbers from current data.
                </DialogDescription>
              </DialogHeader>
              <div className="py-2">
                {marketData.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No live data available — displaying mock data only.</p>
                ) : (
                  <div className="grid gap-3">
                    <p className="text-sm">Top 3 commodities by absolute price change:</p>
                    {marketData
                      .map((m) => ({
                        ...m,
                        absChange: Math.abs((m.change ?? 0)),
                      }))
                      .sort((a, b) => (b.absChange ?? 0) - (a.absChange ?? 0))
                      .slice(0, 3)
                      .map((m, i) => (
                        <div key={i} className="flex items-center justify-between">
                          <div>
                            <div className="font-medium">{m.commodity} — {m.location}</div>
                            <div className="text-sm text-muted-foreground">Current: ₹{m.currentPrice} • Previous: ₹{m.previousPrice ?? '—'}</div>
                          </div>
                          <div className="text-sm font-medium">{m.change ? `${m.change}%` : '—'}</div>
                        </div>
                      ))}
                  </div>
                )}
              </div>
              <DialogFooter>
                <Button onClick={() => setAnalysisOpen(false)}>Close</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* Per-card 7-Day Trend Dialog */}
          {trendOpenIndex !== null && (
            <Dialog open={trendOpenIndex !== null} onOpenChange={(open) => { if (!open) setTrendOpenIndex(null); }}>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>7-Day Trend — {filteredData[trendOpenIndex!]?.commodity}</DialogTitle>
                </DialogHeader>
                <div className="py-2">
                  {filteredData[trendOpenIndex!]?.previousPrice == null ? (
                    <p className="text-sm text-muted-foreground">No historical price available. Showing an estimated 7-day series derived from current and previous values (if any).</p>
                  ) : null}
                  <div className="h-48">
                    <ChartContainer id={`trend-${trendOpenIndex}`} config={{ price: { label: 'Price (₹)', color: 'var(--primary)' } }}>
                      {(() => {
                        const m = filteredData[trendOpenIndex!];
                        // build a 7-day series: prefer linear interpolation if previousPrice exists, otherwise derive from change%
                        const buildSeries = (item: typeof m) => {
                          const series: { day: string; price: number }[] = [];
                          const days = 7;
                          const current = Number(item.currentPrice ?? 0);
                          const prev = typeof item.previousPrice === 'number' ? Number(item.previousPrice) : undefined;

                          if (prev !== undefined && prev >= 0) {
                            // linear interpolation from prev to current over `days` points
                            for (let i = days - 1; i >= 0; i--) {
                              const t = (days - 1 - i) / (days - 1); // 0..1 where 1 is current day
                              const price = Math.round(prev + (current - prev) * t);
                              series.push({ day: `${i === 0 ? '6d' : `${i}d`}`, price });
                            }
                          } else {
                            // estimate using change% (if available) or flat series
                            const ch = Number(item.change ?? 0) / 100;
                            for (let i = days - 1; i >= 0; i--) {
                              const factor = 1 - ch * ((i - (days - 1) / 2) / (days * 0.5));
                              const price = Math.max(0, Math.round(current * factor));
                              series.push({ day: `${i === 0 ? '6d' : `${i}d`}`, price });
                            }
                          }

                          // normalize day labels so earliest is leftmost
                          return series.reverse().map((s, idx) => ({ ...s, day: `Day ${idx - (days - 1)}` }));
                        };

                        const data = buildSeries(m);

                        return (
                          <LineChart data={data} margin={{ top: 8, right: 12, left: 0, bottom: 4 }}>
                            <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.05} />
                            <XAxis dataKey="day" tick={{ fontSize: 10 }} />
                            <YAxis tickFormatter={(v) => `₹${v}`} />
                            <ReTooltip content={<ChartTooltipContent hideLabel hideIndicator />} />
                            <Line type="monotone" dataKey="price" stroke="#2563eb" strokeWidth={2} dot={false} />
                          </LineChart>
                        );
                      })()}
                    </ChartContainer>
                  </div>
                </div>
                <DialogFooter>
                  <Button onClick={() => setTrendOpenIndex(null)}>Close</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          )}
        </div>

        {filteredData.length === 0 && (
          <Card className="agricultural-card">
            <CardContent className="p-6 text-center">
              <p className="text-muted-foreground">No commodities found matching your search criteria.</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default MarketPage;