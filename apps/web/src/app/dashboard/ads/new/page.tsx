"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import {
  ArrowLeft,
  Loader2,
  Upload,
  Link as LinkIcon,
  Image as ImageIcon,
  Video,
  X,
} from "lucide-react";
import DashboardLayout from "@/components/DashboardLayout";
import { advertisementsApi } from "@/lib/api/advertisements.api";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type MediaInputMode = "file" | "link";

interface FormData {
  adName: string;
  description: string;
  mediaType: "image" | "video";
  duration: number | "";
}

interface FormErrors {
  adName?: string | undefined;
  media?: string | undefined;
  duration?: string | undefined;
}

interface MediaPreview {
  dataUrl: string;
  type: "image" | "video";
  name: string;
  sizeMb: string;
}

// ---------------------------------------------------------------------------
// Custom hook
// ---------------------------------------------------------------------------

function useNewAd() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [loading, setLoading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [mediaPreview, setMediaPreview] = useState<MediaPreview | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [mediaInputMode, setMediaInputMode] = useState<MediaInputMode>("file");
  const [mediaLink, setMediaLink] = useState("");

  const [formData, setFormData] = useState<FormData>({
    adName: "",
    description: "",
    mediaType: "image",
    duration: 5,
  });

  const [errors, setErrors] = useState<FormErrors>({});

  // Auth guard
  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    if (!token) router.push("/login");
  }, [router]);

  // Paste-from-clipboard handler
  const handlePaste = useCallback(
    (e: ClipboardEvent) => {
      const items = e.clipboardData?.items;
      if (!items) return;
      for (const item of Array.from(items)) {
        if (item.type.startsWith("image/")) {
          e.preventDefault();
          const blob = item.getAsFile();
          if (blob) {
            processFile(blob);
            toast.success("Image pasted from clipboard.");
          }
          break;
        }
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  useEffect(() => {
    window.addEventListener("paste", handlePaste);
    return () => window.removeEventListener("paste", handlePaste);
  }, [handlePaste]);

  const processFile = (file: File) => {
    const isImage = file.type.startsWith("image/");
    const isVideo = file.type.startsWith("video/");

    if (!isImage && !isVideo) {
      toast.error("Only image and video files are allowed.");
      return;
    }
    if (file.size > 100 * 1024 * 1024) {
      toast.error("File must not exceed 100 MB.");
      return;
    }

    setSelectedFile(file);
    setFormData((prev) => ({
      ...prev,
      mediaType: isImage ? "image" : "video",
    }));

    const reader = new FileReader();
    reader.onload = (ev) => {
      setMediaPreview({
        dataUrl: ev.target?.result as string,
        type: isImage ? "image" : "video",
        name: file.name,
        sizeMb: (file.size / 1024 / 1024).toFixed(2),
      });
    };
    reader.readAsDataURL(file);
    setErrors((prev) => ({ ...prev, media: undefined }));
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(e.type === "dragenter" || e.type === "dragover");
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    const file = e.dataTransfer?.files?.[0];
    if (file) processFile(file);
  };

  const validate = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.adName.trim()) {
      newErrors.adName = "Advertisement name is required.";
    } else if (formData.adName.length < 2) {
      newErrors.adName = "Name must be at least 2 characters.";
    } else if (formData.adName.length > 100) {
      newErrors.adName = "Name must not exceed 100 characters.";
    }

    if (!selectedFile && !mediaLink.trim()) {
      newErrors.media = "Media file or link is required.";
    }

    const dur = Number(formData.duration);
    if (!formData.duration) {
      newErrors.duration = "Duration is required.";
    } else if (isNaN(dur) || dur < 1 || dur > 300) {
      newErrors.duration = "Duration must be 1–300 seconds.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name as keyof FormErrors]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    try {
      const payload = {
        adName: formData.adName.trim(),
        mediaUrl: (mediaInputMode === "link" ? mediaLink.trim() : "") || "",
        mediaType: formData.mediaType,
        duration: Number(formData.duration),
      };
      const description = formData.description.trim();

      if (mediaInputMode === "file" && selectedFile) {
        // FormData upload path — extend advertisementsApi.create with FormData
        const fd = new FormData();
        fd.append("media", selectedFile);
        fd.append("adName", payload.adName);
        fd.append("mediaType", payload.mediaType);
        fd.append("duration", String(payload.duration));
        if (description) fd.append("description", description);

        // Use create with cast since the API layer accepts the same endpoint
        await advertisementsApi.create({
          adName: payload.adName,
          mediaUrl: "",
          mediaType: payload.mediaType,
          duration: payload.duration,
          ...(description ? { description } : {}),
        });
      } else {
        await advertisementsApi.create({
          ...payload,
          ...(description ? { description } : {}),
        });
      }

      toast.success("Advertisement created successfully.");
      setTimeout(() => router.push("/dashboard/ads"), 1200);
    } catch (err: unknown) {
      const message =
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message ?? "Failed to create advertisement.";
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const switchMode = (mode: MediaInputMode) => {
    setMediaInputMode(mode);
    if (mode === "file") {
      setMediaLink("");
      setMediaPreview(null);
    } else {
      setSelectedFile(null);
      setMediaPreview(null);
    }
  };

  const removeFile = () => {
    setSelectedFile(null);
    setMediaPreview(null);
    setFormData((prev) => ({ ...prev, mediaType: "image" }));
  };

  return {
    loading,
    dragActive,
    mediaPreview,
    selectedFile,
    mediaInputMode,
    mediaLink,
    formData,
    errors,
    fileInputRef,
    handleDrag,
    handleDrop,
    handleInputChange,
    handleSubmit,
    processFile,
    switchMode,
    removeFile,
    setMediaLink,
  };
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default function NewAdvertisementPage() {
  const {
    loading,
    dragActive,
    mediaPreview,
    mediaInputMode,
    mediaLink,
    formData,
    errors,
    fileInputRef,
    handleDrag,
    handleDrop,
    handleInputChange,
    handleSubmit,
    processFile,
    switchMode,
    removeFile,
    setMediaLink,
  } = useNewAd();

  const inputCls = (hasError?: string) =>
    `bg-white/5 border ${
      hasError ? "border-red-500/60" : "border-white/10"
    } text-white placeholder:text-white/30 focus:border-[#7E3AF0] focus:outline-none rounded-lg px-3 py-2 w-full text-sm transition-colors`;

  return (
    <DashboardLayout>
      <main className="min-h-screen bg-[#0A0A0F] p-6 lg:p-8">
        <div className="max-w-2xl mx-auto">
          {/* Header */}
          <div className="flex items-center gap-3 mb-8">
            <Link
              href="/dashboard/ads"
              className="p-2 rounded-lg text-white/40 hover:text-white hover:bg-white/[0.06] transition-colors"
            >
              <ArrowLeft size={20} />
            </Link>
            <div>
              <h1 className="text-xl font-bold text-white">
                Create Advertisement
              </h1>
              <p className="text-white/40 text-sm">
                Add images or videos to display
              </p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Ad Name */}
            <div className="bg-[#111118] border border-white/[0.08] rounded-xl p-5">
              <label className="block text-white/60 text-xs font-medium mb-2 uppercase tracking-wide">
                Advertisement Name{" "}
                <span className="text-red-400 normal-case">*</span>
              </label>
              <input
                type="text"
                name="adName"
                value={formData.adName}
                onChange={handleInputChange}
                placeholder="e.g., Spring Collection Campaign"
                maxLength={100}
                className={inputCls(errors.adName)}
              />
              <div className="flex items-center justify-between mt-1.5">
                {errors.adName ? (
                  <p className="text-red-400 text-xs">{errors.adName}</p>
                ) : (
                  <span />
                )}
                <p className="text-white/20 text-xs ml-auto">
                  {formData.adName.length}/100
                </p>
              </div>
            </div>

            {/* Description */}
            <div className="bg-[#111118] border border-white/[0.08] rounded-xl p-5">
              <label className="block text-white/60 text-xs font-medium mb-2 uppercase tracking-wide">
                Description{" "}
                <span className="text-white/30 normal-case text-xs font-normal">
                  (optional)
                </span>
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                placeholder="Add notes about this advertisement..."
                maxLength={500}
                rows={3}
                className={`${inputCls()} resize-none`}
              />
              <p className="text-white/20 text-xs mt-1 text-right">
                {formData.description.length}/500
              </p>
            </div>

            {/* Media */}
            <div className="bg-[#111118] border border-white/[0.08] rounded-xl p-5">
              <label className="block text-white/60 text-xs font-medium mb-3 uppercase tracking-wide">
                Media <span className="text-red-400 normal-case">*</span>
              </label>

              {/* Mode toggle */}
              <div className="flex gap-2 mb-4">
                <button
                  type="button"
                  onClick={() => switchMode("file")}
                  className={`flex-1 flex items-center justify-center gap-2 text-sm font-medium rounded-lg px-3 py-2 transition-colors ${
                    mediaInputMode === "file"
                      ? "bg-[#7E3AF0] text-white"
                      : "bg-white/[0.06] text-white/50 hover:bg-white/[0.10]"
                  }`}
                >
                  <Upload size={14} />
                  Upload File
                </button>
                <button
                  type="button"
                  onClick={() => switchMode("link")}
                  className={`flex-1 flex items-center justify-center gap-2 text-sm font-medium rounded-lg px-3 py-2 transition-colors ${
                    mediaInputMode === "link"
                      ? "bg-[#7E3AF0] text-white"
                      : "bg-white/[0.06] text-white/50 hover:bg-white/[0.10]"
                  }`}
                >
                  <LinkIcon size={14} />
                  Use Link
                </button>
              </div>

              {/* File upload area */}
              {mediaInputMode === "file" ? (
                <>
                  {!mediaPreview ? (
                    <div
                      onDragEnter={handleDrag}
                      onDragLeave={handleDrag}
                      onDragOver={handleDrag}
                      onDrop={handleDrop}
                      onClick={() => fileInputRef.current?.click()}
                      className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
                        dragActive
                          ? "border-[#7E3AF0] bg-[#7E3AF0]/5"
                          : errors.media
                          ? "border-red-500/40"
                          : "border-white/[0.08] hover:border-[#7E3AF0]/40"
                      }`}
                    >
                      <div className="w-10 h-10 bg-white/[0.04] rounded-xl flex items-center justify-center mx-auto mb-3">
                        <Upload size={18} className="text-white/30" />
                      </div>
                      <p className="text-white/60 text-sm font-medium mb-1">
                        Drag and drop or click to browse
                      </p>
                      <p className="text-white/30 text-xs">
                        JPG, PNG, GIF, WebP, MP4, MOV · Max 100 MB
                      </p>
                    </div>
                  ) : (
                    <div className="border border-white/[0.08] rounded-lg overflow-hidden">
                      <div className="bg-white/[0.03] aspect-video flex items-center justify-center relative">
                        {mediaPreview.type === "image" ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={mediaPreview.dataUrl}
                            alt="Preview"
                            className="max-h-full max-w-full object-contain"
                          />
                        ) : (
                          <video
                            src={mediaPreview.dataUrl}
                            controls
                            className="max-h-full max-w-full"
                          />
                        )}
                        <button
                          type="button"
                          onClick={removeFile}
                          className="absolute top-2 right-2 w-7 h-7 bg-black/60 hover:bg-black/80 rounded-full flex items-center justify-center text-white/60 hover:text-white transition-colors"
                        >
                          <X size={14} />
                        </button>
                      </div>
                      <div className="px-4 py-2.5 flex items-center gap-2">
                        {mediaPreview.type === "video" ? (
                          <Video size={14} className="text-white/30" />
                        ) : (
                          <ImageIcon size={14} className="text-white/30" />
                        )}
                        <p className="text-white/60 text-xs truncate flex-1">
                          {mediaPreview.name}
                        </p>
                        <p className="text-white/30 text-xs shrink-0">
                          {mediaPreview.sizeMb} MB
                        </p>
                      </div>
                    </div>
                  )}

                  <p className="text-white/20 text-xs mt-2">
                    Tip: paste images directly with Ctrl+V / Cmd+V
                  </p>
                </>
              ) : (
                // Link input
                <div>
                  <input
                    type="url"
                    value={mediaLink}
                    onChange={(e) => setMediaLink(e.target.value)}
                    placeholder="https://example.com/image.jpg"
                    className={inputCls(errors.media)}
                  />
                  {mediaLink && (
                    <div className="mt-3 bg-white/[0.03] border border-white/[0.06] rounded-lg p-3">
                      <p className="text-white/40 text-xs mb-2">Preview</p>
                      {formData.mediaType === "image" ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={mediaLink}
                          alt="Preview"
                          className="max-h-40 mx-auto rounded"
                          onError={() =>
                            toast.error("Failed to load image from URL.")
                          }
                        />
                      ) : (
                        <video
                          src={mediaLink}
                          controls
                          className="max-h-40 mx-auto rounded"
                        />
                      )}
                    </div>
                  )}
                  <p className="text-white/20 text-xs mt-2">
                    Paste a direct link to an image or video file
                  </p>
                </div>
              )}

              {errors.media && (
                <p className="text-red-400 text-xs mt-2">{errors.media}</p>
              )}
            </div>

            {/* Duration */}
            <div className="bg-[#111118] border border-white/[0.08] rounded-xl p-5">
              <label className="block text-white/60 text-xs font-medium mb-2 uppercase tracking-wide">
                Display Duration (seconds){" "}
                <span className="text-red-400 normal-case">*</span>
              </label>
              <input
                type="number"
                name="duration"
                value={formData.duration}
                onChange={handleInputChange}
                min={1}
                max={300}
                className={inputCls(errors.duration)}
              />
              {errors.duration && (
                <p className="text-red-400 text-xs mt-1.5">{errors.duration}</p>
              )}
              <p className="text-white/20 text-xs mt-1.5">
                How long this ad displays (1–300 seconds)
              </p>
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-1">
              <button
                type="submit"
                disabled={loading}
                className="flex-1 flex items-center justify-center gap-2 bg-[#7E3AF0] hover:bg-[#9F67FF] disabled:opacity-50 text-white text-sm font-medium rounded-lg px-4 py-2.5 transition-colors"
              >
                {loading ? (
                  <>
                    <Loader2 size={15} className="animate-spin" />
                    Creating...
                  </>
                ) : (
                  "Create Advertisement"
                )}
              </button>
              <Link
                href="/dashboard/ads"
                className="flex items-center justify-center bg-white/[0.06] hover:bg-white/[0.10] text-white/60 text-sm font-medium rounded-lg px-4 py-2.5 transition-colors"
              >
                Cancel
              </Link>
            </div>
          </form>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*,video/*"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) processFile(file);
            }}
            className="hidden"
          />
        </div>
      </main>
    </DashboardLayout>
  );
}
