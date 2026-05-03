"use client";

import { useState, useEffect, useCallback, FormEvent, ChangeEvent } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  ArrowLeft,
  Loader2,
  Upload,
  Eye,
  EyeOff,
  User,
  Mail,
  Lock,
  Camera,
  ShieldCheck,
} from "lucide-react";
import DashboardLayout from "@/components/DashboardLayout";
import client from "@/lib/api/client";
import { profileApi } from "@/lib/api/profile.api";
import { useAuthStore } from "@/features/auth/store/authStore";

// ─── Types ────────────────────────────────────────────────────────────────────

interface UserProfile {
  id: string;
  username: string;
  email: string;
  firstName?: string | undefined;
  lastName?: string | undefined;
  profilePicture?: string | undefined;
  googleId?: string | undefined;
  role: string;
  isActive: boolean;
}

type ProfileTab = "profile" | "email" | "password" | "picture";

interface ShowPasswords {
  current: boolean;
  new: boolean;
  confirm: boolean;
}

// ─── Custom Hook ──────────────────────────────────────────────────────────────

function useProfile() {
  const router = useRouter();
  const { setUser } = useAuthStore();

  const [user, setLocalUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<ProfileTab>("profile");
  const [isGoogleOAuth, setIsGoogleOAuth] = useState(false);

  // Profile form
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");

  // Email form
  const [newEmail, setNewEmail] = useState("");

  // Password form
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPasswords, setShowPasswords] = useState<ShowPasswords>({
    current: false,
    new: false,
    confirm: false,
  });

  // Profile picture
  const [profilePicture, setProfilePicture] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  const syncProfile = useCallback(
    (data: UserProfile) => {
      setLocalUser(data);
      setFirstName(data.firstName ?? "");
      setLastName(data.lastName ?? "");
      setNewEmail(data.email ?? "");
      setProfilePicture(data.profilePicture ?? null);
      setIsGoogleOAuth(Boolean(data.googleId));
      setUser({
        id: data.id,
        username: data.username,
        email: data.email,
        firstName: data.firstName,
        lastName: data.lastName,
        role: data.role,
        profilePicture: data.profilePicture,
        isActive: data.isActive,
      });
    },
    [setUser]
  );

  const fetchUserProfile = useCallback(async () => {
    try {
      setLoading(true);
      const response = await profileApi.get();
      syncProfile(response.data.data);
    } catch {
      toast.error("Failed to load profile");
    } finally {
      setLoading(false);
    }
  }, [syncProfile]);

  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    if (!token) {
      router.push("/login");
      return;
    }
    fetchUserProfile();
  }, [router, fetchUserProfile]);

  const handleUpdateProfile = useCallback(
    async (e: FormEvent) => {
      e.preventDefault();
      if (!firstName.trim() || !lastName.trim()) {
        toast.error("First name and last name are required");
        return;
      }
      try {
        setSaving(true);
        const response = await profileApi.update({
          firstName: firstName.trim(),
          lastName: lastName.trim(),
        });
        syncProfile(response.data.data);

        toast.success("Profile updated successfully");
      } catch (err: unknown) {
        const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
        toast.error(msg ?? "Failed to update profile");
      } finally {
        setSaving(false);
      }
    },
    [firstName, lastName, syncProfile]
  );

  const handleUpdateEmail = useCallback(
    async (e: FormEvent) => {
      e.preventDefault();
      if (!newEmail.trim()) {
        toast.error("Email is required");
        return;
      }
      try {
        setSaving(true);
        toast.error("Email updates are not supported by the current backend.");
      } finally {
        setSaving(false);
      }
    },
    [newEmail]
  );

  const handleChangePassword = useCallback(
    async (e: FormEvent) => {
      e.preventDefault();
      if (!newPassword) { toast.error("New password is required"); return; }
      if (!confirmPassword) { toast.error("Password confirmation is required"); return; }
      if (newPassword !== confirmPassword) { toast.error("Passwords do not match"); return; }
      if (newPassword.length < 6) { toast.error("Password must be at least 6 characters long"); return; }
      if (!isGoogleOAuth && !currentPassword) { toast.error("Current password is required"); return; }

      try {
        setSaving(true);
        await client.post("/api/auth/change-password", {
          currentPassword,
          newPassword,
        });

        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
        if (isGoogleOAuth) setIsGoogleOAuth(false);
        toast.success("Password changed successfully");
      } catch (err: unknown) {
        const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
        toast.error(msg ?? "Failed to change password");
      } finally {
        setSaving(false);
      }
    },
    [isGoogleOAuth, currentPassword, newPassword, confirmPassword]
  );

  const handleProfilePictureUpload = useCallback(
    async (e: ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;
      if (!file.type.startsWith("image/")) { toast.error("Only image files are allowed"); return; }
      if (file.size > 5 * 1024 * 1024) { toast.error("File size must be less than 5MB"); return; }

      try {
        setUploading(true);
        const avatarUrl = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(String(reader.result));
          reader.onerror = () => reject(reader.error);
          reader.readAsDataURL(file);
        });
        const response = await profileApi.uploadAvatar({ avatarUrl });
        syncProfile(response.data.data);
        toast.success("Profile picture updated successfully");
      } catch (err: unknown) {
        const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
        toast.error(msg ?? "Failed to upload profile picture");
      } finally {
        setUploading(false);
      }
    },
    [syncProfile]
  );

  const togglePassword = useCallback((field: keyof ShowPasswords) => {
    setShowPasswords((prev) => ({ ...prev, [field]: !prev[field] }));
  }, []);

  return {
    user,
    loading,
    saving,
    activeTab,
    setActiveTab,
    isGoogleOAuth,
    firstName, setFirstName,
    lastName, setLastName,
    newEmail, setNewEmail,
    currentPassword, setCurrentPassword,
    newPassword, setNewPassword,
    confirmPassword, setConfirmPassword,
    showPasswords,
    togglePassword,
    profilePicture,
    uploading,
    handleUpdateProfile,
    handleUpdateEmail,
    handleChangePassword,
    handleProfilePictureUpload,
  };
}

