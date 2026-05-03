"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import NextImage from "next/image";
import {
  Loader2,
  MoreVertical,
  LogOut,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { displaysApi } from "@/lib/api/displays.api";

interface AdItem {
  id: string;
  adId: string;
  adName: string;
  mediaUrl: string;
  mediaType: string;
  duration: number;
}

interface LoopData {
  _id: string;
  displayLayout: "fullscreen" | "masonry";
  rotationType: "sequential" | "random";
}

type LoginMethod = "password" | "token";

interface PasswordLoginData {
  displayId: string;
  password: string;
}

interface TokenLoginData {
  connectionToken: string;
}

export default function DisplayPage() {
  const router = useRouter();
  const containerRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const currentDurationRef = useRef(0);
  const currentAdIdRef = useRef<string | null>(null);
  const hideButtonsTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [displayId, setDisplayId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [currentAdIndex, setCurrentAdIndex] = useState(0);
  const [ads, setAds] = useState<AdItem[]>([]);
  const [currentAd, setCurrentAd] = useState<AdItem | null>(null);
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [loopData, setLoopData] = useState<LoopData | null>(null);
  const [loginMode, setLoginMode] = useState(false);
  const [loginMethod, setLoginMethod] = useState<LoginMethod>("password");
  const [passwordLoginData, setPasswordLoginData] = useState<PasswordLoginData>({
    displayId: "",
    password: "",
  });
  const [tokenLoginData, setTokenLoginData] = useState<TokenLoginData>({ connectionToken: "" });
  const [loginError, setLoginError] = useState("");
  const [loginLoading, setLoginLoading] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showNavigationButtons, setShowNavigationButtons] = useState(false);

  // Keep currentAdId ref in sync
  useEffect(() => {
    currentAdIdRef.current = currentAd?.adId ?? null;
  }, [currentAd]);

  // Report status
  const reportDisplayStatus = useCallback(
    async (connectionToken: string, status: string) => {
      try {
        await displaysApi.reportStatus({
          connectionToken,
          status,
          currentAdPlaying: currentAdIdRef.current ?? "none",
        });
      } catch {
        // silently fail
      }
    },
    []
  );

  // Fetch ads for this display via connection token
  const fetchAdsForDisplay = useCallback(async () => {
    try {
      const connectionToken = localStorage.getItem("connectionToken");
      if (!connectionToken) {
        setError("No connection token found");
        return;
      }

      const response = await displaysApi.getLoopByToken(connectionToken);
      const loop = response.data.data.loop as LoopData;
      const advertisements = response.data.data.advertisements as AdItem[];

      if (advertisements.length === 0) {
        setError("No advertisements assigned to this display");
        setAds([]);
        setCurrentAd(null);
        setLoopData(null);
        return;
      }

      setLoopData(loop);
      setAds(advertisements);

      if (loop.displayLayout === "fullscreen" && advertisements[0]) {
        setCurrentAdIndex(0);
        setCurrentAd(advertisements[0]);
        setTimeRemaining(advertisements[0].duration);
      }

      setError("");
    } catch {
      setError("Failed to load advertisements for this display");
    }
  }, []);

  // Initialize on mount
  useEffect(() => {
    const storedDisplayId = localStorage.getItem("displayId");
    const connectionToken = localStorage.getItem("connectionToken");

    if (!storedDisplayId || !connectionToken) {
      setLoginMode(true);
      setLoading(false);
      return;
    }

    setDisplayId(storedDisplayId);
    setLoading(false);
    fetchAdsForDisplay();
    reportDisplayStatus(connectionToken, "online");

    const heartbeat = setInterval(() => {
      reportDisplayStatus(connectionToken, "online");
    }, 30000);

    return () => clearInterval(heartbeat);
  }, [fetchAdsForDisplay, reportDisplayStatus]);

  // Fullscreen request
  useEffect(() => {
    if (!displayId || loopData?.displayLayout !== "fullscreen") return;
    if (containerRef.current && !document.fullscreenElement) {
      containerRef.current.requestFullscreen().catch(() => {/* ignore */});
    }
  }, [displayId, loopData]);

  // ESC key handler
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        if (document.fullscreenElement) document.exitFullscreen();
        localStorage.removeItem("displayId");
        router.push("/login");
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [router]);

  // Mouse move to show/hide navigation buttons
  useEffect(() => {
    const handleMouseMove = () => {
      setShowNavigationButtons(true);
      if (hideButtonsTimerRef.current) clearTimeout(hideButtonsTimerRef.current);
      hideButtonsTimerRef.current = setTimeout(() => {
        setShowNavigationButtons(false);
      }, 3000);
    };

    const handleMouseLeave = () => {
      setShowNavigationButtons(false);
      if (hideButtonsTimerRef.current) clearTimeout(hideButtonsTimerRef.current);
    };

    const container = containerRef.current;
    if (container) {
      container.addEventListener("mousemove", handleMouseMove);
      container.addEventListener("mouseleave", handleMouseLeave);
    }

    return () => {
      if (container) {
        container.removeEventListener("mousemove", handleMouseMove);
        container.removeEventListener("mouseleave", handleMouseLeave);
      }
      if (hideButtonsTimerRef.current) clearTimeout(hideButtonsTimerRef.current);
    };
  }, []);

  // Ad rotation timer (fullscreen only)
  useEffect(() => {
    if (!currentAd || ads.length === 0 || loopData?.displayLayout !== "fullscreen") return;

    if (timerRef.current) clearInterval(timerRef.current);

    currentDurationRef.current = currentAd.duration;
    setTimeRemaining(currentAd.duration);

    timerRef.current = setInterval(() => {
      currentDurationRef.current -= 1;
      setTimeRemaining(currentDurationRef.current);

      if (currentDurationRef.current <= 0) {
        clearInterval(timerRef.current!);
        setCurrentAdIndex((prev) => {
          let nextIndex: number;
          if (loopData?.rotationType === "random") {
            do {
              nextIndex = Math.floor(Math.random() * ads.length);
            } while (ads.length > 1 && nextIndex === prev);
          } else {
            nextIndex = (prev + 1) % ads.length;
          }
          const nextAd = ads[nextIndex] ?? null;
          setCurrentAd(nextAd);
          if (nextAd) {
            currentDurationRef.current = nextAd.duration;
            setTimeRemaining(nextAd.duration);
          }
          return nextIndex;
        });
      }
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [currentAd, ads, loopData?.displayLayout, loopData?.rotationType]);

  // Close menu on outside click
  useEffect(() => {
    if (!showMenu) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setShowMenu(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showMenu]);

  // Display login handler
  const handleDisplayLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginLoading(true);
    setLoginError("");

    try {
      let resolvedDisplayId = "";
      let resolvedConnectionToken = "";

      if (loginMethod === "password") {
        const response = await displaysApi.loginDisplay({
          displayId: passwordLoginData.displayId.trim(),
          password: passwordLoginData.password.trim(),
        });
        resolvedDisplayId = response.data.data.displayId;
        resolvedConnectionToken = response.data.data.connectionToken;
      } else {
        resolvedConnectionToken = tokenLoginData.connectionToken.trim();
        const response = await displaysApi.getByConnectionToken(resolvedConnectionToken);
        const displayData = response.data.data as {
          displayId: string;
          connectionRequestStatus?: "pending" | "approved" | "rejected";
          rejectionReason?: string | null;
          assignedAdmin?: string | null;
        };

        if (displayData.connectionRequestStatus === "rejected") {
          throw new Error(
            `This display registration was rejected${displayData.rejectionReason ? `: ${displayData.rejectionReason}` : "."}`
          );
        }

        if (
          displayData.connectionRequestStatus === "pending" ||
          (!displayData.connectionRequestStatus && !displayData.assignedAdmin)
        ) {
          throw new Error("This display is still pending admin approval.");
        }

        resolvedDisplayId = displayData.displayId;
      }

      localStorage.setItem("displayId", resolvedDisplayId);
      localStorage.setItem("connectionToken", resolvedConnectionToken);
      localStorage.setItem("displayMode", "true");

      setDisplayId(resolvedDisplayId);
      setLoginMode(false);
      setLoading(false);

      fetchAdsForDisplay();
      reportDisplayStatus(resolvedConnectionToken, "online");
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { message?: string } }; message?: string };
      const message = axiosErr.response?.data?.message || axiosErr.message || "Failed to authenticate display.";
      if (message.toLowerCase().includes("connection token")) {
        setLoginMethod("token");
      }
      setLoginError(message);
    } finally {
      setLoginLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("displayId");
    localStorage.removeItem("connectionToken");
    localStorage.removeItem("displayMode");
    setDisplayId(null);
    setAds([]);
    setCurrentAd(null);
    setLoginMode(true);
    setShowMenu(false);
    router.push("/login");
  };

  const handleSwitchDisplay = () => {
    localStorage.removeItem("displayId");
    localStorage.removeItem("connectionToken");
    localStorage.removeItem("displayMode");
    setDisplayId(null);
    setAds([]);
    setCurrentAd(null);
    setPasswordLoginData({ displayId: "", password: "" });
    setTokenLoginData({ connectionToken: "" });
    setLoginMethod("password");
    setLoginMode(true);
    setShowMenu(false);
  };

  const handleRefreshLoop = async () => {
    setIsRefreshing(true);
    try {
      await fetchAdsForDisplay();
    } finally {
      setTimeout(() => setIsRefreshing(false), 500);
    }
  };

  const handlePreviousAd = () => {
    if (ads.length <= 1) return;
    const prevIndex = (currentAdIndex - 1 + ads.length) % ads.length;
    const prevAd = ads[prevIndex] ?? null;
    setCurrentAdIndex(prevIndex);
    setCurrentAd(prevAd);
    if (prevAd) {
      setTimeRemaining(prevAd.duration);
      currentDurationRef.current = prevAd.duration;
    }
  };

  const handleNextAd = () => {
    if (ads.length <= 1) return;
    const nextIndex = (currentAdIndex + 1) % ads.length;
    const nextAd = ads[nextIndex] ?? null;
    setCurrentAdIndex(nextIndex);
    setCurrentAd(nextAd);
    if (nextAd) {
      setTimeRemaining(nextAd.duration);
      currentDurationRef.current = nextAd.duration;
    }
  };

  const MenuDropdown = () => (
    <div className="absolute top-14 left-0 bg-white rounded-lg shadow-xl overflow-hidden min-w-48 z-50">
      <div className="p-4 border-b border-gray-200 bg-gray-50">
        <p className="text-sm font-semibold text-gray-700">Display ID</p>
        <p className="text-xs text-gray-600 font-mono break-all">{displayId}</p>
      </div>
      <button
        onClick={handleSwitchDisplay}
        className="w-full px-4 py-3 flex items-center gap-3 text-left hover:bg-gray-100 text-gray-700 font-semibold border-b border-gray-100"
      >
        <RefreshCw size={18} />
        Switch Display
      </button>
      <button
        onClick={handleRefreshLoop}
        disabled={isRefreshing}
        className="w-full px-4 py-3 flex items-center gap-3 text-left hover:bg-blue-50 text-blue-600 font-semibold border-b border-gray-100 disabled:opacity-50"
      >
        <RefreshCw size={18} className={isRefreshing ? "animate-spin" : ""} />
        {isRefreshing ? "Refreshing..." : "Refresh Loop"}
      </button>
      <button
        onClick={handleLogout}
        className="w-full px-4 py-3 flex items-center gap-3 text-left hover:bg-red-50 text-red-600 font-semibold"
      >
        <LogOut size={18} />
        Logout
      </button>
    </div>
  );

  // --- Loading state ---
  if (loading) {
    return (
      <div className="w-screen h-screen flex items-center justify-center bg-black">
        <div className="text-center">
          <Loader2 size={48} className="text-white animate-spin mx-auto mb-4" />
          <p className="text-white">Initializing display...</p>
        </div>
      </div>
    );
  }

  // --- Login form ---
  if (loginMode) {
    return (
      <div className="w-screen h-screen flex items-center justify-center bg-gradient-to-br from-[#1a1a1a] to-[#2a2a2a]">
        <div className="bg-white rounded-2xl p-8 w-full max-w-md shadow-2xl">
          <h1 className="text-3xl font-bold text-black mb-2">Display Login</h1>
          <p className="text-gray-600 mb-6">Activate this display using password or connection token</p>

          <div className="grid grid-cols-2 rounded-lg border border-gray-200 bg-gray-100 p-1 mb-6">
            <button
              type="button"
              onClick={() => {
                setLoginMethod("password");
                setLoginError("");
              }}
              className={`px-3 py-2 rounded-md text-xs font-semibold transition-colors ${
                loginMethod === "password"
                  ? "bg-[#8b6f47] text-white"
                  : "text-gray-600 hover:text-black"
              }`}
            >
              Display ID + Password
            </button>
            <button
              type="button"
              onClick={() => {
                setLoginMethod("token");
                setLoginError("");
              }}
              className={`px-3 py-2 rounded-md text-xs font-semibold transition-colors ${
                loginMethod === "token"
                  ? "bg-[#8b6f47] text-white"
                  : "text-gray-600 hover:text-black"
              }`}
            >
              Connection Token
            </button>
          </div>

          {loginError && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
              {loginError}
            </div>
          )}

          <form onSubmit={handleDisplayLogin} className="space-y-4">
            {loginMethod === "password" ? (
              <>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Display ID</label>
                  <input
                    type="text"
                    value={passwordLoginData.displayId}
                    onChange={(e) =>
                      setPasswordLoginData({ ...passwordLoginData, displayId: e.target.value })
                    }
                    placeholder="e.g., DISP-1234567890-ABC123"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8b6f47] focus:border-transparent"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Password</label>
                  <input
                    type="password"
                    value={passwordLoginData.password}
                    onChange={(e) =>
                      setPasswordLoginData({ ...passwordLoginData, password: e.target.value })
                    }
                    placeholder="Enter your display password"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8b6f47] focus:border-transparent"
                    required
                  />
                </div>
              </>
            ) : (
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Connection Token</label>
                <input
                  type="text"
                  value={tokenLoginData.connectionToken}
                  onChange={(e) => setTokenLoginData({ connectionToken: e.target.value })}
                  placeholder="ct-disp_..."
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8b6f47] focus:border-transparent font-mono text-sm"
                  required
                />
              </div>
            )}
            <button
              type="submit"
              disabled={loginLoading}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-[#8b6f47] hover:bg-[#7a5f3a] disabled:opacity-50 text-white font-semibold rounded-lg"
            >
              {loginLoading ? (
                <>
                  <Loader2 size={20} className="animate-spin" />
                  Authenticating...
                </>
              ) : (
                loginMethod === "password" ? "Activate Display" : "Activate with Token"
              )}
            </button>
          </form>

          <div className="mt-6 p-4 bg-blue-50 rounded-lg text-sm text-blue-800">
            <p className="font-semibold mb-2">
              {loginMethod === "password" ? "How to find credentials:" : "How token login works:"}
            </p>
            <ol className="list-decimal list-inside space-y-1">
              {loginMethod === "password" ? (
                <>
                  <li>Use the Display ID from your display setup</li>
                  <li>Enter the password you set for this display</li>
                  <li>If password login fails, switch to connection token mode</li>
                </>
              ) : (
                <>
                  <li>Use the connection token generated during display registration</li>
                  <li>Pending displays must be approved in the admin dashboard first</li>
                  <li>Once approved, this display can activate immediately with the token</li>
                </>
              )}
            </ol>
          </div>
        </div>
      </div>
    );
  }

  // --- Error state (no ads) ---
  if (ads.length === 0 && error) {
    return (
      <div className="w-screen h-screen flex items-center justify-center bg-black relative">
        <div className="text-center">
          <p className="text-red-500 text-2xl mb-4">{error}</p>
          <p className="text-white text-sm">Press ESC to return to login</p>
        </div>
        <div className="absolute top-4 left-4 z-50" ref={menuRef}>
          <button
            onClick={() => setShowMenu((s) => !s)}
            className="p-3 bg-black/60 hover:bg-black/80 text-white rounded-lg"
          >
            <MoreVertical size={24} />
          </button>
          {showMenu && <MenuDropdown />}
        </div>
      </div>
    );
  }

  // --- Main display ---
  return (
    <div ref={containerRef} className="w-screen h-screen bg-black overflow-hidden">
      {loopData?.displayLayout === "masonry" ? (
        <div
          className="w-full h-full overflow-auto bg-black p-4"
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
            gridAutoRows: "auto",
            gap: "16px",
          }}
        >
          {ads.map((ad) => (
            <div
              key={ad.id}
              className="relative bg-black overflow-hidden flex items-center justify-center rounded-lg"
              style={{ aspectRatio: "1" }}
            >
              {ad.mediaType === "image" || ad.mediaType === "IMAGE" ? (
                <NextImage
                  src={ad.mediaUrl}
                  alt={ad.adName}
                  fill
                  className="object-contain"
                />
              ) : (
                <video
                  src={ad.mediaUrl}
                  autoPlay
                  muted
                  loop
                  className="w-full h-full object-contain"
                />
              )}
            </div>
          ))}
        </div>
      ) : currentAd ? (
        <div className="relative w-full h-full flex items-center justify-center">
          {/* Ad media */}
          {currentAd.mediaType === "image" || currentAd.mediaType === "IMAGE" ? (
            <NextImage
              src={currentAd.mediaUrl}
              alt={currentAd.adName}
              fill
              className="object-contain"
              priority
            />
          ) : (
            <video
              src={currentAd.mediaUrl}
              autoPlay
              muted
              loop
              className="w-full h-full object-contain"
            />
          )}

          {/* Prev button */}
          <button
            onClick={handlePreviousAd}
            disabled={ads.length <= 1}
            className={`absolute left-4 top-1/2 -translate-y-1/2 z-40 p-3 rounded-lg duration-300 ${
              ads.length <= 1
                ? "bg-gray-500/30 text-gray-400 cursor-not-allowed"
                : "bg-black/40 hover:bg-black/60 text-white cursor-pointer"
            } ${showNavigationButtons ? "opacity-100" : "opacity-0 pointer-events-none"}`}
          >
            <ChevronLeft size={32} />
          </button>

          {/* Next button */}
          <button
            onClick={handleNextAd}
            disabled={ads.length <= 1}
            className={`absolute right-4 top-1/2 -translate-y-1/2 z-40 p-3 rounded-lg duration-300 ${
              ads.length <= 1
                ? "bg-gray-500/30 text-gray-400 cursor-not-allowed"
                : "bg-black/40 hover:bg-black/60 text-white cursor-pointer"
            } ${showNavigationButtons ? "opacity-100" : "opacity-0 pointer-events-none"}`}
          >
            <ChevronRight size={32} />
          </button>

          {/* Menu */}
          <div className="absolute top-4 left-4 z-50" ref={menuRef}>
            <button
              onClick={() => setShowMenu((s) => !s)}
              className="p-3 bg-black/60 hover:bg-black/80 text-white rounded-lg"
            >
              <MoreVertical size={24} />
            </button>
            {showMenu && <MenuDropdown />}
          </div>

          {/* Debug info */}
          <div className="absolute bottom-4 right-4 bg-black/70 text-white text-xs p-2 rounded font-mono max-w-xs">
            <div>Display: {displayId?.substring(0, 20)}...</div>
            <div>Ad: {currentAd.adName}</div>
            <div>Time: {timeRemaining}s</div>
            <div>({currentAdIndex + 1}/{ads.length})</div>
          </div>

          {/* Timer indicator */}
          <div className="absolute top-4 right-4 bg-[#8b6f47] text-white px-4 py-2 rounded-lg font-semibold">
            {timeRemaining}s
          </div>
        </div>
      ) : (
        <div className="w-full h-full flex items-center justify-center bg-black relative">
          <div className="text-center">
            <p className="text-red-500 text-2xl font-semibold mb-4">{error}</p>
            <p className="text-gray-400 text-sm">Press ESC to return to login</p>
          </div>
          <div className="absolute top-4 left-4 z-50" ref={menuRef}>
            <button
              onClick={() => setShowMenu((s) => !s)}
              className="p-3 bg-black/60 hover:bg-black/80 text-white rounded-lg"
            >
              <MoreVertical size={24} />
            </button>
            {showMenu && <MenuDropdown />}
          </div>
        </div>
      )}
    </div>
  );
}
