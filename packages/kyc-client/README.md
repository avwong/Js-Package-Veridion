# @oppia/kyc-client

 frontend-only TypeScript library for integrating KYC (Know Your Customer) verification with Edge pps. This library provides a simple interface for web applications to open KYC verification flows via popup or iframe, handle secure communication via postMessage, and manage authentication tokens.

## eatures

- 🚀 **rontend-only**: No backend required, works with any web framework
- 🔒 **Secure**: Origin filtering for postMessage communication
- 🎯 **Dual UI modes**: Popup windows or iframe modals
- 🏃‍♂️ **Hackathon mode**: Insecure no-session mode for quick demos
- 📱 **ramework agnostic**: Works with React, Net.js, Vue, or vanilla JavaScript
- 🎨 **Customizable**: Theme and locale support
- 🔄 **Real-time status**: Status change callbacks and token management

## Installation

```bash
npm install @oppia/kyc-client
```

## Quick Start

```typescript
import kyc from '@oppia/kyc-client';

// Initialize the client
kyc.init(
  edgeUrl: 'http://localhost:4',
  clientId: 'my-app',
  insecureNoSession: true, // hackathon mode
  onStatusChange: (status) => console.log('KYC status:', status),
);

// Start verification in popup
const result = await kyc.startKyc( openMode: 'popup' );
if (result.ok && result.status === 'verified') 
  console.log('✅ Verified! Token:', result.token);

```

## PI Reference

### `init(options: InitOptions)`

Initialize the KYC client with configuration options.

```typescript
kyc.init(
  edgeUrl: 'https://edge.eample.com',    // Required: Edge server URL
  clientId: 'my-app',                     // Required: Your app identifier
  storageKey: 'kyc_token',                // Optional: localStorage key
  allowedOrigin: 'https://edge.eample.com', // Optional: postMessage origin filter
  insecureNoSession: true,                // Optional: Hackathon mode
  onStatusChange: (status) =>            // Optional: Status change callback
    console.log('Status changed:', status);
  ,
);
```

### `startKyc(options?: StartKycOptions): Promise<KycResult>`

Start the KYC verification process.

```typescript
// Popup mode (recommended for user-initiated actions)
const result = await kyc.startKyc( 
  openMode: 'popup',
  theme: 'dark',
  locale: 'en-US'
);

// Iframe mode (for embedded flows)
const result = await kyc.startKyc( 
  openMode: 'iframe',
  theme: 'light'
);

if (result.ok && result.status === 'verified') 
  console.log('User verified!');
 else 
  console.log('Verification failed:', result.error);

```

### `requireKyc(mode?, openMode?): Promise<boolean>`

Require KYC verification, showing UI if needed.

```typescript
// Show KYC modal if not verified
const isVerified = await kyc.requireKyc('modal');

// Just check without showing UI
const isVerified = await kyc.requireKyc('reject');

// Use popup mode
const isVerified = await kyc.requireKyc('modal', 'popup');
```

### `checkStatus(signal?): Promise<KycStatus>`

Check the current KYC status.

```typescript
const status = await kyc.checkStatus();
console.log('Current status:', status); // 'unknown' | 'pending' | 'verified' | 'rejected'
```

### `loginIfVerified(): Promise<boolean>`

Check if user is logged in and verified.

```typescript
const isLoggedIn = await kyc.loginIfVerified();
if (isLoggedIn) 
  // User is verified and logged in

```

### `getToken(): string | null`

Get the stored authentication token.

```typescript
const token = kyc.getToken();
if (token) 
  // Use token for PI calls

```

### `logout(): void`

Logout the user and clear stored token.

```typescript
kyc.logout();
// User is now logged out and status is 'unknown'
```

## Types

### `InitOptions`

```typescript
interface InitOptions 
  edgeUrl: string;                    // Required: Edge server URL
  clientId: string;                   // Required: Your app identifier
  storageKey?: string;                // Optional: localStorage key (default: 'kyc_token')
  allowedOrigin?: string;             // Optional: postMessage origin filter
  onStatusChange?: (status: KycStatus) => void; // Optional: Status change callback
  
  // uture options (not used in insecure mode)
  publishableKey?: string;            // Client-side publishable key
  createSessionUrl?: string;          // Backend endpoint for session creation
  getClientToken?: () => Promise< session_id: string; client_secret: string >;
  
  // Hackathon mode
  insecureNoSession?: boolean;        // Bypass session management (default: false)

```

