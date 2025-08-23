# 🤫 Hush

**Encrypted cross-platform messaging using Nostr relays**

[![MIT License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![PWA](https://img.shields.io/badge/PWA-enabled-brightgreen.svg)](https://web.dev/progressive-web-apps/)
[![Nostr](https://img.shields.io/badge/protocol-Nostr-purple.svg)](https://nostr.com/)

> Send encrypted messages that only you can read, accessible from any device with just your private key.

## ✨ Features

- 🔐 **End-to-end encryption** using NIP-04 standard
- 📱 **Progressive Web App** - install on any device
- 🔗 **Android share integration** - share text from any app
- 🌐 **Cross-platform** - works on web, mobile, and CLI
- 🚀 **Decentralized** - uses Nostr relay network
- 🔑 **Self-sovereign** - your keys, your data
- ⚡ **Real-time** - messages sync across devices
- 📦 **Zero dependencies** for web app

## 🚀 Quick Start

### Web App (PWA)

1. **Visit**: Open in your browser
2. **Install**: Add to home screen when prompted
3. **Generate/Import**: Use generated key or import existing
4. **Message**: Type and hit "HUSH IT"
5. **Share**: Use Android share menu to send text directly

### CLI Tools

```bash
# Install dependencies
npm install

# Send encrypted message
node encode.js <your-private-key> "Secret message"
# or
npm run encode <your-private-key> "Secret message"

# Read encrypted messages
node decode.js <your-private-key>
# or  
npm run decode <your-private-key>
```

## 📱 Android Installation

1. Open in Chrome/Edge on Android
2. Tap "Add to Home Screen" or "Install"
3. App appears in your app drawer
4. **Share integration**: Share any text → Select "Hush"

## 🔧 Development

```bash
# Clone repository
git clone https://github.com/melvincarvalho/hush.git
cd hush

# Install dependencies
npm install

# Start development server
npm run dev
# Visit http://localhost:8080

# Or use Python
python3 -m http.server 8080
```

## 🔐 How It Works

### Encryption
- Uses **NIP-04** encryption standard from Nostr protocol
- Messages encrypted to yourself using your key pair
- Only you can decrypt with your private key

### Storage
- Messages stored on **Nostr relays** (decentralized network)
- No central server or database
- Relays act as temporary message brokers

### Sync
- Same private key works across all devices
- Web app, CLI, and mobile all access same messages
- Real-time synchronization via relay network

## 🛠️ Architecture

```
┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│   Web App   │    │  CLI Tools  │    │   Mobile    │
│    (PWA)    │    │  (Node.js)  │    │   (PWA)     │
└─────────────┘    └─────────────┘    └─────────────┘
       │                   │                   │
       └───────────────────┼───────────────────┘
                           │
              ┌─────────────▼─────────────┐
              │      Nostr Relays         │
              │  (Decentralized Network)  │
              └───────────────────────────┘
```

## 📚 API Reference

### Web App Functions

```javascript
// Send encrypted message
await send()

// Fetch and display messages  
await fetchMessages()

// Import private key
importKey()

// Copy private key to clipboard
copyKey()
```

### CLI Commands

```bash
# Encode (send message)
./encode.js <private-key> <message>
./encode.js <private-key>  # Read from stdin

# Decode (read messages)
./decode.js <private-key>
```

## 🔑 Key Management

### Security Best Practices

- **Backup your private key** - it's the only way to access your messages
- **Never share your private key** - anyone with it can read your messages  
- **Use secure storage** - consider password managers
- **Generate offline** if maximum security needed

### Key Format
- 64 character hex string
- Example: `4d873595c3477163b6a5dc1909b8c14d07d9cbd06295f2a857effdd854331bd8`

## 🌐 Relay Network

Default relays (can be modified in code):
- `wss://relay.primal.net`
- `wss://relay.damus.io` 
- `wss://nos.lol`

Messages are published to multiple relays for redundancy.

## 🔒 Privacy & Security

### What's Encrypted
- ✅ Message content (NIP-04 encryption)
- ✅ Only readable by private key holder

### What's Public
- ❌ Message timestamps
- ❌ Public keys involved
- ❌ Message existence (but not content)

### Threat Model
- **Protects against**: Relay operators, network observers, casual snoopers
- **Does not protect against**: Quantum computers (future), key compromise, device compromise

## 🤝 Contributing

1. Fork the repository
2. Create feature branch: `git checkout -b feature-name`
3. Commit changes: `git commit -am 'Add feature'`
4. Push branch: `git push origin feature-name`
5. Submit pull request

## 📋 Roadmap

- [ ] Group messaging support
- [ ] File/image encryption
- [ ] Message expiration
- [ ] Offline message queue
- [ ] Custom relay configuration
- [ ] Message threading
- [ ] Push notifications

## ❓ FAQ

### Q: How is this different from Signal/WhatsApp?
A: Hush is decentralized (no central server), cross-platform (works everywhere), and you control your own keys. However, it's currently only self-messaging.

### Q: Can others read my messages?
A: No, messages are encrypted with NIP-04. Only someone with your private key can decrypt them.

### Q: What if relays go down?
A: Messages are stored on multiple relays. If some go down, others may still have your messages.

### Q: Is this production ready?
A: This is experimental software. Use at your own risk for non-critical communications.

## 📄 License

MIT License - see [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [Nostr Protocol](https://nostr.com/) - Decentralized messaging protocol
- [nostr-tools](https://github.com/nbd-wtf/nostr-tools) - JavaScript Nostr library
- Relay operators who provide infrastructure

---

**Built with ❤️ for privacy and decentralization**

[Report Bug](https://github.com/melvincarvalho/hush/issues) • [Request Feature](https://github.com/melvincarvalho/hush/issues) • [Documentation](https://github.com/melvincarvalho/hush/wiki)