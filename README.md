# SoftAuth

A modern React application with server-side rendering (Next.js) for user authentication and TOTP management. The app allows users to login and manage TOTP codes with QR code generation.

## Features

- 🔐 Secure authentication with encrypted password storage
- 🔑 TOTP (Time-based One-Time Password) management
- 📱 QR code generation for TOTP setup
- 🐳 Docker containerization
- ☁️ AWS Serverless deployment ready

## Quick Start

### Development

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Configure admin credentials:**
   ```bash
   # Update config.yaml with custom credentials
   ADMIN_USER=myuser ADMIN_PASSWORD=mypass ADMIN_SALT=mysalt npm run update:config
   ```

3. **Start development server:**
   ```bash
   npm run dev
   ```

### Docker Deployment

**Build with default credentials:**
```bash
docker build -t softauth .
```

**Build with custom credentials:**
```bash
docker build \
  --build-arg ADMIN_USER=myuser \
  --build-arg ADMIN_PASSWORD=mypass \
  --build-arg ADMIN_SALT=mysalt \
  -t softauth .
```

**Run the container:**
```bash
docker run -p 3000:3000 softauth
```

### Configuration

The application uses `config.yaml` for admin credentials:

```yaml
admin:
  username: admin
  salt: mysalt
  password: <hashed_password>
```

**Generate password hash manually:**
```bash
npm run gen:hash
```

**Update config with environment variables:**
```bash
ADMIN_USER=myuser ADMIN_PASSWORD=mypass ADMIN_SALT=mysalt npm run update:config
```

## AWS Serverless Deployment

See `ARCHITECTURE.md` for detailed CloudFormation templates and serverless deployment instructions.

## Project Structure

```
/softauth
├── pages/             # Next.js pages (SSR)
├── pages/api/         # API routes for authentication
├── components/        # React components
├── lib/               # Helper functions
├── config.yaml        # Admin credentials configuration
├── Dockerfile         # Container configuration
└── ARCHITECTURE.md    # Deployment architecture
```

## Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run gen:hash` - Generate password hash
- `npm run update:config` - Update config.yaml with environment variables

## Security Notes

- Passwords are hashed using PBKDF2 with SHA512
- Salt is configurable for enhanced security
- In production, use Docker secrets or AWS Parameter Store for sensitive data
