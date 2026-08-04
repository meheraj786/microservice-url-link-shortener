"use client";

import { useState, useEffect } from "react";
import api from "@/app/lib/api";
import { Link2, Copy, Check, LogOut } from "lucide-react";
import { Button, Input, Table, TableHeader, TableColumn, TableBody, TableRow, TableCell } from "@heroui/react";

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
  const [loading, setLoading] = useState(false);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [shortUrlResult, setShortUrlResult] = useState<string | null>(null);

  const fetchUrls = async () => {
    try {
      const { data } = await api.get("/my-urls");
      setUrls(data);
    } catch (err) {
      console.error("Error fetching URLs:", err);
    }
  };

  useEffect(() => {
    fetchUrls();
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
      fetchUrls();
    } catch (err) {
      alert("Could not shorten URL.");
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text: string, code: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-8">
      {/* Top Header */}
      <div className="flex justify-between items-center mb-10">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-white flex items-center gap-2">
            <Link2 className="text-indigo-500 animate-pulse" /> LinkShrink
          </h1>
          <p className="text-sm text-slate-400 mt-1">Lightweight microservices shortener</p>
        </div>
        <Button
          onClick={onLogout}
          className="bg-red-600 hover:bg-red-500 text-white font-semibold"
        >
          <LogOut size={16} /> Logout
        </Button>
      </div>

      {/* Form Card Input */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 md:p-8 mb-8 shadow-xl">
        <form onSubmit={handleShorten} className="flex flex-col md:flex-row gap-3">
          <Input
            type="url"
            required
            placeholder="Paste your long link here..."
            value={originalUrl}
            onChange={(e) => setOriginalUrl(e.target.value)}
            className="flex-1"
          />
          <Button
            type="submit"
            isPending={loading}
            className="bg-indigo-600 hover:bg-indigo-500 text-white font-semibold px-6 py-2 rounded-xl"
          >
            {!loading && <Link2 size={18} />} Shorten Link
          </Button>
        </form>

        {shortUrlResult && (
          <div className="mt-6 bg-indigo-950/20 border border-indigo-900 p-4 rounded-xl flex justify-between items-center">
            <div>
              <p className="text-xs text-indigo-400 font-semibold uppercase tracking-wider">Shortened URL</p>
              <a
                href={shortUrlResult}
                target="_blank"
                rel="noreferrer"
                className="text-lg font-bold text-white hover:underline block mt-1"
              >
                {shortUrlResult}
              </a>
            </div>
            <Button
              className="bg-indigo-950 border border-indigo-800 text-indigo-300 hover:text-white"
              onClick={() => copyToClipboard(shortUrlResult, "result")}
            >
              {copiedCode === "result" ? <Check size={18} /> : <Copy size={18} />}
            </Button>
          </div>
        )}
      </div>

      {/* URLs Listing Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
        <h3 className="text-lg font-bold text-white mb-4">My URLs</h3>
        
        {urls.length === 0 ? (
          <p className="text-slate-500 text-center py-8">No links shortened yet.</p>
        ) : (
          <Table className="bg-slate-950/40">
            <TableHeader>
              <TableColumn>Short Link</TableColumn>
              <TableColumn>Original Link</TableColumn>
              <TableColumn>Clicks</TableColumn>
              <TableColumn className="text-right">Action</TableColumn>
            </TableHeader>
            <TableBody>
              {urls.map((item) => {
                const fullShortUrl = `https://api-gateway-ng5f.onrender.com/${item.shortCode}`;
                return (
                  <TableRow key={item.id} className="border-b border-slate-800">
                    <TableCell className="font-bold text-indigo-400">
                      <a href={fullShortUrl} target="_blank" rel="noreferrer" className="hover:underline">
                        /{item.shortCode}
                      </a>
                    </TableCell>
                    <TableCell>
                      <span className="truncate max-w-[200px] block" title={item.originalUrl}>
                        {item.originalUrl}
                      </span>
                    </TableCell>
                    <TableCell className="font-semibold text-center">{item.clicks}</TableCell>
                    <TableCell className="text-right">
                      <Button
                        onClick={() => copyToClipboard(fullShortUrl, item.id)}
                        className="bg-slate-950 border border-slate-800 rounded-lg text-slate-300 hover:text-white"
                      >
                        {copiedCode === item.id ? <Check size={14} className="text-success" /> : <Copy size={14} />}
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        )}
      </div>
    </div>
  );
}