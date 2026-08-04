"use client";

import { useState, useEffect } from "react";
import api from "@/app/lib/api"; 
import { Link2, Copy, Check, LogOut } from "lucide-react";
import { Button, Input } from "@heroui/react"; // Only keeping safe Inputs & Buttons

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

  useEffect(() => {
    let isMounted = true;

    const fetchUrls = async () => {
      try {
        const { data } = await api.get("/my-urls");
        if (isMounted) {
          setUrls(data);
        }
      } catch (err) {
        console.error("Error fetching URLs:", err);
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

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-8">
      {/* Top Header */}
      <div className="flex justify-between items-center mb-10">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-white flex items-center gap-2">
            <Link2 className="text-indigo-500 animate-pulse" /> Lily-Link
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
            Shorten Link
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

      {/* URLs Listing Table (REFACTORED TO SEMANTIC HTML) */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
        <h3 className="text-lg font-bold text-white mb-4">My URLs</h3>
        
        {urls.length === 0 ? (
          <p className="text-slate-500 text-center py-8">No links shortened yet.</p>
        ) : (
          <div className="overflow-x-auto bg-slate-950/40 rounded-xl border border-slate-850 p-4">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 text-xs uppercase tracking-wider font-semibold">
                  <th className="pb-3 pl-2">Short Link</th>
                  <th className="pb-3">Original Link</th>
                  <th className="pb-3 text-center">Clicks</th>
                  <th className="pb-3 text-right pr-2">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 text-sm">
                {urls.map((item) => {
                  const fullShortUrl = `https://api-gateway-ng5f.onrender.com/${item.shortCode}`;
                  return (
                    <tr key={item.id} className="hover:bg-slate-900/30 transition-colors">
                      <td className="py-4 pl-2 font-bold text-indigo-400">
                        <a href={fullShortUrl} target="_blank" rel="noreferrer" className="hover:underline">
                          /{item.shortCode}
                        </a>
                      </td>
                      <td className="py-4">
                        <span className="truncate max-w-[200px] block text-slate-400" title={item.originalUrl}>
                          {item.originalUrl}
                        </span>
                      </td>
                      <td className="py-4 text-center font-semibold text-slate-200">{item.clicks}</td>
                      <td className="py-4 text-right pr-2">
                        <Button
                          onClick={() => copyToClipboard(fullShortUrl, item.id)}
                          className="bg-slate-950 border border-slate-800 rounded-lg text-slate-300 hover:text-white"
                        >
                          {copiedCode === item.id ? <Check size={14} className="text-success" /> : <Copy size={14} />}
                        </Button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}