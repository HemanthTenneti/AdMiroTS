"use client";

import { useEffect, useState } from "react";
import { Save } from "lucide-react";
import { UpdateProfilePayloadSchema, UploadAvatarPayloadSchema } from "@admiro/shared";
import { useDashboardAuth } from "@/hooks/useDashboardAuth";
import { profileApi } from "@/lib/api/profile.api";
import { useAuthStore } from "@/features/auth/store/authStore";
import {
  PageTitle,
  Panel,
  PrimaryButton,
  TextInput,
} from "@/components/dashboard/ui";

export default function ProfilePage() {
  const { authReady } = useDashboardAuth();
  const authStore = useAuthStore();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    profilePicture: "",
  });

  const loadProfile = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await profileApi.get();
      const profile = response.data.data;
      setForm({
        firstName: profile.firstName ?? "",
        lastName: profile.lastName ?? "",
        profilePicture: profile.profilePicture ?? "",
      });
      authStore.setUser({
        id: profile.id,
        username: profile.username,
        email: profile.email,
        firstName: profile.firstName,
        lastName: profile.lastName,
        role: profile.role,
        profilePicture: profile.profilePicture,
        isActive: profile.isActive,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load profile");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!authReady) return;
    void loadProfile();
  }, [authReady]);

  const saveProfile = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);

    const profilePayload = {
      firstName: form.firstName || undefined,
      lastName: form.lastName || undefined,
      profilePicture: form.profilePicture || undefined,
    };

    const parsedProfile = UpdateProfilePayloadSchema.safeParse(profilePayload);
    if (!parsedProfile.success) {
      setError(parsedProfile.error.issues[0]?.message ?? "Invalid profile values");
      return;
    }

    if (profilePayload.profilePicture) {
      const avatarParsed = UploadAvatarPayloadSchema.safeParse({ avatarUrl: profilePayload.profilePicture });
      if (!avatarParsed.success) {
        setError(avatarParsed.error.issues[0]?.message ?? "Invalid avatar URL");
        return;
      }
    }

    setSaving(true);
    try {
      await profileApi.update(parsedProfile.data);
      if (profilePayload.profilePicture) {
        await profileApi.uploadAvatar({ avatarUrl: profilePayload.profilePicture });
      }
      await loadProfile();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save profile");
    } finally {
      setSaving(false);
    }
  };

  if (!authReady) {
    return <div className="p-6 text-sm text-[var(--color-text-secondary)]">Checking session...</div>;
  }

  return (
    <div className="space-y-6">
      <PageTitle
        title="Profile"
        subtitle="Manage account identity and avatar metadata used in the dashboard UI."
      />

      <Panel>
        {loading ? (
          <div className="rounded-xl border border-dashed border-[var(--color-border)] bg-white p-8 text-center text-sm text-[var(--color-text-muted)]">
            Loading profile...
          </div>
        ) : (
          <form onSubmit={saveProfile} className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm text-[var(--color-text-secondary)]">First name</label>
              <TextInput
                value={form.firstName}
                onChange={(e) => setForm((prev) => ({ ...prev, firstName: e.target.value }))}
              />
            </div>

            <div>
              <label className="mb-1 block text-sm text-[var(--color-text-secondary)]">Last name</label>
              <TextInput
                value={form.lastName}
                onChange={(e) => setForm((prev) => ({ ...prev, lastName: e.target.value }))}
              />
            </div>

            <div className="md:col-span-2">
              <label className="mb-1 block text-sm text-[var(--color-text-secondary)]">Profile picture URL</label>
              <TextInput
                value={form.profilePicture}
                placeholder="https://cdn.example.com/avatar.png"
                onChange={(e) => setForm((prev) => ({ ...prev, profilePicture: e.target.value }))}
              />
            </div>

            {form.profilePicture ? (
              <div className="md:col-span-2">
                <img
                  src={form.profilePicture}
                  alt="Profile preview"
                  className="h-20 w-20 rounded-full border border-[var(--color-border)] object-cover"
                />
              </div>
            ) : null}

            {error ? <p className="md:col-span-2 text-sm text-[#8a2a2a]">{error}</p> : null}

            <div className="md:col-span-2">
              <PrimaryButton type="submit" disabled={saving}>
                <Save className="mr-2 h-4 w-4" /> {saving ? "Saving..." : "Save Profile"}
              </PrimaryButton>
            </div>
          </form>
        )}
      </Panel>
    </div>
  );
}
