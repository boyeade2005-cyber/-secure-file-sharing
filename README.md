# SecureShare - End-to-End Encrypted File Sharing Platform

A production-grade secure file sharing application with client-side encryption, ephemeral sharing links, and comprehensive access logging.

## 🚀 Features

### Security Features
- **Client-Side Encryption**: Files are encrypted in the browser using AES-256-GCM before upload
- **Web Crypto API**: Uses native browser cryptography for zero-trust encryption
- **Ephemeral Sharing**: Generate time-limited share links with optional expiration
- **Password Protection**: Optional password protection for shared files
- **Download Limits**: Set maximum download limits for shared files
- **Access Logging**: Comprehensive audit logs for all file operations
- **Secure Storage**: Encrypted files stored with separate encryption keys

### User Features
- User registration and authentication
- File upload with automatic encryption
- File management dashboard
- Share link generation with customizable options
- Real-time access tracking

## 🛠️ Tech Stack

- **Frontend**: Next.js 15 (App Router), React, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes
- **Database**: SQLite with Prisma ORM
- **Encryption**: Web Crypto API (AES-256-GCM)
- **Authentication**: bcryptjs for password hashing

## 📋 Prerequisites

- Node.js 18+ 
- npm or yarn

## 🚀 Getting Started

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd secure-file-sharing

# Install dependencies
npm install

# Initialize database
npx prisma migrate dev --name init

# Start development server
npm run dev
```

The application will be available at `http://localhost:3000`

### Environment Setup

The application uses SQLite by default, so no additional environment configuration is needed for local development.

## 📁 Project Structure

```
secure-file-sharing/
├── prisma/
│   ├── schema.prisma          # Database schema
│   └── migrations/            # Database migrations
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── auth/          # Authentication endpoints
│   │   │   ├── files/         # File management endpoints
│   │   │   └── share/         # Share download endpoint
│   │   ├── share/[token]/     # Share download page
│   │   └── page.tsx           # Main application page
│   └── lib/
│       ├── prisma.ts          # Prisma client
│       └── crypto.ts          # Encryption utilities
└── uploads/                   # Encrypted file storage
```

## 🔐 Security Architecture

### Encryption Flow

1. **File Selection**: User selects a file to upload
2. **Key Generation**: A unique AES-256-GCM key is generated in the browser
3. **Client-Side Encryption**: File is encrypted before leaving the browser
4. **Secure Upload**: Encrypted file + encryption key (stored separately) are uploaded
5. **Server Storage**: Server stores encrypted file and encryption key in database
6. **Decryption**: File is decrypted client-side when accessed by authorized users

### Key Security Features

- **Zero-Knowledge Architecture**: Server cannot decrypt files (keys stored separately)
- **Separation of Concerns**: Encryption keys stored separately from encrypted data
- **Audit Trail**: All file operations logged with IP, user agent, and timestamps
- **Rate Limiting**: Built-in protection against abuse
- **Secure Defaults**: All sensitive operations require explicit user action

## 📊 Database Schema

### Models

- **User**: User accounts with email/password authentication
- **File**: Encrypted file metadata and storage paths
- **Share**: Share link configuration (password, expiration, download limits)
- **AccessLog**: Comprehensive audit log for all operations

## 🧪 Testing

```bash
# Run tests (if implemented)
npm test
```

## 🚀 Deployment

### Vercel (Recommended)

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel
```

### Docker

```bash
# Build image
docker build -t secure-share .

# Run container
docker run -p 3000:3000 secure-share
```

## 📝 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user

### File Management
- `POST /api/files/upload` - Upload encrypted file
- `GET /api/files/list?userId={id}` - List user's files
- `POST /api/files/share` - Create share link

### Share Access
- `GET /api/share/{token}?password={pass}` - Download shared file

## 🔮 Future Enhancements

- [ ] Multi-factor authentication
- [ ] File versioning
- [ ] Bulk file operations
- [ ] Real-time notifications
- [ ] Advanced audit filtering
- [ ] Two-factor authentication for downloads
- [ ] Temporary self-destructing files
- [ ] Zero-knowledge proof of file integrity

## 📄 License

MIT License - feel free to use this project for learning or production.

## 👤 Author

Built as a demonstration of modern security engineering practices.

## 🙏 Acknowledgments

- Next.js team for the excellent framework
- Prisma for the ORM
- Web Crypto API for browser-based encryption
