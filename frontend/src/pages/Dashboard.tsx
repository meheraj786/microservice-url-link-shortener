import { useState, useEffect } from "react";
import api from "../lib/api.js";
import { Link2, Copy, Check, LogOut, Loader2 } from "lucide-react";

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
      fetchUrls(); // Refresh list
    } catch (err) {
      alert("Could not shorten URL. Check gateway status.");
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
      {/* Header */}
      <div className="flex justify-between items-center mb-10">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-white flex items-center gap-2">
            <Link2 className="text-indigo-500" /> LinkShrink
          </h1>
          <p className="text-sm text-slate-400 mt-1">Lightweight microservices shortener</p>
        </div>
        <button
          type="button"
          onClick={onLogout}
          className="flex items-center gap-1 text-sm bg-slate-900 border border-slate-800 px-3 py-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 transition"
        >
          <LogOut size={16} /> Logout
        </button>
      </div>

      {/* Input Form */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 md:p-8 mb-8 shadow-xl">
        <form onSubmit={handleShorten} className="flex flex-col md:flex-row gap-3">
          <input
            type="url"
            required
            placeholder="Paste your long link here (e.g., https://example.com/very/long/path)"
            value={originalUrl}
            onChange={(e) => setOriginalUrl(e.target.value)}
            className="flex-1 rounded-xl border border-slate-800 bg-slate-950 px-4 py-3 text-white focus:border-indigo-500 focus:outline-none"
          />
          <button
            type="submit"
            disabled={loading}
            className="rounded-xl bg-indigo-600 px-6 py-3 font-semibold text-white hover:bg-indigo-500 transition disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {loading ? <Loader2 className="animate-spin" size={18} /> : "Shorten"}
          </button>
        </form>

        {shortUrlResult && (
          <div className="mt-6 bg-indigo-950/30 border border-indigo-900 p-4 rounded-xl flex justify-between items-center">
            <div>
              <p className="text-xs text-indigo-400 font-medium uppercase tracking-wider">Shortened Link</p>
              <a
                href={shortUrlResult}
                target="_blank"
                rel="noreferrer"
                className="text-lg font-bold text-white hover:underline block mt-1"
              >
                {shortUrlResult}
              </a>
            </div>
            <button
              type="button"
              onClick={() => copyToClipboard(shortUrlResult, "result")}
              className="bg-indigo-900/40 p-2.5 rounded-lg text-indigo-300 hover:text-white transition"
            >
              {copiedCode === "result" ? <Check size={18} /> : <Copy size={18} />}
            </button>
          </div>
        )}
      </div>

      {/* Analytics Listing Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
        <h3 className="text-lg font-bold text-white mb-4">My Shortened URLs</h3>
        
        {urls.length === 0 ? (
          <p className="text-slate-500 text-center py-8">No links shortened yet.</p>
        ) : (
          <div className="overflow-x-auto">
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
                    <tr key={item.id} className="hover:bg-slate-950/20">
                      <td className="py-4 pl-2 font-bold text-indigo-400">
                        <a href={fullShortUrl} target="_blank" rel="noreferrer" className="hover:underline">
                          /{item.shortCode}
                        </a>
                      </td>
                      <td className="py-4 truncate max-w-[200px] text-slate-400" title={item.originalUrl}>
                        {item.originalUrl}
                      </td>
                      <td className="py-4 text-center font-semibold text-slate-200">{item.clicks}</td>
                      <td className="py-4 text-right pr-2">
                        <button
                          type="button"
                          onClick={() => copyToClipboard(fullShortUrl, item.id)}
                          className="p-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-400 hover:text-white transition inline-flex"
                        >
                          {copiedCode === item.id ? <Check size={14} /> : <Copy size={14} />}
                        </button>
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