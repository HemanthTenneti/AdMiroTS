# Contract Conformance Matrix

This matrix tracks backend API wire-shapes against frontend parsers.

## Auth
| Endpoint | Request Contract | Response Contract | Frontend Parser |
|---|---|---|---|
| `POST /api/auth/login` | `usernameOrEmail`, `password` | `{ success, data: { user, accessToken } }` | `authApi.login` schemas |
| `POST /api/auth/google` | `{ token }` | `{ success, data: { user, accessToken, isNewUser } }` | `authApi.google` schemas |

## Display Device Lifecycle
| Endpoint | Request Contract | Response Contract | Frontend Parser |
|---|---|---|---|
| `POST /api/displays/register-self` | `displayName`, `location`, optional `displayId/password`, `resolution` | `{ success, data: { displayId, connectionToken, status, isPendingApproval } }` | `RegisterSelfResponseSchema` |
| `GET /api/displays/by-token/:token` | path `token` | `{ success, data: display + connectionRequestStatus + connectionRequestId + rejectionReason }` | `ByTokenResponseSchema` |
| `POST /api/displays/login-display` | `displayId`, `password` | `{ success, data: { displayId, displayName, location, connectionToken, resolution, status } }` | `DisplayLoginResponseSchema` |
| `POST /api/displays/report-status` | `connectionToken`, optional status/ad | `{ success, data: { message } }` | mutation envelope |
| `GET /api/displays/loop/:token` | path `token` | `{ success, data: { loop, advertisements[] } }` | `DisplayLoopResponseSchema` |

## Connection Requests
| Endpoint | Request Contract | Response Contract | Frontend Parser |
|---|---|---|---|
| `GET /api/displays/connection-requests/all` | query: `page`, `limit`, optional `status` | `{ success, data: { data: request[], pagination } }` | `ConnectionRequestListResponseSchema` |
| `POST /api/displays/connection-requests/:id/approve` | none | `{ success, data: { request, display } }` | mutation envelope |
| `POST /api/displays/connection-requests/:id/reject` | optional `rejectionReason` | `{ success, data: request }` | mutation envelope |

## Advertisement Upload/Create
| Endpoint | Request Contract | Response Contract | Frontend Parser |
|---|---|---|---|
| `POST /api/advertisements/upload-url` | `mediaType`, `mimeType`, `fileName`, `fileSize` | `{ success, data: { objectKey, uploadUrl, publicUrl, expiresIn } }` | `createUploadUrl` schema |
| `POST /api/advertisements` | ad payload with resolved `mediaUrl`; optional `mediaObjectKey` | `{ success, data: advertisement }` | `create` schema |

## Notes
- Passwordless displays must use connection token login flow.
- `/connection-requests/all` may return synthetic pending rows; frontend parser normalizes optional/nullable fields.
- Frontend contract smoke checks: `npm run test:frontend-contracts`.
