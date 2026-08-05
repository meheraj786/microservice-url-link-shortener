"use client";

import { useState, useEffect } from "react";
import api from "@/app/lib/api";
import { Link2, Copy, Check, LogOut, ArrowUpRight, MousePointerClick } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import {
  Table,
  TableHeader,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
} from "@/components/ui/table";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Skeleton } from "@/components/ui/skeleton";

interface UrlItem {
  id: string;
  shortCode: string;
  originalUrl: string;
  clicks: number;
}

interface DashboardProps {
  onLogout: () => void;
}

export default function Dashboard({ onLogout }: DashboardProps) {
  const [originalUrl, setOriginalUrl] = useState("");
  const [urls, setUrls] = useState<UrlItem[]>([]);
  const [urlsLoading, setUrlsLoading] = useState(true);
  const [loading, setLoading] = useState(false);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [shortUrlResult, setShortUrlResult] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    const fetchUrls = async () => {
      try {
        const { data } = await api.get("/my-urls");
        if (isMounted) setUrls(data);
      } catch (err) {
        console.error("Error fetching URLs:", err);
      } finally {
        if (isMounted) setUrlsLoading(false);
      }
    };

    fetchUrls();

    return () => {
      isMounted = false;
    };
  }, []);

  const handleShorten = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!originalUrl) return;

    setLoading(true);
    setShortUrlResult(null);

    try {
      const { data } = await api.post("/shorten", { originalUrl });
      setShortUrlResult(data.shortUrl);
      setOriginalUrl("");

      const { data: updatedUrls } = await api.get("/my-urls");
      setUrls(updatedUrls);
    } catch (_err) {
      alert("Could not shorten URL.");
      console.error("Error shortening URL:", _err);
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text: string, code: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const totalClicks = urls.reduce((sum, u) => sum + u.clicks, 0);

  return (
    <TooltipProvider>
      <div className="min-h-screen bg-[#0B0C10] relative">
        {/* Ambient glow backdrop */}
        <div className="pointer-events-none fixed inset-0 overflow-hidden">
          <div className="absolute -top-40 left-1/3 h-[420px] w-[420px] rounded-full bg-violet-600/20 blur-[120px]" />
          <div className="absolute top-1/2 -right-32 h-[380px] w-[380px] rounded-full bg-indigo-500/10 blur-[120px]" />
        </div>

        <div className="relative max-w-5xl mx-auto px-4 md:px-8 py-10 md:py-14">
          {/* Top Header */}
          <div className="flex justify-between items-center mb-12">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-indigo-600 shadow-lg shadow-violet-900/40">
                <Link2 className="text-white" size={20} />
              </div>
              <div>
                <h1 className="text-2xl font-semibold tracking-tight text-white">
                  Lily-Link
                </h1>
                <p className="text-xs text-zinc-500 mt-0.5">
                  Microservices link shortener
                </p>
              </div>
            </div>
            <Button
              onClick={onLogout}
              variant="outline"
              className="bg-white/[0.04] border-white/10 text-zinc-300 hover:bg-white/[0.08] hover:text-white font-medium rounded-xl"
            >
              <LogOut size={15} className="mr-2" />
              Log out
            </Button>
          </div>

          {/* Stats row */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            <Card className="bg-white/[0.03] border-white/[0.08] shadow-none rounded-xl">
              <CardContent className="flex flex-row items-center gap-3 py-4">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-violet-500/10 text-violet-400">
                  <Link2 size={16} />
                </div>
                <div>
                  <p className="text-lg font-semibold text-white leading-none">
                    {urls.length}
                  </p>
                  <p className="text-xs text-zinc-500 mt-1">Active links</p>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/[0.03] border-white/[0.08] shadow-none rounded-xl">
              <CardContent className="flex flex-row items-center gap-3 py-4">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-500/10 text-indigo-400">
                  <MousePointerClick size={16} />
                </div>
                <div>
                  <p className="text-lg font-semibold text-white leading-none">
                    {totalClicks}
                  </p>
                  <p className="text-xs text-zinc-500 mt-1">Total clicks</p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Form Card */}
          <Card className="bg-white/[0.03] border-white/[0.08] mb-6 shadow-none rounded-xl">
            <CardContent className="p-6 md:p-7">
              <form onSubmit={handleShorten} className="flex flex-col md:flex-row gap-3">
                <Input
                  type="url"
                  required
                  placeholder="Paste your long link here..."
                  value={originalUrl}
                  onChange={(e) => setOriginalUrl(e.target.value)}
                  className="flex-1 bg-white/[0.02] border-white/10 text-white placeholder:text-zinc-500 focus-visible:ring-violet-500 rounded-lg"
                />
                <Button
                  type="submit"
                  disabled={loading}
                  className="bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-medium px-7 shadow-lg shadow-violet-950/40 rounded-lg"
                >
                  {loading ? "Shortening..." : "Shorten link"}
                </Button>
              </form>

              {shortUrlResult && (
                <div className="mt-5 bg-violet-500/[0.07] border border-violet-500/20 p-4 rounded-xl flex justify-between items-center">
                  <div className="min-w-0">
                    <p className="text-[10px] text-violet-400 font-semibold uppercase tracking-wider">
                      Shortened URL
                    </p>
                    <a
                      href={shortUrlResult}
                      target="_blank"
                      rel="noreferrer"
                      className="text-base font-medium text-white hover:text-violet-300 transition-colors flex items-center gap-1 mt-1 truncate"
                    >
                      {shortUrlResult}
                      <ArrowUpRight size={14} className="shrink-0" />
                    </a>
                  </div>
                  <Tooltip>
                    <TooltipTrigger>
                      <Button
                        size="icon"
                        variant="outline"
                        className="bg-white/[0.05] border-white/10 text-zinc-300 hover:text-white shrink-0 rounded-lg"
                        onClick={() => copyToClipboard(shortUrlResult, "result")}
                      >
                        {copiedCode === "result" ? (
                          <Check size={16} className="text-emerald-400" />
                        ) : (
                          <Copy size={16} />
                        )}
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>{copiedCode === "result" ? "Copied!" : "Copy"}</p>
                    </TooltipContent>
                  </Tooltip>
                </div>
              )}
            </CardContent>
          </Card>

          {/* URLs Table */}
          <Card className="bg-white/[0.03] border-white/[0.08] shadow-none rounded-xl">
            <CardHeader className="px-6 pt-5 pb-0">
              <CardTitle className="text-sm font-semibold text-white tracking-tight">
                My links
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              {urlsLoading ? (
                <div className="space-y-3">
                  {[...Array(3)].map((_, i) => (
                    <Skeleton key={i} className="h-12 w-full bg-white/5 rounded-lg" />
                  ))}
                </div>
              ) : urls.length === 0 ? (
                <div className="text-center py-14">
                  <div className="mx-auto mb-3 flex h-11 w-11 items-center justify-center rounded-full bg-white/[0.04]">
                    <Link2 size={18} className="text-zinc-600" />
                  </div>
                  <p className="text-zinc-500 text-sm">No links shortened yet.</p>
                  <p className="text-zinc-600 text-xs mt-1">
                    Paste a URL above to create your first one.
                  </p>
                </div>
              ) : (
                <Table>
                  <TableHeader className="border-b border-white/10">
                    <TableRow className="border-none hover:bg-transparent">
                      <TableHead className="text-zinc-500 text-[11px] uppercase tracking-wider font-medium">
                        Short link
                      </TableHead>
                      <TableHead className="text-zinc-500 text-[11px] uppercase tracking-wider font-medium">
                        Original link
                      </TableHead>
                      <TableHead className="text-zinc-500 text-[11px] uppercase tracking-wider font-medium text-center">
                        Clicks
                      </TableHead>
                      <TableHead className="text-zinc-500 text-[11px] uppercase tracking-wider font-medium text-right">
                        Action
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {urls.map((item) => {
                      const fullShortUrl = `https://api-gateway-ng5f.onrender.com/${item.shortCode}`;
                      return (
                        <TableRow
                          key={item.id}
                          className="border-b border-white/[0.05] hover:bg-white/[0.02] transition-colors"
                        >
                          <TableCell className="py-4">
                            <a
                              href={fullShortUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="font-semibold text-violet-400 hover:text-violet-300 transition-colors"
                            >
                              /{item.shortCode}
                            </a>
                          </TableCell>
                          <TableCell className="py-4">
                            <span
                              className="truncate max-w-[220px] block text-zinc-400 text-sm"
                              title={item.originalUrl}
                            >
                              {item.originalUrl}
                            </span>
                          </TableCell>
                          <TableCell className="py-4 text-center">
                            <span className="inline-flex items-center rounded-md bg-white/[0.05] px-2.5 py-0.5 text-xs font-medium text-zinc-300">
                              {item.clicks}
                            </span>
                          </TableCell>
                          <TableCell className="py-4 text-right">
                            <Tooltip>
                              <TooltipTrigger>
                                <Button
                                  size="icon"
                                  variant="outline"
                                  className="h-8 w-8 bg-white/[0.04] border-white/10 text-zinc-400 hover:text-white rounded-lg"
                                  onClick={() => copyToClipboard(fullShortUrl, item.id)}
                                >
                                  {copiedCode === item.id ? (
                                    <Check size={14} className="text-emerald-400" />
                                  ) : (
                                    <Copy size={14} />
                                  )}
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>{copiedCode === item.id ? "Copied!" : "Copy"}</p>
                              </TooltipContent>
                            </Tooltip>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </TooltipProvider>
  );
}