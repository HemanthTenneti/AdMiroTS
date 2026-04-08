# Code Improvement Roadmap (8.5 → 9.5/10)

## Priority 1: Fix Type Leakage (30 min) 🟥 CRITICAL

### Current Problem
```typescript
// In BaseRepository.ts
export abstract class BaseRepository<T> {
  constructor(protected model: any) {}  // ← Loses type info
  
  async findOne(filter: Record<string, any>): Promise<T | null> {
    //                           ↑ Any type here loses safety
    return this.model.findOne(filter);
  }
}
```

### Fixed Version
```typescript
import { Model, Document, UpdateQuery } from 'mongoose';

export abstract class BaseRepository<T> {
  constructor(protected model: Model<T>) {}  // ← Properly typed
  
  async findOne(filter: Partial<T>): Promise<T | null> {
    //                      ↑ Now type-safe
    return this.model.findOne(filter as any);
  }
  
  async updateById(id: string, data: UpdateQuery<T>): Promise<T | null> {
    //                                 ↑ Mongoose type
    return this.model.findByIdAndUpdate(id, data, { new: true });
  }
}
```

**Impact:** Full type safety across all repositories ✅

---

## Priority 2: Add Zod Validation (1 hour) 🟥 CRITICAL

### Current Problem
```typescript
// In auth.controller.ts
async register(req: Request, res: Response): Promise<void> {
  const { email, password, username, role } = req.body;
  
  // Manual validation scattered everywhere
  if (!email || !password) {
    res.status(400).json({ error: "Email and password are required" });
    return;
  }
  
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    res.status(400).json({ error: "Invalid email format" });
    return;
  }
  
  if (password.length < 6) {
    res.status(400).json({ error: "Password must be at least 6 characters" });
    return;
  }
  // ... more validation
}
```

### Fixed Version

#### 1. Create validation schemas
```typescript
// utils/validators/auth.schema.ts
import { z } from 'zod';

export const registerSchema = z.object({
  email: z.string().email('Invalid email format').max(255),
  password: z.string().min(6, 'Password must be at least 6 characters').max(128),
  username: z.string().min(3).max(50).optional(),
  role: z.enum(['ADMIN', 'ADVERTISER']).optional(),
});

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(6),
  newPassword: z.string().min(6),
});
```

#### 2. Use in controllers
```typescript
// In auth.controller.ts
async register(req: Request, res: Response): Promise<void> {
  try {
    // Single line validation - no manual checks needed
    const validData = await registerSchema.parseAsync(req.body);
    
    const { user, token } = await this.authService.register(
      validData.email,
      validData.password,
      validData.username,
      validData.role
    );
    
    res.status(201).sendSuccess({ user: user.toSafeObject(), token });
  } catch (error) {
    if (error instanceof z.ZodError) {
      const details = error.errors.map(e => ({
        field: e.path.join('.'),
        code: e.code,
        message: e.message,
      }));
      res.status(400).json({ error: 'Validation failed', details });
      return;
    }
    // ... handle other errors
  }
}
```

**Impact:** Consistent validation, better error messages, DRY code ✅

---

## Priority 3: Custom Error Classes (45 min) 🟥 CRITICAL

### Current Problem
```typescript
// Scattered throw statements
throw new Error("User with this email already exists");
throw new Error("Invalid email or password");
throw new Error("Token has expired");
throw new Error("User not found");
throw new Error("Current password is incorrect");

// Catching by string matching 😱
if (error instanceof Error) {
  if (error.message.includes("already exists")) {
    res.status(409).json({ error: error.message });
  }
}
```

### Fixed Version

#### 1. Create error hierarchy
```typescript
// utils/errors/index.ts
import { AppError } from './AppError';

export class ValidationError extends AppError {
  constructor(message: string, details?: Record<string, string>) {
    super(message, 400, 'VALIDATION_ERROR', details);
  }
}

export class ConflictError extends AppError {
  constructor(message: string, details?: Record<string, string>) {
    super(message, 409, 'CONFLICT', details);
  }
}

export class UnauthorizedError extends AppError {
  constructor(message: string) {
    super(message, 401, 'UNAUTHORIZED');
  }
}

export class NotFoundError extends AppError {
  constructor(message: string) {
    super(message, 404, 'NOT_FOUND');
  }
}

export class ForbiddenError extends AppError {
  constructor(message: string) {
    super(message, 403, 'FORBIDDEN');
  }
}
```

