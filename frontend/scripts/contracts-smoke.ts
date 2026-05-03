import assert from "node:assert/strict";
import { ConnectionRequestListResponseSchema } from "../src/lib/contracts/schemas/connection-requests.ts";
import { DisplayLoginResponseSchema, RegisterSelfResponseSchema } from "../src/lib/contracts/schemas/displays.ts";
import { ProfileResponseSchema, UploadAvatarPayloadSchema } from "../src/lib/contracts/schemas/profile.ts";

const pendingConnectionResponse = {
  success: true,
  data: {
    data: [
      {
        id: "disp_abc123",
        requestId: "disp_abc123",
        displayId: "disp_abc123",
        displayName: "Lobby Screen",
        displayLocation: "HQ Lobby",
        status: "pending",
        requestedAt: "2026-05-03T16:00:00.000Z",
        respondedAt: null,
        rejectionReason: null,
        display: {
          id: "disp_abc123",
          displayId: "DISP-HQ-01",
          displayName: "Lobby Screen",
          location: "HQ Lobby",
          status: "inactive",
          assignedAdminId: null,
        },
      },
    ],
    pagination: {
      page: 1,
      limit: 50,
      total: 1,
      hasMore: false,
    },
  },
};

const normalizedConnectionResponse = ConnectionRequestListResponseSchema.parse(
  pendingConnectionResponse
);
assert.equal(normalizedConnectionResponse.success, true);
assert.equal(normalizedConnectionResponse.data.data.length, 1);
assert.equal(normalizedConnectionResponse.data.data[0].id, "disp_abc123");
assert.equal(normalizedConnectionResponse.data.data[0].requestId, "disp_abc123");
assert.equal(normalizedConnectionResponse.data.data[0].displayId, "disp_abc123");
assert.equal(normalizedConnectionResponse.data.data[0].status, "pending");

const rejectedConnectionResponse = {
  success: true,
  data: {
    data: [
      {
        id: "req_123",
        requestId: "REQ-123",
        displayId: "disp_abc123",
        displayName: "Lobby Screen",
        location: "HQ Lobby",
        status: "rejected",
        requestedAt: "2026-05-03T16:00:00.000Z",
        respondedAt: "2026-05-03T16:10:00.000Z",
        rejectionReason: "Rejected by admin",
      },
    ],
    pagination: {
      page: 1,
      limit: 50,
      total: 1,
      hasMore: false,
    },
  },
};
const rejectedParsed = ConnectionRequestListResponseSchema.parse(rejectedConnectionResponse);
assert.equal(rejectedParsed.data.data[0].status, "rejected");
assert.equal(rejectedParsed.data.data[0].rejectionReason, "Rejected by admin");

const registerSelfResponse = {
  success: true,
  data: {
    displayId: "DISP-HQ-01",
    connectionToken: "ct-disp_abc123-1777825772593",
    status: "inactive",
    isPendingApproval: true,
  },
};
assert.equal(RegisterSelfResponseSchema.parse(registerSelfResponse).success, true);

const displayLoginResponse = {
  success: true,
  data: {
    displayId: "DISP-HQ-01",
    displayName: "Lobby Screen",
    location: "HQ Lobby",
    connectionToken: "ct-disp_abc123-1777825772593",
    resolution: {
      width: 1920,
      height: 1080,
    },
    status: "offline",
  },
};
assert.equal(DisplayLoginResponseSchema.parse(displayLoginResponse).success, true);

const profileResponse = {
  success: true,
  data: {
    id: "user_123",
    username: "aalok",
    email: "aalok@example.com",
    firstName: "Aalok",
    lastName: "P",
    role: "admin",
    profilePicture: "data:image/png;base64,iVBORw0KGgo=",
    googleId: "google_123",
    isActive: true,
  },
};
assert.equal(ProfileResponseSchema.parse(profileResponse).success, true);
assert.equal(
  UploadAvatarPayloadSchema.parse({ avatarUrl: "data:image/webp;base64,UklGRg==" }).avatarUrl,
  "data:image/webp;base64,UklGRg=="
);

console.log("Frontend contract smoke checks passed.");
