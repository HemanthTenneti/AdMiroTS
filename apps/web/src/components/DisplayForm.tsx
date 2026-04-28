"use client";

import { useState } from "react";

interface DisplayFormProps {
  onSubmit: (data: {
    displayId: string;
    displayName: string;
    location: string;
    password?: string;
    resolution: { width: number; height: number };
  }) => Promise<void>;
  isLoading: boolean;
  error: string;
}

type ValidationErrors = Partial<Record<"displayId" | "displayName" | "location" | "password", string>>;

function getScreenResolution(): { width: number; height: number } {
  if (typeof window !== "undefined") {
    return { width: window.screen.width, height: window.screen.height };
  }
  return { width: 1920, height: 1080 };
}

export default function DisplayForm({ onSubmit, isLoading, error }: DisplayFormProps) {
  const screenResolution = getScreenResolution();

  const [formData, setFormData] = useState({
    displayId: "",
    displayName: "",
    location: "",
    password: "",
    width: screenResolution.width,
    height: screenResolution.height,
  });

  const [validationErrors, setValidationErrors] = useState<ValidationErrors>({});

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    if (validationErrors[name as keyof ValidationErrors]) {
      setValidationErrors((prev) => {
        const updated = { ...prev };
        delete updated[name as keyof ValidationErrors];
        return updated;
      });
    }
  };

  const validateForm = (): boolean => {
    const errors: ValidationErrors = {};

    if (!formData.displayId.trim()) {
      errors.displayId = "Display ID is required.";
    } else if (formData.displayId.length < 3) {
      errors.displayId = "Display ID must be at least 3 characters.";
    }

    if (!formData.displayName.trim()) {
      errors.displayName = "Display name is required.";
    } else if (formData.displayName.length < 3) {
      errors.displayName = "Display name must be at least 3 characters.";
    }

    if (!formData.location.trim()) {
      errors.location = "Location is required.";
    } else if (formData.location.length < 3) {
      errors.location = "Location must be at least 3 characters.";
    }

    if (formData.password && formData.password.length < 4) {
      errors.password = "Password must be at least 4 characters if provided.";
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!validateForm()) return;

    const password = formData.password.trim();
    await onSubmit({
      displayId: formData.displayId.trim(),
      displayName: formData.displayName.trim(),
      location: formData.location.trim(),
      ...(password ? { password } : {}),
      resolution: { width: formData.width, height: formData.height },
    });
  };

  const inputClass = (field: keyof ValidationErrors) =>
    `w-full px-4 py-3 border rounded-lg focus:outline-none transition bg-white text-black ${
      validationErrors[field]
        ? "border-red-500 focus:border-red-500"
        : "border-[#e5e5e5] focus:border-[#8b6f47]"
    }`;

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
          {error}
        </div>
      )}

      {/* Display ID */}
      <div>
        <label className="block text-sm font-medium text-black mb-2">
          Display ID <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          name="displayId"
          value={formData.displayId}
          onChange={handleInputChange}
          placeholder="e.g., LOBBY-1, STORE-MAIN"
          className={inputClass("displayId")}
          disabled={isLoading}
        />
        {validationErrors.displayId && (
          <p className="mt-1 text-sm text-red-600">{validationErrors.displayId}</p>
        )}
        <p className="mt-1 text-xs text-gray-500">
          Unique identifier for your display. Used for searching, sorting, and filtering.
        </p>
      </div>

      {/* Display Name */}
      <div>
        <label className="block text-sm font-medium text-black mb-2">
          Display Name <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          name="displayName"
          value={formData.displayName}
          onChange={handleInputChange}
          placeholder="e.g., Main Lobby Display"
          className={inputClass("displayName")}
          disabled={isLoading}
        />
        {validationErrors.displayName && (
          <p className="mt-1 text-sm text-red-600">{validationErrors.displayName}</p>
        )}
      </div>

      {/* Location */}
      <div>
        <label className="block text-sm font-medium text-black mb-2">
          Location <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          name="location"
          value={formData.location}
          onChange={handleInputChange}
          placeholder="e.g., Building A, Floor 2"
          className={inputClass("location")}
          disabled={isLoading}
        />
        {validationErrors.location && (
          <p className="mt-1 text-sm text-red-600">{validationErrors.location}</p>
        )}
      </div>

      {/* Password */}
      <div>
        <label className="block text-sm font-medium text-black mb-2">
          Password (Optional)
        </label>
        <input
          type="password"
          name="password"
          value={formData.password}
          onChange={handleInputChange}
          placeholder="Set a password for display login"
          className={inputClass("password")}
          disabled={isLoading}
        />
        {validationErrors.password && (
          <p className="mt-1 text-sm text-red-600">{validationErrors.password}</p>
        )}
        <p className="mt-1 text-xs text-gray-500">
          Optional password for additional security. Leave blank for no password protection.
        </p>
      </div>

      {/* Resolution — auto-detected, read-only */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="font-semibold text-blue-900 text-sm mb-3">
          Display Resolution (Auto-detected)
        </h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-blue-900 mb-1">Width</label>
            <div className="px-4 py-3 bg-white border border-blue-200 rounded-lg text-blue-900 font-semibold">
              {formData.width}px
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-blue-900 mb-1">Height</label>
            <div className="px-4 py-3 bg-white border border-blue-200 rounded-lg text-blue-900 font-semibold">
              {formData.height}px
            </div>
          </div>
        </div>
        <p className="mt-3 text-xs text-blue-800">
          Resolution is automatically detected from your display. It cannot be modified during display creation.
        </p>
      </div>

      {/* Submit */}
      <button
        type="submit"
        disabled={isLoading}
        className="w-full bg-[#8b6f47] hover:bg-[#6d5636] disabled:bg-gray-400 text-white font-semibold py-3 rounded-lg transition duration-200"
      >
        {isLoading ? "Adding Display..." : "Add Display"}
      </button>
    </form>
  );
}