// ─── Sub-components ───────────────────────────────────────────────────────────

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  hint?: string;
}

function FormInput({ label, hint, ...props }: InputProps) {
  return (
    <div>
      <label className="block text-[var(--ds-text-2)] text-xs uppercase tracking-wide mb-1.5 font-medium">
        {label}
      </label>
      <input
        {...props}
        className={`bg-[var(--ds-input)] border border-[var(--ds-input-border)] text-[var(--ds-text)] placeholder:text-[var(--ds-text-3)] focus:border-[#7E3AF0] focus:outline-none rounded-lg px-3 py-2 w-full text-sm ${
          props.disabled ? "opacity-40 cursor-not-allowed" : ""
        } ${props.className ?? ""}`}
      />
      {hint && <p className="text-[var(--ds-text-3)] text-xs mt-1">{hint}</p>}
    </div>
  );
}

interface PasswordInputProps {
  label: string;
  value: string;
  onChange: (e: ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  show: boolean;
  onToggle: () => void;
}

function PasswordInput({ label, value, onChange, placeholder, show, onToggle }: PasswordInputProps) {
  return (
    <div>
      <label className="block text-[var(--ds-text-2)] text-xs uppercase tracking-wide mb-1.5 font-medium">
        {label}
      </label>
      <div className="relative">
        <input
          type={show ? "text" : "password"}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          className="bg-[var(--ds-input)] border border-[var(--ds-input-border)] text-[var(--ds-text)] placeholder:text-[var(--ds-text-3)] focus:border-[#7E3AF0] focus:outline-none rounded-lg px-3 py-2 w-full text-sm pr-10"
        />
        <button
          type="button"
          onClick={onToggle}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--ds-text-3)] hover:text-[var(--ds-text-2)]"
        >
          {show ? <EyeOff size={16} /> : <Eye size={16} />}
        </button>
      </div>
    </div>
  );
}

interface SubmitButtonProps {
  saving: boolean;
  label: string;
  loadingLabel?: string;
}

