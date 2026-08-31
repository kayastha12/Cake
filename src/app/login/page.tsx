"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/context/ToastContext";
import Link from "next/link";
import { User, Lock, Mail, ArrowRight, Eye, EyeOff } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const { user, login, register, loading } = useAuth();
  const { toast } = useToast();

  const [isLoginTab, setIsLoginTab] = useState(true);

  // Form Fields
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Redirect if already logged in
  useEffect(() => {
    if (!loading && user) {
      if (user.role === "ADMIN") {
        router.push("/admin");
      } else {
        router.push("/shop");
      }
    }
  }, [user, loading]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password || (!isLoginTab && !name)) {
      toast("Please fill in all required credentials.", "error");
      return;
    }

    setIsSubmitting(true);
    if (isLoginTab) {
      const res = await login(email, password);
      if (res.success) {
        toast("Welcome back to Sweet Delights!", "success");
        // router redirect handled in useEffect
      } else {
        toast(res.error || "Invalid credentials.", "error");
      }
    } else {
      const res = await register(name, email, password);
      if (res.success) {
        toast("Account created! Welcome to Sweet Delights.", "success");
        // router redirect handled in useEffect
      } else {
        toast(res.error || "Registration failed. Try again.", "error");
      }
    }
    setIsSubmitting(false);
  };

  const fillDemoAdmin = () => {
    setEmail("admin@sweetdelights.com");
    setPassword("admin123");
    setIsLoginTab(true);
    toast("Filled admin demo credentials!", "info");
  };

  const fillDemoCustomer = () => {
    setEmail("john@example.com");
    setPassword("customer123");
    setIsLoginTab(true);
    toast("Filled customer demo credentials!", "info");
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto px-4 py-20 flex flex-col gap-8 min-h-[70vh]">
      {/* Container Box */}
      <div className="bg-card border border-border/40 rounded-3xl p-8 shadow-sm flex flex-col gap-6">
        
        {/* Header Tabs */}
        <div className="grid grid-cols-2 border-b border-border/20 pb-4">
          <button
            onClick={() => setIsLoginTab(true)}
            className={`font-serif text-lg font-bold pb-2 border-b-2 transition-all ${
              isLoginTab
                ? "border-secondary text-primary dark:text-primary-foreground font-semibold"
                : "border-transparent text-foreground/40 hover:text-foreground/70"
            }`}
          >
            Login
          </button>
          <button
            onClick={() => setIsLoginTab(false)}
            className={`font-serif text-lg font-bold pb-2 border-b-2 transition-all ${
              !isLoginTab
                ? "border-secondary text-primary dark:text-primary-foreground font-semibold"
                : "border-transparent text-foreground/40 hover:text-foreground/70"
            }`}
          >
            Sign Up
          </button>
        </div>

        {/* Brand Text */}
        <div className="text-center flex flex-col gap-1 mt-1">
          <span className="text-[10px] tracking-[0.2em] font-semibold text-secondary uppercase">
            Sweet Delights Boutique
          </span>
          <h2 className="font-serif text-xl font-bold">
            {isLoginTab ? "Welcome Back" : "Create Account"}
          </h2>
        </div>

        {/* Credentials Form */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          
          {/* Name Field (Sign Up Only) */}
          {!isLoginTab && (
            <div className="relative">
              <label className="text-[10px] font-bold uppercase tracking-wider text-foreground/50">Full Name</label>
              <div className="relative mt-1">
                <input
                  type="text"
                  required
                  placeholder="Rachel Green"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-background border border-border/40 rounded-xl text-xs text-foreground focus:outline-none focus:border-secondary"
                />
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground/45" />
              </div>
            </div>
          )}

          {/* Email Field */}
          <div>
            <label className="text-[10px] font-bold uppercase tracking-wider text-foreground/50">Email Address</label>
            <div className="relative mt-1">
              <input
                type="email"
                required
                placeholder="rachel@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-background border border-border/40 rounded-xl text-xs text-foreground focus:outline-none focus:border-secondary"
              />
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground/45" />
            </div>
          </div>

          {/* Password Field */}
          <div>
            <label className="text-[10px] font-bold uppercase tracking-wider text-foreground/50">Password</label>
            <div className="relative mt-1">
              <input
                type={showPassword ? "text" : "password"}
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-10 py-2.5 bg-background border border-border/40 rounded-xl text-xs text-foreground focus:outline-none focus:border-secondary"
              />
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground/45" />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-foreground/45 hover:text-foreground transition-colors p-0.5"
              >
                {showPassword ? <EyeOff className="w-4.5 h-4.5" /> : <Eye className="w-4.5 h-4.5" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="mt-2 w-full py-3.5 px-6 bg-primary hover:bg-primary/95 text-primary-foreground font-bold text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-1.5 disabled:opacity-50"
          >
            {isSubmitting ? (
              "Please wait..."
            ) : (
              <>
                {isLoginTab ? "Sign In" : "Sign Up"}
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Demo Fast Logins helper block */}
        <div className="border-t border-border/20 pt-5 mt-2 flex flex-col gap-2.5">
          <p className="text-[10px] text-foreground/45 font-bold uppercase tracking-wider text-center">
            Demo Logins (Auto-Seeded)
          </p>
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={fillDemoAdmin}
              className="py-2 px-3 border border-border/50 rounded-xl text-[10px] font-bold hover:bg-primary/5 transition-all text-foreground/75"
            >
              Demo Admin (Manage orders)
            </button>
            <button
              onClick={fillDemoCustomer}
              className="py-2 px-3 border border-border/50 rounded-xl text-[10px] font-bold hover:bg-primary/5 transition-all text-foreground/75"
            >
              Demo Customer (Shop, reviews)
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
