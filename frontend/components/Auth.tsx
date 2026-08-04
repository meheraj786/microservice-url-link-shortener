"use client";

import { useState } from "react";
import api from "@/app/lib/api";
import {
  Card,
  CardHeader,
  CardDescription,
  Input,
  Button,
} from "@heroui/react";

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
    <div className="flex min-h-[85vh] items-center justify-center p-4">
      <Card className="w-full max-w-md p-6 bg-slate-900 border border-slate-800 shadow-2xl">
        <CardHeader className="flex flex-col gap-1 text-center">
          <h2 className="text-2xl font-bold text-white">
            {isLogin ? "Welcome Back" : "Create Account"}
          </h2>
          <p className="text-sm text-slate-400">
            {isLogin
              ? "Sign in to manage your URLs"
              : "Get started with custom shortener"}
          </p>
        </CardHeader>
        <CardDescription>
          {error && (
            <div className="mb-4 rounded-lg bg-red-950/40 border border-red-900 p-3 text-sm text-red-400">
              {error}
            </div>
          )}
          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <Input
                placeholder="John Doe"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            )}
            <Input
              type="email"
              placeholder="you@example.com"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <Input
              type="password"
              placeholder="••••••••"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <Button
              type="submit"
              isPending={loading}
              className="w-full bg-indigo-600 hover:bg-indigo-500 font-semibold text-white"
            >
              {isLogin ? "Sign In" : "Sign Up"}
            </Button>
          </form>
          <div className="mt-6 text-center text-sm text-slate-400">
            {isLogin ? "New to our service? " : "Already have an account? "}
            <button
              type="button"
              onClick={() => {
                setIsLogin(!isLogin);
                setError("");
              }}
              className="font-semibold text-indigo-400 hover:text-indigo-300"
            >
              {isLogin ? "Create account" : "Sign in"}
            </button>
          </div>
        </CardDescription>
      </Card>
    </div>
  );
}