function SubmitButton({ saving, label, loadingLabel = "Saving..." }: SubmitButtonProps) {
  return (
    <button
      type="submit"
      disabled={saving}
      className="flex items-center justify-center gap-2 bg-[#7E3AF0] hover:bg-[#9F67FF] disabled:opacity-50 text-white font-semibold rounded-lg px-4 py-2.5 text-sm w-full"
    >
      {saving ? (
        <>
          <Loader2 size={15} className="animate-spin" />
          {loadingLabel}
        </>
      ) : (
        label
      )}
    </button>
  );
}

// ─── Tab panels ───────────────────────────────────────────────────────────────

function ProfileInfoPanel({
  firstName, setFirstName,
  lastName, setLastName,
  email,
  saving,
  onSubmit,
}: {
  firstName: string;
  setFirstName: (v: string) => void;
  lastName: string;
  setLastName: (v: string) => void;
  email?: string | undefined;
  saving: boolean;
  onSubmit: (e: FormEvent) => void;
}) {
  return (
    <form onSubmit={onSubmit} className="bg-[var(--ds-card)] border border-[var(--ds-border)] rounded-xl p-6 space-y-5">
      <h2 className="text-[var(--ds-text)] font-semibold mb-4">Personal Information</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormInput
          label="First Name"
          value={firstName}
          onChange={(e) => setFirstName(e.target.value)}
          placeholder="Enter your first name"
        />
        <FormInput
          label="Last Name"
          value={lastName}
          onChange={(e) => setLastName(e.target.value)}
          placeholder="Enter your last name"
        />
      </div>
      <FormInput
        label="Email"
        value={email ?? ""}
        disabled
        hint="Edit email in the Email tab"
        type="email"
        readOnly
      />
      <SubmitButton saving={saving} label="Save Changes" />
    </form>
  );
}

function EmailPanel({
  newEmail, setNewEmail,
  saving, onSubmit,
}: {
  newEmail: string;
  setNewEmail: (v: string) => void;
  saving: boolean;
  onSubmit: (e: FormEvent) => void;
}) {
  return (
    <form onSubmit={onSubmit} className="bg-[var(--ds-card)] border border-[var(--ds-border)] rounded-xl p-6 space-y-5">
      <h2 className="text-[var(--ds-text)] font-semibold mb-4">Email Address</h2>
      <FormInput
        label="New Email Address"
        type="email"
        value={newEmail}
        onChange={(e) => setNewEmail(e.target.value)}
        placeholder="Enter your new email"
        hint="We'll send a verification link to your new email address"
      />
      <SubmitButton saving={saving} label="Update Email" loadingLabel="Updating..." />
    </form>
  );
}

function PasswordPanel({
  isGoogleOAuth,
  currentPassword, setCurrentPassword,
  newPassword, setNewPassword,
  confirmPassword, setConfirmPassword,
  showPasswords, togglePassword,
  saving, onSubmit,
}: {
  isGoogleOAuth: boolean;
  currentPassword: string;
  setCurrentPassword: (v: string) => void;
  newPassword: string;
  setNewPassword: (v: string) => void;
  confirmPassword: string;
  setConfirmPassword: (v: string) => void;
  showPasswords: ShowPasswords;
  togglePassword: (field: keyof ShowPasswords) => void;
  saving: boolean;
  onSubmit: (e: FormEvent) => void;
}) {
  return (
    <form onSubmit={onSubmit} className="space-y-4">
      {isGoogleOAuth && (
        <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4">
          <div className="flex items-start gap-2.5">
            <ShieldCheck size={16} className="text-blue-400 mt-0.5 shrink-0" />
            <p className="text-blue-300 text-sm">
              Since you signed up with Google, you can set a password here. After that, you can log in with
              either Google or your password.
            </p>
          </div>
        </div>
      )}

      <div className="bg-[var(--ds-card)] border border-[var(--ds-border)] rounded-xl p-6 space-y-5">
        <h2 className="text-[var(--ds-text)] font-semibold mb-4">Change Password</h2>

        {!isGoogleOAuth && (
          <PasswordInput
            label="Current Password"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            placeholder="Enter your current password"
            show={showPasswords.current}
            onToggle={() => togglePassword("current")}
          />
        )}
        <PasswordInput
          label="New Password"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          placeholder="Enter your new password"
          show={showPasswords.new}
          onToggle={() => togglePassword("new")}
        />
        <PasswordInput
          label="Confirm Password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          placeholder="Confirm your new password"
          show={showPasswords.confirm}
          onToggle={() => togglePassword("confirm")}
        />

        <SubmitButton saving={saving} label="Change Password" loadingLabel="Changing..." />
      </div>

      {/* Danger zone */}
      <div className="bg-[var(--ds-card)] border border-red-500/20 rounded-xl p-6">
        <h3 className="text-red-400 font-semibold text-sm mb-1">Danger Zone</h3>
        <p className="text-[var(--ds-text-3)] text-xs">
          Password changes are irreversible. Make sure you save your new password in a secure place.
        </p>
      </div>
    </form>
  );
}

