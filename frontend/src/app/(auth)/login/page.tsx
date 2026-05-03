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
          }) => void;
          renderButton: (
            parent: HTMLElement,
            options: Record<string, unknown>
          ) => void;
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
  const googleBtnRef = useRef<HTMLDivElement>(null);

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
    script.onerror = () => {
      setGoogleReady(false);
      setError("Failed to load Google Sign-In script. Disable blockers and refresh the page.");
    };
    document.head.appendChild(script);
  }, []);

  // Render Google button whenever GSI is ready or mode switches
  useEffect(() => {
    if (!googleReady || !googleClientId || !googleBtnRef.current) return;
    if (!window.google?.accounts?.id) return;

    const handleCredential = async (response: GoogleCredentialResponse) => {
      if (!response.credential) {
        setError("Google did not return a valid identity token.");
        return;
      }
      setGoogleLoading(true);
      setError("");
      try {
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
    };

    window.google.accounts.id.initialize({
      client_id: googleClientId,
      callback: handleCredential,
    });

    // Clear previous render then re-render button
    googleBtnRef.current.innerHTML = "";
    window.google.accounts.id.renderButton(googleBtnRef.current, {
      theme: "filled_black",
      size: "large",
      shape: "pill",
      text: isLogin ? "signin_with" : "signup_with",
      width: googleBtnRef.current.offsetWidth || 384,
    } as Parameters<typeof window.google.accounts.id.renderButton>[1]);
  }, [googleReady, isLogin, googleClientId, router, store]);

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
    "w-full px-4 py-3 rounded-xl bg-white/[0.06] border border-white/10 text-white placeholder:text-white/25 focus:outline-none focus:border-[#7E3AF0] focus:ring-1 focus:ring-[#7E3AF0]/50 text-sm";

  return (
    <GradientBarsBackground className="min-h-screen" numBars={20} animationDuration={2.5} overlayColor="rgba(8,4,16,0.65)">
    <main ref={mainRef} className="min-h-screen flex">
      {/* Left — form panel */}
      <div className="w-full md:w-1/2 flex flex-col items-center justify-center overflow-y-auto px-8 py-10 bg-[#0a0a0a]">
        {/* Inner form wrapper — cardRef attaches here for GSAP */}
        <div ref={cardRef} className="w-full max-w-sm">

          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 mb-6">
            <img src="/logo.svg" alt="AdMiro" className="h-8 w-auto brightness-0 invert" />
          </Link>

          {/* Heading */}
          <h1 className="text-3xl font-bold text-white tracking-tight">
            {isLogin ? "Welcome back" : "Create account"}
          </h1>
          <p className="text-white/40 text-sm mt-1 mb-6">
            {isLogin ? "Log in to your AdMiro account" : "Join AdMiro to manage your displays"}
          </p>

          {/* Error */}
          {error && (
            <div className="mb-6 bg-red-500/[0.08] border border-red-500/15 text-red-400 text-sm rounded-xl px-4 py-3">
              {error}
            </div>
          )}

          {isLogin ? (
            <form onSubmit={handleLogin} className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-white/50 mb-1.5 uppercase tracking-wider">
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
                <label className="block text-xs font-medium text-white/50 mb-1.5 uppercase tracking-wider">
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
                    className="absolute right-4 top-3.5 text-white/40 hover:text-white/80 transition-colors duration-150"
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 rounded-xl bg-[#7E3AF0] hover:bg-[#9F67FF] text-white font-semibold text-sm disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-150"
              >
                {loading ? "Logging in..." : "Log in"}
              </button>

              {/* Divider */}
              <div className="flex items-center gap-4 py-1">
                <div className="flex-1 h-px bg-white/[0.08]" />
                <span className="text-white/25 text-xs">or</span>
                <div className="flex-1 h-px bg-white/[0.08]" />
              </div>

              <div ref={googleBtnRef} className="w-full flex justify-center" style={{ minHeight: 44 }} />
            </form>
          ) : (
            <form onSubmit={handleRegister} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-white/50 mb-1.5 uppercase tracking-wider">
                    First Name
                  </label>
                  <input
                    type="text"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleInputChange}
                    placeholder="First"
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-white/50 mb-1.5 uppercase tracking-wider">
                    Last Name
                  </label>
                  <input
                    type="text"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleInputChange}
                    placeholder="Last"
                    className={inputClass}
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-white/50 mb-1.5 uppercase tracking-wider">
                  Username
                </label>
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
                <label className="block text-xs font-medium text-white/50 mb-1.5 uppercase tracking-wider">
                  Email
                </label>
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
                <label className="block text-xs font-medium text-white/50 mb-1.5 uppercase tracking-wider">
                  Password
                </label>
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
                    className="absolute right-4 top-3.5 text-white/40 hover:text-white/80 transition-colors duration-150"
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-white/50 mb-1.5 uppercase tracking-wider">
                  Confirm Password
                </label>
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
                className="w-full py-3 rounded-xl bg-[#7E3AF0] hover:bg-[#9F67FF] text-white font-semibold text-sm disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-150"
              >
                {loading ? "Creating account..." : "Create account"}
              </button>

              {/* Divider */}
              <div className="flex items-center gap-4 py-1">
                <div className="flex-1 h-px bg-white/[0.08]" />
                <span className="text-white/25 text-xs">or</span>
                <div className="flex-1 h-px bg-white/[0.08]" />
              </div>

              <div ref={googleBtnRef} className="w-full flex justify-center" style={{ minHeight: 44 }} />
            </form>
          )}

          {/* Switch mode */}
          <p className="mt-6 text-center text-white/40 text-sm">
            {isLogin ? "Don't have an account? " : "Already have an account? "}
            <button
              onClick={switchMode}
              className="text-[#9F67FF] hover:text-white font-medium transition-colors duration-150"
            >
              {isLogin ? "Sign up" : "Log in"}
            </button>
          </p>

          {/* Display device section */}
          <div className="mt-8">
            <div className="flex items-center gap-3 mb-3">
              <div className="flex-1 h-px bg-white/[0.08]" />
              <span className="text-white/20 text-xs">display device</span>
              <div className="flex-1 h-px bg-white/[0.08]" />
            </div>
            <div className="space-y-2">
              <Link
                href="/display-register"
                className="w-full px-4 py-2.5 border border-white/[0.08] text-white/40 hover:text-white/70 hover:border-white/20 font-medium rounded-xl text-center flex items-center justify-center gap-2 text-xs transition-colors duration-150"
              >
                <Monitor size={14} />
                Register Display
              </Link>
              <Link
                href="/display-login"
                className="w-full px-4 py-2.5 border border-white/[0.08] text-white/40 hover:text-white/70 hover:border-white/20 font-medium rounded-xl text-center flex items-center justify-center gap-2 text-xs transition-colors duration-150"
              >
                <Plug size={14} />
                Login to Display
              </Link>
            </div>
          </div>

        </div>
      </div>

      {/* Right — bars visible through background */}
      <div className="hidden md:block md:w-1/2" />
    </main>
    </GradientBarsBackground>
  );
}
