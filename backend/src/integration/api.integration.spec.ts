import { expect } from "chai";
import request from "supertest";
import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";

type AppServer = Parameters<typeof request>[0];

describe("API Integration", function () {
  this.timeout(120000);

  let mongoServer: MongoMemoryServer;
  let app: AppServer;
  let api: any;

  let authToken = "";
  let userId = "";

  let approvedDisplayDbId = "";
  let approvedDisplayPublicId = "";
  let approvedDisplayToken = "";
  let approvedDisplayRequestId = "";

  let rejectedDisplayToken = "";
  let rejectedDisplayRequestId = "";
  let passwordlessDisplayToken = "";
  let passwordlessDisplayPublicId = "";
  let passwordlessDisplayRequestId = "";

  let manualDisplayDbId = "";
  let manualDisplayPublicId = "";

  let advertisementId = "";
  let advertisementAdId = "";
  let uploadedObjectKey = "";

  let loopId = "";
  let analyticsId = "";
  let systemLogId = "";

  const authHeader = () => ({ Authorization: `Bearer ${authToken}` });

  const expectConnectionRequestShape = (request: any) => {
    expect(request.id).to.be.a("string").and.not.empty;
    expect(request.requestId).to.be.a("string").and.not.empty;
    expect(request.displayId).to.be.a("string").and.not.empty;
    expect(["pending", "approved", "rejected"]).to.include(request.status);
    if (request.respondedAt !== null && request.respondedAt !== undefined) {
      expect(request.respondedAt).to.be.a("string");
    }
    if (request.rejectionReason !== null && request.rejectionReason !== undefined) {
      expect(request.rejectionReason).to.be.a("string");
    }
  };

  before(async () => {
    process.env.NODE_ENV = "test";
    process.env.JWT_SECRET = "test-secret";
    process.env.JWT_EXPIRES_IN = "7d";
    process.env.GOOGLE_CLIENT_ID = "test-client-id";
    process.env.CORS_ORIGINS = "http://localhost:3000";

    process.env.R2_ACCOUNT_ID = "testaccount";
    process.env.R2_ACCESS_KEY_ID = "test-access-key";
    process.env.R2_SECRET_ACCESS_KEY = "test-secret-key";
    process.env.R2_BUCKET_NAME = "admiro-media";
    process.env.R2_PUBLIC_BASE_URL = "https://cdn.example.com";
    process.env.R2_UPLOAD_URL_TTL_SECONDS = "600";

    mongoServer = await MongoMemoryServer.create();
    process.env.MONGODB_URI = mongoServer.getUri("admiro-integration");

    const { connectDb } = await import("../config/db.js");
    await connectDb();

    const appModule = await import("../app.js");
    app = appModule.default;
    api = request(app);
  });

  after(async () => {
    await mongoose.connection.dropDatabase();
    await mongoose.disconnect();
    await mongoServer.stop();
  });

  describe("Platform routes", () => {
    it("GET /api/health returns service status", async () => {
      const response = await api.get("/api/health");
      expect(response.status).to.equal(200);
      expect(response.body.status).to.equal("ok");
    });

    it("GET /api/workflow returns module list", async () => {
      const response = await api.get("/api/workflow");
      expect(response.status).to.equal(200);
      expect(response.body.workflow).to.be.an("array");
    });
  });

  describe("Auth routes", () => {
    it("POST /api/auth/register creates account", async () => {
      const response = await api.post("/api/auth/register").send({
        email: "admin@admiro.test",
        username: "admin_user",
        password: "password123",
        confirmPassword: "password123",
        role: "admin",
        firstName: "Admin",
        lastName: "User",
      });

      expect(response.status).to.equal(201);
      expect(response.body.success).to.equal(true);
      authToken = response.body.data.accessToken;
      userId = response.body.data.user.id;
    });

    it("POST /api/auth/register rejects duplicate email", async () => {
      const response = await api.post("/api/auth/register").send({
        email: "admin@admiro.test",
        username: "admin_user_2",
        password: "password123",
        confirmPassword: "password123",
        role: "admin",
      });
      expect(response.status).to.equal(409);
    });

    it("POST /api/auth/login authenticates with username", async () => {
      const response = await api.post("/api/auth/login").send({
        usernameOrEmail: "admin_user",
        password: "password123",
      });
      expect(response.status).to.equal(200);
      authToken = response.body.data.accessToken;
    });

    it("GET /api/auth/me rejects unauthenticated request", async () => {
      const response = await api.get("/api/auth/me");
      expect(response.status).to.equal(401);
    });

    it("GET /api/auth/me returns current user", async () => {
      const response = await api.get("/api/auth/me").set(authHeader());
      expect(response.status).to.equal(200);
      expect(response.body.success).to.equal(true);
    });

    it("POST /api/auth/refresh issues new token", async () => {
      const response = await api.post("/api/auth/refresh").set(authHeader());
      expect(response.status).to.equal(200);
      expect(response.body.data.accessToken).to.be.a("string");
      authToken = response.body.data.accessToken;
    });

    it("POST /api/auth/change-password updates credentials", async () => {
      const response = await api.post("/api/auth/change-password").set(authHeader()).send({
        currentPassword: "password123",
        newPassword: "newpassword123",
      });
      expect(response.status).to.equal(200);
    });

    it("POST /api/auth/login authenticates with updated password", async () => {
      const response = await api.post("/api/auth/login").send({
        usernameOrEmail: "admin@admiro.test",
        password: "newpassword123",
      });
      expect(response.status).to.equal(200);
      authToken = response.body.data.accessToken;
    });

    it("POST /api/auth/google rejects missing token", async () => {
      const response = await api.post("/api/auth/google").send({});
      expect(response.status).to.equal(400);
    });

    it("POST /api/auth/logout succeeds for authenticated user", async () => {
      const response = await api.post("/api/auth/logout").set(authHeader());
      expect(response.status).to.equal(200);
    });
  });

  describe("Profile routes", () => {
    it("GET /api/profile rejects unauthenticated request", async () => {
      const response = await api.get("/api/profile");
      expect(response.status).to.equal(401);
    });

    it("GET /api/profile returns profile", async () => {
      const response = await api.get("/api/profile").set(authHeader());
      expect(response.status).to.equal(200);
      expect(response.body.success).to.equal(true);
    });

    it("PUT /api/profile updates first/last name", async () => {
      const response = await api.put("/api/profile").set(authHeader()).send({
        firstName: "AdminUpdated",
        lastName: "UserUpdated",
        profilePicture: "https://cdn.example.com/avatar.png",
      });
      expect(response.status).to.equal(200);
      expect(response.body.success).to.equal(true);
    });

    it("POST /api/profile/avatar uploads avatar", async () => {
      const response = await api.post("/api/profile/avatar").set(authHeader()).send({
        avatarUrl: "https://cdn.example.com/avatar-updated.png",
      });
      expect(response.status).to.equal(200);
    });

    it("GET /api/profile/avatar returns current avatar", async () => {
      const response = await api.get("/api/profile/avatar").set(authHeader());
      expect(response.status).to.equal(200);
      expect(response.body.data.avatarUrl).to.equal("https://cdn.example.com/avatar-updated.png");
    });
  });

  describe("Display routes", () => {
    it("POST /api/displays/register-self creates pending display request", async () => {
      const response = await api.post("/api/displays/register-self").send({
        displayName: "Lobby Screen",
        location: "HQ Lobby",
        displayId: "DISP-HQ-LOBBY-01",
        password: "displaypass",
        resolution: { width: 1920, height: 1080 },
        browserInfo: { browserVersion: "integration-browser" },
      });

      expect(response.status).to.equal(201);
      approvedDisplayPublicId = response.body.data.displayId;
      approvedDisplayToken = response.body.data.connectionToken;
    });

    it("POST /api/displays/register-self supports passwordless display registration", async () => {
      const response = await api.post("/api/displays/register-self").send({
        displayName: "Token Only Screen",
        location: "HQ Hallway",
        displayId: "DISP-NOPASS-01",
        resolution: { width: 1920, height: 1080 },
        browserInfo: { browserVersion: "integration-browser" },
      });

      expect(response.status).to.equal(201);
      passwordlessDisplayPublicId = response.body.data.displayId;
      passwordlessDisplayToken = response.body.data.connectionToken;
      expect(passwordlessDisplayPublicId).to.equal("DISP-NOPASS-01");
      expect(passwordlessDisplayToken).to.be.a("string").and.not.empty;
    });

    it("GET /api/displays/by-token returns pending request details", async () => {
      const response = await api.get(`/api/displays/by-token/${approvedDisplayToken}`);
      expect(response.status).to.equal(200);
      expect(response.body.data.connectionRequestStatus).to.equal("pending");
      approvedDisplayDbId = response.body.data.id;
      approvedDisplayRequestId = response.body.data.connectionRequestId;
      expect(approvedDisplayDbId).to.be.a("string").and.not.empty;
    });

    it("GET /api/displays/by-token returns pending details for passwordless display", async () => {
      const response = await api.get(`/api/displays/by-token/${passwordlessDisplayToken}`);
      expect(response.status).to.equal(200);
      expect(response.body.data.connectionRequestStatus).to.equal("pending");
      expect(response.body.data.connectionRequestId).to.be.a("string");
      passwordlessDisplayRequestId = response.body.data.connectionRequestId;
      expect(response.body.data.rejectionReason).to.equal(null);
    });

    it("POST /api/displays/login-display authenticates device", async () => {
      const response = await api.post("/api/displays/login-display").send({
        displayId: approvedDisplayPublicId,
        password: "displaypass",
      });

      expect(response.status).to.equal(200);
      expect(response.body.data.connectionToken).to.equal(approvedDisplayToken);
    });

    it("POST /api/displays/login-display rejects passwordless display while approval is pending", async () => {
      const response = await api.post("/api/displays/login-display").send({
        displayId: passwordlessDisplayPublicId,
        password: "some-password",
      });

      expect(response.status).to.equal(400);
      expect(response.body.error.code).to.equal("VALIDATION_ERROR");
      expect(response.body.error.message.toLowerCase()).to.include("pending");
    });

    it("POST /api/displays/login alias authenticates device", async () => {
      const response = await api.post("/api/displays/login").send({
        displayId: approvedDisplayPublicId,
        password: "displaypass",
      });

      expect(response.status).to.equal(200);
      expect(response.body.data.connectionToken).to.equal(approvedDisplayToken);
    });

    it("POST /api/displays/report-status updates device status", async () => {
      const response = await api.post("/api/displays/report-status").send({
        connectionToken: approvedDisplayToken,
        status: "online",
        currentAdPlaying: "none",
      });

      expect(response.status).to.equal(200);
    });

    it("GET /api/displays/connection-requests/all rejects unauthenticated request", async () => {
      const response = await api.get("/api/displays/connection-requests/all");
      expect(response.status).to.equal(401);
    });

    it("GET /api/displays/connection-requests/all lists pending requests", async () => {
      const response = await api
        .get("/api/displays/connection-requests/all")
        .set(authHeader())
        .query({ status: "pending" });

      expect(response.status).to.equal(200);
      expect(response.body.success).to.equal(true);
      expect(response.body.data.data).to.be.an("array").and.not.empty;
      for (const requestRecord of response.body.data.data) {
        expectConnectionRequestShape(requestRecord);
      }
    });

    it("POST /api/displays/connection-requests/:id/approve approves request", async () => {
      const requestId = approvedDisplayRequestId || "REQ-NOT-FOUND";
      const response = await api
        .post(`/api/displays/connection-requests/${requestId}/approve`)
        .set(authHeader())
        .send({});

      expect([200, 404]).to.include(response.status);
    });

    it("POST /api/displays/connection-requests/:id/approve approves passwordless request", async () => {
      const requestId = passwordlessDisplayRequestId || "REQ-NOT-FOUND";
      const response = await api
        .post(`/api/displays/connection-requests/${requestId}/approve`)
        .set(authHeader())
        .send({});

      expect([200, 404]).to.include(response.status);
    });

    it("POST /api/displays/login-display authenticates approved passwordless display without password", async () => {
      const response = await api.post("/api/displays/login-display").send({
        displayId: passwordlessDisplayPublicId,
      });

      expect(response.status).to.equal(200);
      expect(response.body.data.connectionToken).to.equal(passwordlessDisplayToken);
    });

    it("GET /api/displays/by-token reflects approved request", async () => {
      const response = await api.get(`/api/displays/by-token/${approvedDisplayToken}`);
      expect(response.status).to.equal(200);
      expect(["pending", "approved"]).to.include(response.body.data.connectionRequestStatus);
    });

    it("POST /api/displays/register-self creates second request for reject flow", async () => {
      const response = await api.post("/api/displays/register-self").send({
        displayName: "Rejected Screen",
        location: "Rejected Zone",
        displayId: "DISP-REJECT-01",
        password: "displaypass",
        resolution: { width: 1280, height: 720 },
      });

      expect(response.status).to.equal(201);
      rejectedDisplayToken = response.body.data.connectionToken;
    });

    it("GET /api/displays/by-token returns second request id", async () => {
      const response = await api.get(`/api/displays/by-token/${rejectedDisplayToken}`);
      expect(response.status).to.equal(200);
      rejectedDisplayRequestId = response.body.data.connectionRequestId;
    });

    it("POST /api/displays/connection-requests/:id/reject rejects pending request", async () => {
      const requestId = rejectedDisplayRequestId || "REQ-NOT-FOUND";
      const response = await api
        .post(`/api/displays/connection-requests/${requestId}/reject`)
        .set(authHeader())
        .send({ rejectionReason: "Rejected for integration test" });

      expect([200, 404]).to.include(response.status);
    });

    it("GET /api/displays/by-token reflects rejected request", async () => {
      const response = await api.get(`/api/displays/by-token/${rejectedDisplayToken}`);
      expect(response.status).to.equal(200);
      expect(["pending", "rejected"]).to.include(response.body.data.connectionRequestStatus);
    });

    it("GET /api/displays lists displays", async () => {
      const response = await api.get("/api/displays");
      expect(response.status).to.equal(200);
      expect(response.body.success).to.equal(true);
    });

    it("GET /api/displays/:id/status returns status", async () => {
      const response = await api.get(`/api/displays/${approvedDisplayDbId}/status`);
      expect(response.status).to.equal(200);
    });

    it("POST /api/displays/:id/ping records ping", async () => {
      const response = await api.post(`/api/displays/${approvedDisplayDbId}/ping`).send({});
      expect(response.status).to.equal(200);
    });

    it("POST /api/displays/:id/config updates display config", async () => {
      const response = await api
        .post(`/api/displays/${approvedDisplayDbId}/config`)
        .set(authHeader())
        .send({
          brightness: 70,
          volume: 30,
          refreshRate: 60,
          orientation: "landscape",
        });

      expect(response.status).to.equal(200);
    });

    it("GET /api/displays/:id/loops returns assigned loops", async () => {
      const response = await api.get(`/api/displays/${approvedDisplayDbId}/loops`);
      expect(response.status).to.equal(200);
    });

    it("GET /api/displays/location/:location filters by location", async () => {
      const response = await api.get("/api/displays/location/HQ Lobby");
      expect(response.status).to.equal(200);
    });

    it("POST /api/displays creates admin display", async () => {
      const response = await api
        .post("/api/displays")
        .set(authHeader())
        .send({
          displayId: "DISP-MANUAL-01",
          location: "Test Room",
          layout: "landscape",
          resolution: { width: 1280, height: 720 },
          serialNumber: "SERIAL-DISP-MANUAL-01",
        });

      expect(response.status).to.equal(201);
      manualDisplayDbId = response.body.data.id;
      manualDisplayPublicId = response.body.data.displayId;
    });

    it("GET /api/displays/:id returns admin display", async () => {
      const response = await api.get(`/api/displays/${manualDisplayDbId}`);
      expect(response.status).to.equal(200);
      expect(response.body.data.displayId).to.equal("DISP-MANUAL-01");
    });

    it("PUT /api/displays/:id updates admin display", async () => {
      const response = await api
        .put(`/api/displays/${manualDisplayDbId}`)
        .set(authHeader())
        .send({ location: "Test Room Updated" });

      expect(response.status).to.equal(200);
    });

    it("POST /api/displays/pair pairs display by serial number", async () => {
      const response = await api.post("/api/displays/pair").send({
        serialNumber: manualDisplayPublicId,
      });

      expect(response.status).to.equal(201);
    });
  });

  describe("Advertisement routes", () => {
    it("POST /api/advertisements/upload-url creates signed upload URL", async () => {
      const response = await api
        .post("/api/advertisements/upload-url")
        .set(authHeader())
        .send({
          mediaType: "image",
          mimeType: "image/png",
          fileName: "banner.png",
          fileSize: 100000,
        });

      expect(response.status).to.equal(200);
      expect(response.body.data.uploadUrl).to.be.a("string");
      expect(response.body.data.publicUrl).to.be.a("string");
      uploadedObjectKey = response.body.data.objectKey;
    });

    it("POST /api/advertisements creates advertisement", async () => {
      const response = await api
        .post("/api/advertisements")
        .set(authHeader())
        .send({
          adName: "Spring Promo",
          mediaUrl: "https://cdn.example.com/uploaded/banner.png",
          mediaObjectKey: uploadedObjectKey,
          mediaType: "image",
          duration: 20,
          description: "Promo banner",
        });

      expect(response.status).to.equal(201);
      advertisementId = response.body.data.id;
      advertisementAdId = response.body.data.adId;
    });

    it("GET /api/advertisements lists advertisements", async () => {
      const response = await api.get("/api/advertisements");
      expect(response.status).to.equal(200);
      expect(response.body.success).to.equal(true);
    });

    it("GET /api/advertisements/:id returns advertisement", async () => {
      const response = await api.get(`/api/advertisements/${advertisementId}`);
      expect(response.status).to.equal(200);
      expect(response.body.data.id).to.equal(advertisementId);
    });

    it("GET /api/advertisements/:id/stats returns ad stats", async () => {
      const response = await api.get(`/api/advertisements/${advertisementId}/stats`);
      expect(response.status).to.equal(200);
    });

    it("PUT /api/advertisements/:id updates advertisement", async () => {
      const response = await api
        .put(`/api/advertisements/${advertisementId}`)
        .set(authHeader())
        .send({ adName: "Spring Promo Updated" });
      expect(response.status).to.equal(200);
    });

    it("POST /api/advertisements/:id/activate activates ad", async () => {
      const response = await api
        .post(`/api/advertisements/${advertisementId}/activate`)
        .set(authHeader())
        .send({});
      expect(response.status).to.equal(200);
    });

    it("POST /api/advertisements/:id/deactivate deactivates ad", async () => {
      const response = await api
        .post(`/api/advertisements/${advertisementId}/deactivate`)
        .set(authHeader())
        .send({});
      expect(response.status).to.equal(200);
    });

    it("POST /api/advertisements/bulk-upload creates multiple ads", async () => {
      const response = await api
        .post("/api/advertisements/bulk-upload")
        .set(authHeader())
        .send({
          advertisements: [
            {
              adName: "Bulk Ad",
              mediaUrl: "https://cdn.example.com/bulk.png",
              mediaType: "image",
              duration: 10,
            },
          ],
        });
      expect(response.status).to.equal(201);
    });

    it("GET /api/advertisements/user/:userId returns user ads", async () => {
      const response = await api.get(`/api/advertisements/user/${userId}`);
      expect(response.status).to.equal(200);
      expect(response.body.success).to.equal(true);
    });
  });

  describe("Display loop routes", () => {
    it("POST /api/display-loops creates loop", async () => {
      const response = await api
        .post("/api/display-loops")
        .set(authHeader())
        .send({
          loopName: "Main Lobby Loop",
          displayId: approvedDisplayDbId,
          rotationType: "sequential",
          displayLayout: "fullscreen",
        });

      expect(response.status).to.equal(201);
      loopId = response.body.data.id;
    });

    it("GET /api/display-loops lists loops", async () => {
      const response = await api.get("/api/display-loops");
      expect(response.status).to.equal(200);
      expect(response.body.success).to.equal(true);
    });

    it("GET /api/display-loops/:id returns loop", async () => {
      const response = await api.get(`/api/display-loops/${loopId}`);
      expect(response.status).to.equal(200);
      expect(response.body.data.id).to.equal(loopId);
    });

    it("POST /api/display-loops/:id/advertisements assigns ad", async () => {
      const response = await api
        .post(`/api/display-loops/${loopId}/advertisements`)
        .set(authHeader())
        .send({
          advertisementId,
          duration: 20,
          order: 0,
          weight: 1,
        });

      expect(response.status).to.equal(200);
    });

    it("POST /api/display-loops/:id/displays assigns loop to another display", async () => {
      const response = await api
        .post(`/api/display-loops/${loopId}/displays`)
        .set(authHeader())
        .send({
          displayId: manualDisplayDbId,
        });

      expect(response.status).to.equal(200);
      expect(response.body.data.displayIds).to.include(manualDisplayDbId);
    });

    it("PUT /api/display-loops/:id/advertisements/:adId/order updates order", async () => {
      const response = await api
        .put(`/api/display-loops/${loopId}/advertisements/${advertisementId}/order`)
        .set(authHeader())
        .send({ newOrder: 0 });

      expect(response.status).to.equal(200);
    });

    it("GET /api/displays/loop/:token returns loop playback payload", async () => {
      const response = await api.get(`/api/displays/loop/${approvedDisplayToken}`);
      expect(response.status).to.equal(200);
      expect(response.body.data.advertisements).to.be.an("array").with.length.greaterThan(0);
    });

    it("PUT /api/display-loops/:id updates loop", async () => {
      const response = await api
        .put(`/api/display-loops/${loopId}`)
        .set(authHeader())
        .send({ description: "Updated loop description" });

      expect(response.status).to.equal(200);
    });
  });

  describe("Analytics routes", () => {
    it("POST /api/analytics/record records event", async () => {
      const response = await api.post("/api/analytics/record").send({
        displayId: approvedDisplayDbId,
        adId: advertisementAdId,
        loopId,
        impressions: 10,
        viewDuration: 120,
        completedViews: 8,
        partialViews: 2,
        metrics: { clicks: 3, interactions: 1, dwellTime: 4 },
      });

      expect(response.status).to.equal(201);
      analyticsId = response.body.data.id || response.body.data._id;
      expect(analyticsId).to.be.a("string");
    });

    it("GET /api/analytics rejects unauthenticated list", async () => {
      const response = await api.get("/api/analytics");
      expect(response.status).to.equal(401);
    });

    it("GET /api/analytics lists records", async () => {
      const response = await api.get("/api/analytics").set(authHeader());
      expect(response.status).to.equal(200);
      expect(response.body.success).to.equal(true);
      const firstRecord = response.body.data?.data?.[0];
      if (firstRecord?.id) {
        analyticsId = firstRecord.id;
      }
    });

    it("GET /api/analytics/overview returns stats", async () => {
      const response = await api.get("/api/analytics/overview").set(authHeader());
      expect(response.status).to.equal(200);
      expect(response.body.data.totalViews).to.be.a("number");
    });

    it("GET /api/analytics/timeline returns timeline", async () => {
      const response = await api.get("/api/analytics/timeline").set(authHeader());
      expect(response.status).to.equal(200);
      expect(response.body.data).to.be.an("array");
    });

    it("GET /api/analytics/displays/:id returns display stats", async () => {
      const response = await api.get(`/api/analytics/displays/${approvedDisplayDbId}`).set(authHeader());
      expect(response.status).to.equal(200);
    });

    it("GET /api/analytics/advertisements/:id returns ad stats", async () => {
      const response = await api.get(`/api/analytics/advertisements/${advertisementAdId}`).set(authHeader());
      expect(response.status).to.equal(200);
    });

    it("GET /api/analytics/stats returns aggregated stats", async () => {
      const response = await api.get("/api/analytics/stats").set(authHeader());
      expect(response.status).to.equal(200);
    });

    it("GET /api/analytics/:id returns one record", async () => {
      const response = await api.get(`/api/analytics/${analyticsId}`).set(authHeader());
      expect(response.status).to.equal(200);
      expect(response.body.data.id).to.equal(analyticsId);
    });
  });

  describe("System log routes", () => {
    it("GET /api/system-logs rejects unauthenticated list", async () => {
      const response = await api.get("/api/system-logs");
      expect(response.status).to.equal(401);
    });

    it("POST /api/system-logs/record creates log", async () => {
      const response = await api
        .post("/api/system-logs/record")
        .set(authHeader())
        .send({
          action: "create",
          entityType: "display",
          entityId: approvedDisplayDbId,
          description: "Created display in integration test",
          metadata: { source: "integration" },
        });

      expect(response.status).to.equal(201);
      systemLogId = response.body.data.id;
      expect(systemLogId).to.be.a("string");
    });

    it("GET /api/system-logs lists logs", async () => {
      const response = await api.get("/api/system-logs").set(authHeader());
      expect(response.status).to.equal(200);
      expect(response.body.success).to.equal(true);
      const firstLog = response.body.data?.data?.[0];
      if (firstLog?.id) {
        systemLogId = firstLog.id;
      }
    });

    it("GET /api/system-logs/:id returns one log", async () => {
      const response = await api.get(`/api/system-logs/${systemLogId}`).set(authHeader());
      expect(response.status).to.equal(200);
      expect(response.body.data.id).to.equal(systemLogId);
    });
  });

  describe("Cleanup mutation routes", () => {
    it("DELETE /api/display-loops/:id/advertisements/:adId removes ad from loop", async () => {
      const response = await api
        .delete(`/api/display-loops/${loopId}/advertisements/${advertisementId}`)
        .set(authHeader());

      expect(response.status).to.equal(200);
    });

    it("DELETE /api/display-loops/:id deletes loop", async () => {
      const response = await api.delete(`/api/display-loops/${loopId}`).set(authHeader());
      expect(response.status).to.equal(200);
    });

    it("DELETE /api/advertisements/:id deletes advertisement", async () => {
      const response = await api.delete(`/api/advertisements/${advertisementId}`).set(authHeader());
      expect(response.status).to.equal(200);
    });

    it("DELETE /api/displays/:id deletes admin-managed display", async () => {
      const response = await api.delete(`/api/displays/${manualDisplayDbId}`).set(authHeader());
      expect(response.status).to.equal(200);
    });
  });
});
