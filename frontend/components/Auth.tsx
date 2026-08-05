"use client";

import { useState } from "react";
import api from "@/app/lib/api";
import { Link2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";

interface AuthProps {
  onAuthSuccess: () => void;
}

export default function Auth({ onAuthSuccess }: AuthProps) {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const endpoint = isLogin ? "/auth/login" : "/auth/register";
    const payload = isLogin ? { email, password } : { email, password, name };

    try {
      const { data } = await api.post(endpoint, payload);

      if (isLogin) {
        localStorage.setItem("token", data.token);
        localStorage.setItem("user", JSON.stringify(data.user));
        onAuthSuccess();
      } else {
        setIsLogin(true);
        setError("Registration complete. Please login now.");
      }
    } catch {
      setError("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center p-4 bg-[#0B0C10] overflow-hidden">
      {/* Ambient glow backdrop */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -top-40 left-1/2 -translate-x-1/2 h-[420px] w-[420px] rounded-full bg-violet-600/20 blur-[120px]" />
        <div className="absolute bottom-10 right-10 h-[380px] w-[380px] rounded-full bg-indigo-500/10 blur-[120px]" />
      </div>

      <Card className="relative w-full max-w-md bg-white/[0.03] border-white/[0.08] shadow-2xl backdrop-blur-xl rounded-2xl text-white">
        <CardHeader className="text-center pb-2 pt-8">
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-500 to-indigo-600 shadow-lg shadow-violet-900/40">
            <Link2 className="text-white" size={22} />
          </div>
          <CardTitle className="text-2xl font-bold tracking-tight text-white">
            {isLogin ? "Welcome Back" : "Create Account"}
          </CardTitle>
          <CardDescription className="text-zinc-400 text-sm mt-1">
            {isLogin
              ? "Sign in to manage your URLs"
              : "Get started with custom link shortening"}
          </CardDescription>
        </CardHeader>

        <CardContent className="pt-4">
          {error && (
            <div
              className={`mb-5 rounded-xl p-3 text-xs font-medium border text-center ${
                error.includes("complete")
                  ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
                  : "bg-rose-500/10 border-rose-500/20 text-rose-400"
              }`}
            >
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <div className="space-y-1.5">
                <Label htmlFor="name" className="text-xs text-zinc-300 font-medium">
                  Full Name
                </Label>
                <Input
                  id="name"
                  type="text"
                  placeholder="John Doe"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="bg-white/[0.02] border-white/10 text-white placeholder:text-zinc-600 focus-visible:ring-violet-500 rounded-xl h-11"
                />
              </div>
            )}

            <div className="space-y-1.5">
              <Label htmlFor="email" className="text-xs text-zinc-300 font-medium">
                Email Address
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="bg-white/[0.02] border-white/10 text-white placeholder:text-zinc-600 focus-visible:ring-violet-500 rounded-xl h-11"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="password" className="text-xs text-zinc-300 font-medium">
                Password
              </Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="bg-white/[0.02] border-white/10 text-white placeholder:text-zinc-600 focus-visible:ring-violet-500 rounded-xl h-11"
              />
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-medium h-11 rounded-xl shadow-lg shadow-violet-950/40 transition-all mt-2"
            >
              {loading
                ? isLogin
                  ? "Signing in..."
                  : "Creating account..."
                : isLogin
                ? "Sign In"
                : "Sign Up"}
            </Button>
          </form>
        </CardContent>

        <CardFooter className="justify-center pb-8 pt-2">
          <p className="text-sm text-zinc-400">
            {isLogin ? "New to our service? " : "Already have an account? "}
            <button
              type="button"
              onClick={() => {
                setIsLogin(!isLogin);
                setError("");
              }}
              className="font-medium text-violet-400 hover:text-violet-300 transition-colors"
            >
              {isLogin ? "Create account" : "Sign in"}
            </button>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}