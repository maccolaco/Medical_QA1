# ClaimsSense - Medical Claims QA Desktop Application

A production-ready native desktop application for Windows and macOS that provides secure, offline-capable medical claims quality assurance for billing teams.

## Features

- **Cross-platform**: Native desktop app built with Tauri (Rust backend + React frontend)
- **Secure & HIPAA-compliant**: Local processing with optional cloud integrations
- **OCR Processing**: Tesseract integration for scanned documents
- **Rules Engine**: Configurable validation rules for claim processing
- **Queue Management**: Critical Errors, Warnings, and Approved Claims queues
- **Analytics Dashboard**: Performance metrics and reporting
- **User Management**: Role-based access control
- **Encrypted Storage**: AES-256 encryption for sensitive data

## Architecture

- **Frontend**: React + TypeScript + Vite + TailwindCSS
- **Backend**: Rust with Tauri
- **Database**: SQLite with encryption
- **OCR**: Tesseract (local) with optional cloud providers
- **State Management**: Zustand
- **Charts**: Recharts

## Prerequisites

- Node.js 18+ and npm
- Rust 1.70+
- Tauri CLI
- Tesseract OCR (optional, for local OCR processing)

## Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd claimsense
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Install Tauri CLI**
   ```bash
   npm install -g @tauri-apps/cli
   ```

4. **Install Rust dependencies**
   ```bash
   cd src-tauri
   cargo build
   cd ..
   ```

## Development

1. **Start the development server**
   ```bash
   npm run tauri:dev
   ```

2. **Build for production**
   ```bash
   npm run tauri:build
   ```

## Project Structure

```
claimsense/
├── src/                    # React frontend
│   ├── components/         # Reusable UI components
│   ├── pages/             # Page components
│   ├── stores/            # Zustand state management
│   └── types/             # TypeScript type definitions
├── src-tauri/             # Rust backend
│   ├── src/
│   │   ├── commands.rs    # Tauri IPC commands
│   │   ├── database.rs    # Database operations
│   │   ├── encryption.rs  # Encryption utilities
│   │   ├── ocr.rs         # OCR processing
│   │   ├── parser.rs      # Claim parsing
│   │   ├── rules.rs       # Rules engine
│   │   └── types.rs       # Rust type definitions
│   └── Cargo.toml         # Rust dependencies
├── package.json           # Node.js dependencies
└── README.md
```

## Key Components

### Frontend Pages
- **LoginPage**: User authentication and HIPAA mode selection
- **UploadPage**: File upload with drag & drop support
- **QueuesPage**: Manage claims in different queues
- **ClaimReviewPage**: Review and edit individual claims
- **AnalyticsPage**: Performance metrics and charts
- **SettingsPage**: Application configuration
- **UsersPage**: User management

### Backend Modules
- **Database**: SQLite operations with encryption
- **OCR**: Tesseract integration for document processing
- **Parser**: Extract structured data from documents
- **Rules Engine**: Configurable validation rules
- **Encryption**: AES-256 encryption for sensitive data

## Configuration

### HIPAA Mode
When enabled, HIPAA mode ensures:
- All processing happens locally
- No data is sent to external services
- Encryption is enforced for all stored data

### OCR Providers
- **Tesseract**: Local OCR processing (default)
- **Google Cloud Vision**: Cloud-based OCR (requires API key)
- **Azure Computer Vision**: Cloud-based OCR (requires API key)

### Rules Engine
Configure validation rules in JSON format:
```json
{
  "rules": [
    {
      "id": "missing_cpt_codes",
      "name": "Missing CPT Codes",
      "severity": "Critical",
      "condition": "cpt_codes.length === 0"
    }
  ]
}
```

## Security Considerations

- **Data Encryption**: All sensitive data encrypted at rest
- **Local Processing**: Default to local-only processing
- **Audit Logging**: Track all user actions
- **Role-based Access**: Granular permissions system
- **API Key Management**: Secure storage of cloud service keys

## Building Installers

### Windows
```bash
npm run tauri:build
# Creates .msi installer in src-tauri/target/release/bundle/msi/
```

### macOS
```bash
npm run tauri:build
# Creates .dmg installer in src-tauri/target/release/bundle/dmg/
```

## Testing

```bash
# Unit tests
npm test

# E2E tests
npm run test:e2e
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Submit a pull request

## License

MIT License - see LICENSE file for details

## Support

For support and questions, please open an issue in the repository.

## HIPAA Compliance Checklist

- [x] Local data processing by default
- [x] Encryption at rest (AES-256)
- [x] Audit logging
- [x] Role-based access control
- [x] Secure API key management
- [x] Business Associate Agreement warnings
- [x] Data export capabilities
- [x] Secure deletion options

## Roadmap

- [ ] Plugin marketplace for payer connectors
- [ ] LAN-based team collaboration
- [ ] Advanced ML-powered suggestions
- [ ] Real-time payer API integration
- [ ] Mobile companion app