### `StartKycOptions`

```typescript
interface StartKycOptions 
  locale?: string;                    // Optional: UI locale
  theme?: 'light' | 'dark' | 'auto'; // Optional: UI theme
  loginHint?: string;                 // Optional: Pre-fill user info
  openMode?: 'iframe' | 'popup';     // Optional: UI mode (default: 'iframe')
  insecure?: boolean;                 // Optional: orce no-session mode

```

### `KycResult`

```typescript
type KycResult = 
  |  ok: true; status: KycStatus; token?: string 
  |  ok: false; error: string ;
```

### `KycStatus`

```typescript
type KycStatus = 'unknown' | 'pending' | 'verified' | 'rejected';
```

## Usage Eamples

### React Component

```typescript
import React,  useEffect, useState  from 'react';
import kyc from '@oppia/kyc-client';

function KycButton() 
  const [status, setStatus] = useState('unknown');
  const [loading, setLoading] = useState(false);

  useEffect(() => 
    kyc.init(
      edgeUrl: 'http://localhost:4',
      clientId: 'my-react-app',
      insecureNoSession: true,
      onStatusChange: setStatus,
    );
  , []);

  const handleVerify = async () => 
    setLoading(true);
    try 
      const result = await kyc.startKyc( openMode: 'popup' );
      if (result.ok && result.status === 'verified') 
        alert('Verification successful!');
      
     catch (error) 
      console.error('Verification failed:', error);
     finally 
      setLoading(false);
    
  ;

  return (
    <button onClick=handleVerify disabled=loading>
      loading ? 'Verifying...' : 'Verify Identity'
    </button>
  );

```

### Net.js PI Route

```typescript
// pages/api/kyc-status.ts
import  NetpiRequest, NetpiResponse  from 'net';

eport default async function handler(req: NetpiRequest, res: NetpiResponse) 
  const token = req.headers.authorization?.replace('Bearer ', '');
  
  if (!token) 
    return res.status(4).json( error: 'No token provided' );
  

  // Verify token with your backend
  // Return user's KYC status
  
  res.json( status: 'verified', verified: true );

```

### Vanilla JavaScript

```html
<!DOCTYPE html>
<html>
<head>
  <title>KYC Demo</title>
</head>
<body>
  <button id="verify-btn">Verify Identity</button>
  <div id="status"></div>

  <script type="module">
    import kyc from '@oppia/kyc-client';

    kyc.init(
      edgeUrl: 'http://localhost:4',
      clientId: 'vanilla-demo',
      insecureNoSession: true,
      onStatusChange: (status) => 
        document.getElementById('status').tetContent = `Status: $status`;
      
    );

    document.getElementById('verify-btn').addEventListener('click', async () => 
      const result = await kyc.startKyc( openMode: 'popup' );
      if (result.ok && result.status === 'verified') 
        alert('Verification successful!');
      
    );
  </script>
</body>
</html>
```

## Security Considerations

### Origin iltering

The library automatically filters postMessage events by origin for security:

```typescript
kyc.init(
  edgeUrl: 'https://edge.eample.com',
  allowedOrigin: 'https://edge.eample.com', // Only accept messages from this origin
  // Or use '*' to accept from any origin (not recommended for production)
);
```

### Token Storage

Tokens are stored in localStorage with error handling:

```typescript
// Safe storage with fallback
const storage = createTokenStorage('my_app_kyc_token');
const token = storage.get(); // Returns null if localStorage fails
```

### Insecure Mode

The `insecureNoSession` mode is designed for hackathons and demos. It bypasses all session management and simply opens the KYC interface:

```typescript
kyc.init(
  edgeUrl: 'http://localhost:4',
  clientId: 'hackathon-demo',
  insecureNoSession: true, // No backend calls, just open /kyc
);
```

## Development

### Building

```bash
npm run build
```

### Watching for Changes

```bash
npm run dev
```

### Cleaning

```bash
npm run clean
```

## Browser Support

- Chrome 88+
- irefo 85+
- Safari 4+
- Edge 88+

Requires ES22 support for:
- Optional chaining (`?.`)
- Nullish coalescing (`??`)
- Private class fields
- bortController

## License

MIT

## Contributing

. ork the repository
2. Create a feature branch
. Make your changes
4. dd tests
5. Submit a pull request

## Support

or questions and support, please open an issue on GitHub.
