# ClaimsSense Deployment Guide

## Quick Start

### Prerequisites
- Node.js 18+ and npm
- Rust 1.70+
- Git

### Installation Steps

1. **Clone and setup**
   ```bash
   git clone <repository-url>
   cd claimsense
   npm install
   ```

2. **Install Tauri CLI**
   ```bash
   npm install -g @tauri-apps/cli
   ```

3. **Build Rust dependencies**
   ```bash
   cd src-tauri
   cargo build
   cd ..
   ```

4. **Start development server**
   ```bash
   npm run tauri:dev
   ```

5. **Load demo data (optional)**
   ```bash
   npm run demo:load
   ```

## Production Build

### Windows (.msi installer)
```bash
npm run tauri:build
# Output: src-tauri/target/release/bundle/msi/ClaimsSense_1.0.0_x64_en-US.msi
```

### macOS (.dmg installer)
```bash
npm run tauri:build
# Output: src-tauri/target/release/bundle/dmg/ClaimsSense_1.0.0_x64.dmg
```

## Testing

### Unit Tests
```bash
npm test
```

### E2E Tests
```bash
npm run test:e2e
```

## Default Login Credentials

After loading demo data:
- **Admin**: username: `admin`, password: `admin123`
- **Coder**: username: `coder1`, password: `coder123`
- **Auditor**: username: `auditor1`, password: `auditor123`
- **Manager**: username: `manager1`, password: `manager123`

## Features Overview

### Core Workflow
1. **Upload**: Drag & drop PDF/image files
2. **Processing**: Automatic OCR and field extraction
3. **Validation**: Rules engine checks for errors
4. **Queues**: Claims routed to Critical Errors, Warnings, or Approved
5. **Review**: Staff review and fix issues
6. **Analytics**: Performance metrics and reporting

### Security Features
- HIPAA mode for local-only processing
- AES-256 encryption for sensitive data
- Role-based access control
- Audit logging
- Secure API key management

### Integration Options
- Local Tesseract OCR (default)
- Cloud OCR providers (Google, Azure)
- LLM providers (OpenAI, Anthropic)
- Configurable rules engine

## Troubleshooting

### Common Issues

1. **Tauri CLI not found**
   ```bash
   npm install -g @tauri-apps/cli
   ```

2. **Rust compilation errors**
   ```bash
   rustup update
   cd src-tauri && cargo clean && cargo build
   ```

3. **Node modules issues**
   ```bash
   rm -rf node_modules package-lock.json
   npm install
   ```

4. **Database connection issues**
   - Check file permissions
   - Ensure SQLite is available
   - Verify encryption key is set

### Performance Optimization

1. **Enable HIPAA mode** for local processing
2. **Use SSD storage** for database files
3. **Allocate sufficient RAM** (8GB+ recommended)
4. **Close unnecessary applications** during processing

## Support

For issues and questions:
1. Check the README.md for detailed documentation
2. Review the GitHub Issues page
3. Contact the development team

## License

MIT License - see LICENSE file for details