function PicturePanel({
  profilePicture,
  user,
  uploading,
  onUpload,
}: {
  profilePicture: string | null;
  user: UserProfile | null;
  uploading: boolean;
  onUpload: (e: ChangeEvent<HTMLInputElement>) => void;
}) {
  const initials =
    user?.firstName?.charAt(0).toUpperCase() ??
    user?.username?.charAt(0).toUpperCase() ??
    "U";

  return (
    <div className="bg-[var(--ds-card)] border border-[var(--ds-border)] rounded-xl p-6">
      <h2 className="text-[var(--ds-text)] font-semibold mb-6">Profile Picture</h2>
      <div className="flex flex-col items-center gap-6">
        <div className="relative group">
          {profilePicture ? (
            <img
              src={profilePicture}
              alt="Profile"
              className="w-32 h-32 rounded-full object-cover border-2 border-[#7E3AF0]/40"
            />
          ) : (
            <div className="w-32 h-32 rounded-full bg-gradient-to-br from-[#7E3AF0] to-[#9F67FF] flex items-center justify-center border-2 border-[#7E3AF0]/40">
              <span className="text-[var(--ds-text)] text-4xl font-bold">{initials}</span>
            </div>
          )}
          <div className="absolute inset-0 rounded-full bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center">
            <Camera size={24} className="text-[var(--ds-text)]" />
          </div>
        </div>

        <label className="flex items-center gap-2 bg-[#7E3AF0] hover:bg-[#9F67FF] text-white font-semibold rounded-lg px-4 py-2.5 text-sm cursor-pointer">
          <Upload size={15} />
          {uploading ? "Uploading..." : "Change Photo"}
          <input
            type="file"
            accept="image/*"
            onChange={onUpload}
            disabled={uploading}
            className="hidden"
          />
        </label>

        <p className="text-[var(--ds-text-3)] text-xs text-center">
          Accepted formats: JPG, PNG, GIF, WEBP — max 5MB
        </p>
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

const TABS: { id: ProfileTab; label: string; icon: React.ReactNode }[] = [
  { id: "profile", label: "Profile Info", icon: <User size={14} /> },
  { id: "email", label: "Email", icon: <Mail size={14} /> },
  { id: "password", label: "Password", icon: <Lock size={14} /> },
  { id: "picture", label: "Picture", icon: <Camera size={14} /> },
];

export default function ProfilePage() {
  const router = useRouter();
  const {
    user,
    loading,
    saving,
    activeTab, setActiveTab,
    isGoogleOAuth,
    firstName, setFirstName,
    lastName, setLastName,
    newEmail, setNewEmail,
    currentPassword, setCurrentPassword,
    newPassword, setNewPassword,
    confirmPassword, setConfirmPassword,
    showPasswords, togglePassword,
    profilePicture,
    uploading,
    handleUpdateProfile,
    handleUpdateEmail,
    handleChangePassword,
    handleProfilePictureUpload,
  } = useProfile();

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <Loader2 size={40} className="text-[#7E3AF0] animate-spin mx-auto mb-3" />
            <p className="text-[var(--ds-text-2)] text-sm">Loading your profile...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto px-1">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => router.push("/dashboard")}
            className="flex items-center gap-2 text-[var(--ds-text-2)] hover:text-[var(--ds-text)] text-sm font-medium mb-5"
          >
            <ArrowLeft size={16} />
            Back to Dashboard
          </button>
          <h1 className="text-3xl font-bold text-[var(--ds-text)] mb-1">Profile Settings</h1>
          <p className="text-[var(--ds-text-2)] text-sm">Manage your account information</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Avatar sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-[var(--ds-card)] border border-[var(--ds-border)] rounded-xl p-5 sticky top-6">
              <div className="flex flex-col items-center text-center gap-3">
                {profilePicture ? (
                  <img
                    src={profilePicture}
                    alt="Profile"
                    className="w-20 h-20 rounded-full object-cover border-2 border-[#7E3AF0]/40"
                  />
                ) : (
                  <div className="w-20 h-20 rounded-full bg-gradient-to-br from-[#7E3AF0] to-[#9F67FF] flex items-center justify-center border-2 border-[#7E3AF0]/40">
                    <span className="text-[var(--ds-text)] text-2xl font-bold">
                      {user?.firstName?.charAt(0).toUpperCase() ??
                        user?.username?.charAt(0).toUpperCase() ??
                        "U"}
                    </span>
                  </div>
                )}
                <div className="w-full min-w-0">
                  <p
                    className="truncate text-[var(--ds-text)] font-semibold text-sm"
                    title={
                      user?.firstName && user?.lastName
                        ? `${user.firstName} ${user.lastName}`
                        : user?.username
                    }
                  >
                    {user?.firstName && user?.lastName
                      ? `${user.firstName} ${user.lastName}`
                      : user?.username}
                  </p>
                  <p
                    className="mt-0.5 max-w-full truncate text-xs text-[var(--ds-text-3)]"
                    title={user?.email}
                  >
                    {user?.email}
                  </p>
                </div>
                <div className="w-full pt-3 border-t border-[var(--ds-border)]">
                  <p className="text-[var(--ds-text-3)] text-xs uppercase tracking-wide mb-1">Username</p>
                  <p className="truncate text-[var(--ds-text)] text-sm font-medium" title={user?.username}>
                    @{user?.username}
                  </p>
                  <p className="text-[var(--ds-text-3)] text-xs mt-0.5">Cannot be changed</p>
                </div>
              </div>
            </div>
          </div>

          {/* Settings pane */}
          <div className="lg:col-span-3">
            {/* Tab pills */}
            <div className="flex gap-2 mb-5 flex-wrap">
              {TABS.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold ${
                    activeTab === tab.id
                      ? "bg-[#7E3AF0] text-white"
                      : "bg-[var(--ds-hover)] text-[var(--ds-text-2)] hover:text-[var(--ds-text)]"
                  }`}
                >
                  {tab.icon}
                  {tab.label}
                </button>
              ))}
            </div>

            {activeTab === "profile" && (
              <ProfileInfoPanel
                firstName={firstName}
                setFirstName={setFirstName}
                lastName={lastName}
                setLastName={setLastName}
                email={user?.email}
                saving={saving}
                onSubmit={handleUpdateProfile}
              />
            )}

            {activeTab === "email" && (
              <EmailPanel
                newEmail={newEmail}
                setNewEmail={setNewEmail}
                saving={saving}
                onSubmit={handleUpdateEmail}
              />
            )}

            {activeTab === "password" && (
              <PasswordPanel
                isGoogleOAuth={isGoogleOAuth}
                currentPassword={currentPassword}
                setCurrentPassword={setCurrentPassword}
                newPassword={newPassword}
                setNewPassword={setNewPassword}
                confirmPassword={confirmPassword}
                setConfirmPassword={setConfirmPassword}
                showPasswords={showPasswords}
                togglePassword={togglePassword}
                saving={saving}
                onSubmit={handleChangePassword}
              />
            )}

            {activeTab === "picture" && (
              <PicturePanel
                profilePicture={profilePicture}
                user={user}
                uploading={uploading}
                onUpload={handleProfilePictureUpload}
              />
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
