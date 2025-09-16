# Js-Package-Veridion

A comprehensive JavaScript/TypeScript ecosystem for KYC (Know Your Customer) verification, identity management, and blockchain integration. This monorepo contains multiple packages and demo applications showcasing modern identity verification workflows with Stellar blockchain integration.

## 🏗️ Project Structure

```
js-package-veridion/
├── packages/
│   ├── kyc-client/           # Core KYC client library
│   └── stellar-passport/     # Stellar smart contract bindings
├── kyc-demo2/               # Next.js demo with KYC + Passkey + Stellar
├── kyc-test-page/           # Full-featured KYC test application
└── README.md               # This file
```

## 📦 Packages

### @oppia/kyc-client (YES, our own KYC!)

A framework-agnostic TypeScript library for integrating KYC verification with Edge applications.

**Key Features:**
- 🚀 **Frontend-only**: No backend required, works with any web framework
- 🔒 **Secure**: Origin filtering for postMessage communication
- 🎯 **Dual UI modes**: Popup windows or iframe modals
- 🏃‍♂️ **Hackathon mode**: Insecure no-session mode for quick demos
- 📱 **Framework agnostic**: Works with React, Next.js, Vue, or vanilla JavaScript
- 🎨 **Customizable**: Theme and locale support
- 🔄 **Real-time status**: Status change callbacks and token management

**Installation:**
```bash
npm install @oppia/kyc-client
```

**Quick Start:**
```typescript
import kyc from '@oppia/kyc-client';

// Initialize the client
kyc.init({
  edgeUrl: 'http://localhost:4000',
  clientId: 'my-app',
  insecureNoSession: true, // hackathon mode
  onStatusChange: (status) => console.log('KYC status:', status),
});

// Start verification in popup
const result = await kyc.startKyc({ openMode: 'popup' });
if (result.ok && result.status === 'verified') {
  console.log('✅ Verified! Token:', result.token);
}
```

### stellar-passport

JavaScript library for interacting with Soroban smart contract `stellar-passport` via Soroban RPC. This library provides TypeScript bindings for Stellar blockchain operations.

**Features:**
- 🔗 **Smart Contract Integration**: Direct interaction with Stellar smart contracts
- 📝 **TypeScript Support**: Full type safety and IntelliSense
- 🌐 **Multi-network Support**: Works with testnet and mainnet
- 🔄 **Auto-generated**: Generated from smart contract source code

## 🚀 Demo Applications

### kyc-demo2

A modern Next.js application demonstrating the integration of:
- **KYC Verification** using the @oppia/kyc-client library
- **Passkey Authentication** for secure login
- **Stellar Blockchain** integration for wallet management

**Features:**
- Real-time KYC status tracking
- Passkey-based authentication
- Stellar wallet integration
- Modern UI with Tailwind CSS
- Comprehensive logging and debugging

**Getting Started:**
```bash
cd kyc-demo2
npm install
npm run dev
```

### kyc-test-page

A comprehensive test application featuring:
- **Veriff Integration** for identity verification
- **Passkey Authentication** with Passkey Kit
- **Stellar Passport** smart contract integration
- **Admin Dashboard** for wallet management
- **Webhook Handling** for verification callbacks

**Key Components:**
- Multi-step KYC verification flow
- Dynamic stepper interface
- Wallet registration and management
- Backend API integration
- Real-time status updates

**Getting Started:**
```bash
cd kyc-test-page
npm install
npm run dev
```

## 🛠️ Technology Stack

### Core Technologies
- **TypeScript**: Type-safe development
- **Next.js 15**: React framework with App Router
- **React 19**: Latest React features
- **Tailwind CSS**: Utility-first styling

### Identity & Security
- **@oppia/kyc-client**: Custom KYC verification library
- **@veriff/js-sdk**: Professional identity verification
- **Passkey Kit**: WebAuthn/FIDO2 authentication
- **Zustand**: State management

### Blockchain
- **Stellar SDK**: Stellar blockchain integration
- **Soroban**: Smart contract platform
- **stellar-passport**: Custom smart contract bindings

### Development Tools
- **ESLint**: Code linting
- **TypeScript**: Type checking
- **PostCSS**: CSS processing

## 🔧 Development Setup

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Git

### Installation

1. **Clone the repository:**
```bash
git clone <repository-url>
cd js-package-veridion
```

