"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import gsap from "gsap";
import { Eye, EyeOff, Monitor, Plug } from "lucide-react";
import { authApi } from "@/lib/api/auth.api";
import { useAuthStore } from "@/features/auth/store/authStore";
import { GradientBarsBackground } from "@/components/ui/gradient-bars-background";

type GoogleCredentialResponse = {
  credential?: string;
};

declare global {
  interface Window {
    google?: {
      accounts?: {
        id?: {
          initialize: (config: {
            client_id: string;
            callback: (response: GoogleCredentialResponse) => void;
            ux_mode?: "popup" | "redirect";
            context?: "signin" | "signup" | "use";
          }) => void;
          prompt: () => void;
        };
      };
    };
  }
}

interface FormData {
  usernameOrEmail: string;
  password: string;
  confirmPassword: string;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
}

const emptyForm: FormData = {
  usernameOrEmail: "",
  password: "",
  confirmPassword: "",
  username: "",
  email: "",
  firstName: "",
  lastName: "",
};

export default function LoginPage() {
  const router = useRouter();
  const store = useAuthStore();
  const mainRef = useRef<HTMLElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);

  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [googleReady, setGoogleReady] = useState(false);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState<FormData>(emptyForm);
  const googleClientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;

  // Redirect if already authenticated
  useEffect(() => {
    const timer = setTimeout(() => {
      const token = localStorage.getItem("accessToken");
      if (token) {
        router.push("/dashboard");
      }
    }, 100);
    return () => clearTimeout(timer);
  }, [router]);

  // Entry animation
  useEffect(() => {
    if (mainRef.current) {
      gsap.fromTo(
        mainRef.current,
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.6, ease: "power2.out" }
      );
    }
    if (cardRef.current) {
      gsap.fromTo(
        cardRef.current,
        { opacity: 0, scale: 0.95 },
        { opacity: 1, scale: 1, duration: 0.7, ease: "back.out(1.7)", delay: 0.2 }
      );
    }
  }, []);

  useEffect(() => {
    const existingScript = document.getElementById("google-gsi-client") as HTMLScriptElement | null;
    if (existingScript) {
      if (window.google?.accounts?.id) {
        setGoogleReady(true);
      } else {
        existingScript.addEventListener("load", () => setGoogleReady(true), { once: true });
      }
      return;
    }

    const script = document.createElement("script");
    script.id = "google-gsi-client";
    script.src = "https://accounts.google.com/gsi/client";
    script.async = true;
    script.defer = true;
    script.onload = () => setGoogleReady(true);
    document.head.appendChild(script);
  }, []);

  // Card fade animation on mode toggle
  useEffect(() => {
    if (!cardRef.current) return;
    gsap.to(cardRef.current, {
      opacity: 0,
      duration: 0.2,
      ease: "power2.in",
      onComplete: () => {
        gsap.fromTo(
          cardRef.current,
          { opacity: 0, y: 10 },
          { opacity: 1, y: 0, duration: 0.35, ease: "power2.out" }
        );
      },
    });
  }, [isLogin]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setError("");
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await authApi.login({
        usernameOrEmail: formData.usernameOrEmail,
        password: formData.password,
      });

      const { user, accessToken } = response.data.data;
      localStorage.setItem("accessToken", accessToken);
      localStorage.setItem("user", JSON.stringify(user));
      store.setAuth(user, accessToken);
      router.push("/dashboard");
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { message?: string } } };
      setError(axiosErr.response?.data?.message || "Login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleAuth = async () => {
    if (!googleClientId) {
      setError("Google sign-in is not configured. Missing NEXT_PUBLIC_GOOGLE_CLIENT_ID.");
      return;
    }

    if (!googleReady || !window.google?.accounts?.id) {
      setError("Google sign-in is still loading. Please try again.");
      return;
    }

    setGoogleLoading(true);
    setError("");

    try {
      window.google.accounts.id.initialize({
        client_id: googleClientId,
        context: isLogin ? "signin" : "signup",
        callback: async (response: GoogleCredentialResponse) => {
          try {
            if (!response.credential) {
              setError("Google did not return a valid identity token.");
              return;
            }

            const apiResponse = await authApi.google(response.credential);
            const { user, accessToken } = apiResponse.data.data;
            localStorage.setItem("accessToken", accessToken);
            localStorage.setItem("user", JSON.stringify(user));
            store.setAuth(user, accessToken);
            router.push("/dashboard");
          } catch (err: unknown) {
            const axiosErr = err as { response?: { data?: { message?: string } } };
            setError(axiosErr.response?.data?.message || "Google authentication failed. Please try again.");
          } finally {
            setGoogleLoading(false);
          }
        },
      });
      window.google.accounts.id.prompt();
    } catch {
      setError("Unable to open Google sign-in prompt.");
      setGoogleLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      setLoading(false);
      return;
    }

    try {
      const response = await authApi.register({
        email: formData.email,
        password: formData.password,
        confirmPassword: formData.confirmPassword,
        username: formData.username,
        firstName: formData.firstName,
        lastName: formData.lastName,
      });

      const { user, accessToken } = response.data.data;
      localStorage.setItem("accessToken", accessToken);
      localStorage.setItem("user", JSON.stringify(user));
      store.setAuth(user, accessToken);
      router.push("/dashboard");
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { message?: string } } };
      setError(axiosErr.response?.data?.message || "Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const switchMode = () => {
    setIsLogin((prev) => !prev);
    setError("");
    setFormData(emptyForm);
  };

  const inputClass =
    "w-full px-4 py-3 rounded-lg bg-white/5 border border-white/10 text-white placeholder:text-white/30 focus:outline-none focus:border-[#7E3AF0] focus:ring-1 focus:ring-[#7E3AF0]";

  const GoogleSVG = () => (
    <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24" fill="currentColor">
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
    </svg>
  );

  return (
    <main ref={mainRef} className="min-h-screen flex bg-[#080410]">
      {/* Left — form panel */}
      <div className="w-full md:w-1/2 flex flex-col items-center justify-center px-8 py-12 bg-[#080410]">
        <div className="w-full max-w-md">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 mb-8">
            <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-[#7E3AF0] to-[#9F67FF] flex items-center justify-center text-white text-sm font-bold shadow-lg shadow-[#7E3AF0]/30">
              A
            </div>
            <span className="text-2xl font-bold text-white tracking-tight">AdMiro</span>
          </Link>

          {/* Card */}
          <div
            ref={cardRef}
            className="w-full bg-[#0C0C0C] rounded-2xl border border-white/8 p-8"
          >
            <h1 className="text-2xl font-bold text-white mb-1">
              {isLogin ? "Welcome back" : "Create account"}
            </h1>
            <p className="text-white/50 text-sm mb-8">
              {isLogin ? "Log in to your AdMiro account" : "Join AdMiro to manage your displays"}
            </p>

            {error && (
              <div className="mb-6 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
                {error}
              </div>
            )}

            {isLogin ? (
              <form onSubmit={handleLogin} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-white/70 mb-2">
                    Username or Email
                  </label>
                  <input
                    type="text"
                    name="usernameOrEmail"
                    value={formData.usernameOrEmail}
                    onChange={handleInputChange}
                    placeholder="Enter your username or email"
                    className={inputClass}
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-white/70 mb-2">
                    Password
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      name="password"
                      value={formData.password}
                      onChange={handleInputChange}
                      placeholder="Enter your password"
                      className={inputClass}
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((p) => !p)}
                      className="absolute right-4 top-3.5 text-white/40 hover:text-white/80"
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full px-4 py-3 bg-[#7E3AF0] hover:bg-[#9F67FF] text-white font-semibold rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? "Logging in..." : "Log in"}
                </button>

                <div className="flex items-center gap-4 my-2">
                  <div className="flex-1 h-px bg-white/10" />
                  <span className="text-xs text-white/30">OR</span>
                  <div className="flex-1 h-px bg-white/10" />
                </div>

                <button
                  type="button"
                  onClick={handleGoogleAuth}
                  disabled={googleLoading}
                  className="w-full flex items-center justify-center gap-3 px-4 py-3 border border-white/10 bg-white/5 text-white/70 font-medium rounded-lg hover:bg-white/10 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <GoogleSVG />
                  {googleLoading ? "Opening Google..." : "Continue with Google"}
                </button>
              </form>
            ) : (
              <form onSubmit={handleRegister} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-white/70 mb-2">First Name</label>
                    <input
                      type="text"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleInputChange}
                      placeholder="First name"
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-white/70 mb-2">Last Name</label>
                    <input
                      type="text"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleInputChange}
                      placeholder="Last name"
                      className={inputClass}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-white/70 mb-2">Username</label>
                  <input
                    type="text"
                    name="username"
                    value={formData.username}
                    onChange={handleInputChange}
                    placeholder="Choose a username"
                    className={inputClass}
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-white/70 mb-2">Email</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="Enter your email"
                    className={inputClass}
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-white/70 mb-2">Password</label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      name="password"
                      value={formData.password}
                      onChange={handleInputChange}
                      placeholder="Create a password"
                      className={inputClass}
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((p) => !p)}
                      className="absolute right-4 top-3.5 text-white/40 hover:text-white/80"
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-white/70 mb-2">Confirm Password</label>
                  <input
                    type={showPassword ? "text" : "password"}
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    placeholder="Confirm your password"
                    className={inputClass}
                    required
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full px-4 py-3 bg-[#7E3AF0] hover:bg-[#9F67FF] text-white font-semibold rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? "Creating account..." : "Create account"}
                </button>

                <div className="flex items-center gap-4 my-2">
                  <div className="flex-1 h-px bg-white/10" />
                  <span className="text-xs text-white/30">OR</span>
                  <div className="flex-1 h-px bg-white/10" />
                </div>

                <button
                  type="button"
                  onClick={handleGoogleAuth}
                  disabled={googleLoading}
                  className="w-full flex items-center justify-center gap-3 px-4 py-3 border border-white/10 bg-white/5 text-white/70 font-medium rounded-lg hover:bg-white/10 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <GoogleSVG />
                  {googleLoading ? "Opening Google..." : "Sign up with Google"}
                </button>
              </form>
            )}

            {/* Toggle login / register */}
            <div className="mt-6 border-t border-white/8 pt-6 space-y-4">
              <p className="text-center text-white/50 text-sm">
                {isLogin ? "Don't have an account? " : "Already have an account? "}
                <button
                  onClick={switchMode}
                  className="text-[#9F67FF] hover:text-white font-semibold"
                >
                  {isLogin ? "Sign up" : "Log in"}
                </button>
              </p>

              {/* Display device links */}
              <div className="pt-2">
                <div className="flex items-center gap-3 mb-4">
                  <div className="flex-1 h-px bg-white/8" />
                  <span className="text-xs text-white/30">display device</span>
                  <div className="flex-1 h-px bg-white/8" />
                </div>
                <div className="space-y-2">
                  <Link
                    href="/display-register"
                    className="w-full px-4 py-2.5 border border-[#7E3AF0]/40 text-[#9F67FF] font-medium rounded-lg hover:bg-[#7E3AF0]/10 text-center flex items-center justify-center gap-2 text-sm"
                  >
                    <Monitor size={16} />
                    Register Display
                  </Link>
                  <Link
                    href="/display-login"
                    className="w-full px-4 py-2.5 border border-white/10 text-white/50 font-medium rounded-lg hover:bg-white/5 hover:text-white/70 text-center flex items-center justify-center gap-2 text-sm"
                  >
                    <Plug size={16} />
                    Login to Display
                  </Link>
                </div>
                <p className="text-xs text-white/30 mt-3 text-center">
                  Turn this device into an ad display
                </p>
              </div>
            </div>

            <div className="mt-6 text-center">
              <Link href="/" className="text-white/30 hover:text-white/60 text-sm">
                Back to home
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Right — gradient bars panel */}
      <div className="hidden md:flex w-1/2 h-screen sticky top-0">
        <GradientBarsBackground className="w-full h-full" />
      </div>
    </main>
  );
}