#### 2. Use in services
```typescript
// In auth.service.ts
async register(email, password, username, role): Promise<{ user, token }> {
  const existingUser = await this.userRepository.findByEmail(email);
  if (existingUser) {
    throw new ConflictError("User with this email already exists");
  }
  
  if (!User.isValidEmail(email)) {
    throw new ValidationError("Invalid email format", { field: 'email' });
  }
  
  // ... rest of logic
}

async login(email, password): Promise<{ user, token }> {
  const user = await this.userRepository.findByEmail(email);
  
  if (!user) {
    throw new UnauthorizedError("Invalid email or password");
  }
  
  if (!user.isActive) {
    throw new ForbiddenError("User account is inactive");
  }
  
  // ... rest of logic
}
```

#### 3. Handle in error middleware
```typescript
// In middleware/error-handler.ts
export function errorHandler(
  error: Error,
  req: Request,
  res: Response,
  next: NextFunction
): void {
  if (error instanceof AppError) {
    const response: ErrorResponse = {
      success: false,
      error: {
        code: error.code,
        message: error.message,
        details: error.details,
      },
    };
    res.status(error.statusCode).json(response);
    return;
  }

  // Unknown errors
  res.status(500).json({
    success: false,
    error: {
      code: 'INTERNAL_ERROR',
      message: process.env.NODE_ENV === 'production' 
        ? 'An unexpected error occurred'
        : error.message,
    },
  });
}
```

**Impact:** Type-safe error handling, consistent HTTP codes, better debugging ✅

---

## Bonus: Ensure Repositories Return Entities (45 min) 🟨 IMPORTANT

### Current Problem
```typescript
// UserRepository.findById might return raw Mongoose document
async findById(id: string): Promise<User | null> {
  return this.model.findById(id);  // ← Returns IUserDocument, not User instance
}

// User methods like updateLastLogin() won't work!
const user = await userRepository.findById('123');
user.updateLastLogin();  // ❌ TypeError: updateLastLogin is not a function
```

### Fixed Version
```typescript
async findById(id: string): Promise<User | null> {
  const doc = await this.model.findById(id);
  if (!doc) return null;
  return new User(doc.toObject() as IUser);  // ← Always return entity instance
}

async findOne(filter: Partial<T>): Promise<User | null> {
  const doc = await this.model.findOne(filter);
  if (!doc) return null;
  return new User(doc.toObject() as IUser);
}

// Now this works:
const user = await userRepository.findById('123');
user.updateLastLogin();  // ✅ Works correctly
```

**Impact:** Domain logic works everywhere, no weird type mismatches ✅

---

## Implementation Order

```
Day 1:
  [ ] Fix BaseRepository typing (30 min)
  [ ] Create Zod schemas (30 min)
  [ ] Use schemas in auth controller (30 min)

Day 2:
  [ ] Create custom error classes (45 min)
  [ ] Use in auth service (15 min)
  [ ] Update error handler (15 min)

Day 3:
  [ ] Ensure repos return entities (45 min)
  [ ] Test all changes (1 hour)
  [ ] Write quick integration test (1 hour)
```

**Total Time: ~4 hours**  
**Result: 8.5 → 9.5/10** ✅

---

## Testing Your Improvements

### Test 1: Type Safety
```bash
npx tsc --noEmit  # Should have zero errors
```

### Test 2: Validation
```bash
curl -X POST http://localhost:8000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email": "invalid", "password": "123"}'
# Should return 400 with validation details
```

### Test 3: Error Handling
```bash
curl -X POST http://localhost:8000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "test@test.com", "password": "wrong"}'
# Should return 401 with code: "UNAUTHORIZED"
```

---

## Before & After Comparison

| Aspect | Before | After |
|--------|--------|-------|
| **Type Safety** | 8/10 | 9.5/10 |
| **Validation** | Manual, scattered | Centralized with Zod |
| **Error Handling** | String matching 😱 | Type-safe error classes ✅ |
| **Code Duplication** | High (validation repeated) | Low (single schema) |
| **Maintainability** | Decent | Excellent |
| **Overall Score** | 8.5/10 | 9.5/10 |

---

## Questions?

For detailed explanation of each fix, see `COLLEGE_PROJECT_AUDIT.md`
