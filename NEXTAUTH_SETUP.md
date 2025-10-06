# Environment Variables for NextAuth Setup

## Required Environment Variables

Create a `.env.local` file in your project root with the following variables:

```env
# NextAuth Configuration
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret-key-here

# Database URL (for Prisma)
DATABASE_URL="postgresql://username:password@localhost:5432/business_suite_db"

# GitHub OAuth (optional)
GITHUB_ID=your-github-client-id
GITHUB_SECRET=your-github-client-secret
```

## How to Set Up Each Variable

### 1. NEXTAUTH_URL
- Development: `http://localhost:3000`
- Production: Your actual domain (e.g., `https://yourdomain.com`)

### 2. NEXTAUTH_SECRET
Generate a secure secret key:
```bash
openssl rand -base64 32
```
Or use an online generator

### 3. DATABASE_URL
Set up your PostgreSQL database and update the connection string with:
- `username`: Your database username
- `password`: Your database password
- `localhost:5432`: Your database host and port
- `business_suite_db`: Your database name

### 4. GitHub OAuth (Optional)
If you want to enable GitHub login:
1. Go to GitHub Settings > Developer settings > OAuth Apps
2. Create a new OAuth App
3. Set Authorization callback URL to: `http://localhost:3000/api/auth/callback/github`
4. Copy the Client ID and Client Secret

## Additional Setup Steps

### 1. Update Prisma Schema for NextAuth
Your schema already includes the User model. You may need to add NextAuth-specific tables:

```prisma
model Account {
  id                String  @id @default(cuid())
  userId            String
  type              String
  provider          String
  providerAccountId String
  refresh_token     String? @db.Text
  access_token      String? @db.Text
  expires_at        Int?
  token_type        String?
  scope             String?
  id_token          String? @db.Text
  session_state     String?

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@unique([provider, providerAccountId])
}

model Session {
  id           String   @id @default(cuid())
  sessionToken String   @unique
  userId       String
  expires      DateTime
  user         User     @relation(fields: [userId], references: [id], onDelete: Cascade)
}

model VerificationToken {
  identifier String
  token      String   @unique
  expires    DateTime

  @@unique([identifier, token])
}
```

Add these relations to your User model:
```prisma
model User {
  // ... existing fields
  accounts Account[]
  sessions Session[]
}
```

### 2. Run Database Migrations
```bash
npx prisma db push
# or
npx prisma migrate dev --name add-nextauth-tables
```

### 3. Create Auth Pages
You'll need to create sign-in and sign-up pages at:
- `app/auth/signin/page.tsx`
- `app/auth/signup/page.tsx`

## Testing Your Setup

1. Start your development server: `npm run dev`
2. Visit `http://localhost:3000/api/auth/signin` to test authentication
3. Check that protected routes redirect to sign-in when not authenticated

## Security Notes

- Never commit `.env.local` to version control
- Use strong, unique secrets for production
- Consider using environment-specific configurations
- Regularly rotate your secrets and tokens