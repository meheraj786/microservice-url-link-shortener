"use client";

import { useState, useEffect } from "react";
import api from "../app/lib/api";
import { Link2, Copy, Check, LogOut, Loader2 } from "lucide-react";
import {
  Button,
  Input,
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
} from "@heroui/react";

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
          <p className="text-sm text-slate-400 mt-1">
            Lightweight microservices shortener
          </p>
        </div>
        <Button
          color="danger"
          variant="flat"
          startContent={<LogOut size={16} />}
          onClick={onLogout}
        >
          Logout
        </Button>
      </div>

      {/* Form Card Input */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 md:p-8 mb-8 shadow-xl">
        <form
          onSubmit={handleShorten}
          className="flex flex-col md:flex-row gap-3"
        >
          <Input
            type="url"
            required
            placeholder="Paste your long link here..."
            value={originalUrl}
            onChange={(e) => setOriginalUrl(e.target.value)}
            className="flex-1"
            size="lg"
            variant="bordered"
          />
          <Button
            type="submit"
            color="primary"
            size="lg"
            isLoading={loading}
            startContent={!loading && <Link2 size={18} />}
          >
            Shorten Link
          </Button>
        </form>

        {shortUrlResult && (
          <div className="mt-6 bg-indigo-950/20 border border-indigo-900 p-4 rounded-xl flex justify-between items-center">
            <div>
              <p className="text-xs text-indigo-400 font-semibold uppercase tracking-wider">
                Shortened URL
              </p>
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
              isIconOnly
              color="primary"
              variant="flat"
              onClick={() => copyToClipboard(shortUrlResult, "result")}
            >
              {copiedCode === "result" ? (
                <Check size={18} />
              ) : (
                <Copy size={18} />
              )}
            </Button>
          </div>
        )}
      </div>

      {/* URLs Listing Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
        <h3 className="text-lg font-bold text-white mb-4">My URLs</h3>
        <Table
          aria-label="Shortened URLs Table"
          className="bg-slate-950/40"
          removeWrapper
        >
          <TableHeader>
            <TableColumn>Short Link</TableColumn>
            <TableColumn>Original Link</TableColumn>
            <TableColumn className="text-center">Clicks</TableColumn>
            <TableColumn className="text-right">Action</TableColumn>
          </TableHeader>
          <TableBody emptyContent={"No links shortened yet."}>
            {urls.map((item) => {
              const fullShortUrl = `https://api-gateway-ng5f.onrender.com/${item.shortCode}`;
              return (
                <TableRow key={item.id} className="border-b border-slate-800">
                  <TableCell className="font-bold text-indigo-400">
                    <a
                      href={fullShortUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="hover:underline"
                    >
                      /{item.shortCode}
                    </a>
                  </TableCell>
                  <TableCell
                    className="truncate max-w-[200px]"
                    title={item.originalUrl}
                  >
                    {item.originalUrl}
                  </TableCell>
                  <TableCell className="text-center font-semibold">
                    {item.clicks}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      isIconOnly
                      size="sm"
                      variant="light"
                      onClick={() => copyToClipboard(fullShortUrl, item.id)}
                    >
                      {copiedCode === item.id ? (
                        <Check size={14} className="text-success" />
                      ) : (
                        <Copy size={14} />
                      )}
                    </Button>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
