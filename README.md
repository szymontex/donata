# Donata

<p align="center">
  <!-- Logo will be added later -->
  <h3 align="center">Self-hosted Open Source Donation System</h3>
</p>

<p align="center">
  <a href="https://github.com/szymontex/donata/stargazers"><img src="https://img.shields.io/github/stars/szymontex/donata" alt="Stars"></a>
  <a href="https://github.com/szymontex/donata/blob/main/LICENSE"><img src="https://img.shields.io/github/license/szymontex/donata" alt="License"></a>
  <a href="https://github.com/szymontex/donata/issues"><img src="https://img.shields.io/github/issues/szymontex/donata" alt="Issues"></a>
</p>

## 🚀 Overview

Donata is a modern, self-hosted donation system designed for streamers and content creators. It provides a complete solution for accepting donations, managing alerts, and tracking contributions - all while maintaining full control over your donation infrastructure.

### 益 Key Features

- 🥡 **Streamlined Donations**: Easy-to-use donation page with customizable fields
- 👃 **Multiple Payment Methods**: Support for BLIK, P24, and credit cards through Stripe
- 🌨 **Customizable Overlays**: Real-time stream overlays for donations and voting
- 🌒 **Voting System**: Integrated voting mechanism for viewer engagement
- 🔐 **Self-hosted**: Full control over your data and infrastructure
- 📠 **WebSocket Integration**: Real-time updates and notifications
- 💳 **Docker Support**: Easy deployment with Docker and Docker Compose
- 🔐 **Secure**: Built with security best practices and data protection in mind

## 🏇 Architecture

Donata consists of several key components:
- Backend Server (Node.js + Express)
- WebSocket Server for real-time communication
- Frontend donation page (React + TypeScript)
- Stream overlay system
- CLI tools for testing and management

## 🜴 Installation

### Prerequisites
- Docker and Docker Compose
- Node.js 18+ (for local development)
- pnpm (package manager)
- Stripe account for payment processing

### Using Docker (Recommended)

```bash
# Clone the repository
git clone https://github.com/szymontex/donata
cd donata

# Create and configure .env file
cp .env.example .env

# Configure your Stripe keys and other settings in .env

# Start using Docker Compose
docker-compose up -d
```

### Local Development

```bash
# Install dependencies
pnpm install

# Start development server
pnpm dev
```

## 🔜 Configuration

1. Copy `.env.example` to `.env`
2. Configure your Stripe API keys
3. Adjust port settings if needed
4. Additional configuration options can be found in the documentation

## 🔤 API Endpoints & Testing

### Endpoints
- Main donation page: `https://your-domain/`
- Stream overlay: `https://your-domain/overlay`
- Voting overlay: `https://your-domain/voting-overlay`
- Stripe webhooks: `https://your-domain/stripe-webhooks`
- Vote reset: `https://your-domain/api/votes/reset`

### 🔷 One-line Testing Commands

Test donation (15 PLN):
```bash
curl -X POST http://localhost:3000/stripe-webhooks -H "Content-Type: application/json" -d "{\"type\":\"payment_intent.succeeded\",\"data\":{\"object\":{\"amount\":1500,\"metadata\":{\"participantId\":\"3\",\"participantName\":\"KXNP\",\"nickname\":\"TestowyUser\",\"message\":\"Testowa wiadomosc!\"}}}}"
```

Reset votes:
```bash
curl -X POST "https://your-domain/api/votes/reset"
```

Multiple test donations (10 random donations):
```bash
for i in {1..10}; do curl -X POST "https://your-domain/stripe-webhooks" -H "Content-Type: application/json" -d "{\"type\":\"payment_intent.succeeded\",\"data\":{\"object\":{\"amount\":$((1000 + RANDOM % 5000)),\"metadata\":{\"participantId\":\"$i\",\"participantName\":\"Player $i\",\"nickname\":\"Donor$i\",\"message\":\"Test message $j!\"}}}}"; sleep 1; done
```

## 💓 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📑 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.