2. **Install dependencies for all packages:**
```bash
# Install kyc-client package
cd packages/kyc-client
npm install
npm run build

# Install stellar-passport package
cd ../stellar-passport
npm install

# Install kyc-demo2
cd ../../kyc-demo2
npm install

# Install kyc-test-page
cd ../kyc-test-page
npm install
```

### Building Packages

```bash
# Build kyc-client library
cd packages/kyc-client
npm run build

# Watch for changes during development
npm run dev
```

## 🚀 Quick Start Guide

### 1. Start with kyc-demo2 (Recommended for beginners)

```bash
cd kyc-demo2
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the demo application.

### 2. Explore kyc-test-page (Full-featured application)

```bash
cd kyc-test-page
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to access the comprehensive test application.

### 3. Use the kyc-client library in your own project

```bash
npm install @oppia/kyc-client
```

## 📚 API Documentation

### KYC Client API

#### `init(options: InitOptions)`
Initialize the KYC client with configuration options.

```typescript
kyc.init({
  edgeUrl: 'https://edge.example.com',    // Required: Edge server URL
  clientId: 'my-app',                     // Required: Your app identifier
  storageKey: 'kyc_token',                // Optional: localStorage key
  allowedOrigin: 'https://edge.example.com', // Optional: postMessage origin filter
  insecureNoSession: true,                // Optional: Hackathon mode
  onStatusChange: (status) =>             // Optional: Status change callback
    console.log('Status changed:', status),
});
```

#### `startKyc(options?: StartKycOptions): Promise<KycResult>`
Start the KYC verification process.

```typescript
// Popup mode (recommended for user-initiated actions)
const result = await kyc.startKyc({ 
  openMode: 'popup',
  theme: 'dark',
  locale: 'en-US'
});

// Iframe mode (for embedded flows)
const result = await kyc.startKyc({ 
  openMode: 'iframe',
  theme: 'light'
});

if (result.ok && result.status === 'verified') {
  console.log('User verified!');
} else {
  console.log('Verification failed:', result.error);
}
```

#### `requireKyc(mode?, openMode?): Promise<boolean>`
Require KYC verification, showing UI if needed.

```typescript
// Show KYC modal if not verified
const isVerified = await kyc.requireKyc('modal');

// Just check without showing UI
const isVerified = await kyc.requireKyc('reject');

// Use popup mode
const isVerified = await kyc.requireKyc('modal', 'popup');
```

### Types

```typescript
type KycStatus = 'unknown' | 'pending' | 'verified' | 'rejected';

type KycResult = 
  | { ok: true; status: KycStatus; token?: string }
  | { ok: false; error: string };

interface InitOptions {
  edgeUrl: string;                    // Required: Edge server URL
  clientId: string;                   // Required: Your app identifier
  storageKey?: string;                // Optional: localStorage key
  allowedOrigin?: string;             // Optional: postMessage origin filter
  onStatusChange?: (status: KycStatus) => void; // Optional: Status change callback
  insecureNoSession?: boolean;        // Optional: Hackathon mode
}

interface StartKycOptions {
  locale?: string;                    // Optional: UI locale
  theme?: 'light' | 'dark' | 'auto'; // Optional: UI theme
  loginHint?: string;                 // Optional: Pre-fill user info
  openMode?: 'iframe' | 'popup';     // Optional: UI mode
  insecure?: boolean;                 // Optional: Force no-session mode
}
```

## 🔒 Security Considerations

### Origin Filtering
The library automatically filters postMessage events by origin for security:

```typescript
kyc.init({
  edgeUrl: 'https://edge.example.com',
  allowedOrigin: 'https://edge.example.com', // Only accept messages from this origin
});
```

### Token Storage
Tokens are stored in localStorage with error handling and fallback mechanisms.

### Insecure Mode
The `insecureNoSession` mode is designed for hackathons and demos. It bypasses all session management and simply opens the KYC interface.

## 🌐 Browser Support

- Chrome 88+
- Firefox 85+
- Safari 14+
- Edge 88+

Requires ES2020 support for:
- Optional chaining (`?.`)
- Nullish coalescing (`??`)
- Private class fields
- AbortController

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

For questions and support:
- Open an issue on GitHub
- Check the documentation in individual package READMEs
- Review the demo applications for usage examples

## 🗺️ Roadmap

- [ ] Enhanced security features
- [ ] Additional blockchain integrations
- [ ] Mobile SDK support
- [ ] Advanced analytics dashboard
- [ ] Multi-language support
- [ ] Performance optimizations
