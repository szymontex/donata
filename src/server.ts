import express, { Request, Response, Router, RequestHandler } from 'express';
import Stripe from 'stripe';
import dotenv from 'dotenv';
import path from 'path';
import { WebSocket, WebSocketServer } from 'ws';
import { createServer } from 'http';

dotenv.config();

interface Participant {
  id: string;
  name: string;
}

interface PaymentRequest {
  nickname: string;
  amount: number;
  message?: string;
  participant?: {
    id: string;
    name: string;
  };
}

interface VoteCount {
  [participantId: string]: number;
}

const votes: VoteCount = {};
const app: express.Application = express();
const router: Router = express.Router();
const PORT = process.env.PORT || 3000;
const server = createServer(app);
const wss = new WebSocketServer({ server });
const clients = new Set<WebSocket>();

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2024-12-18.acacia'
});

app.use(express.json());
app.use(express.static(path.join(__dirname, '../public')));

wss.on('connection', (ws: WebSocket) => {
  clients.add(ws);
  console.log('New WebSocket connection');

  // Send current votes state to new connection
  ws.send(JSON.stringify({
    type: 'votes_update',
    votes: votes
  }));

  ws.on('close', () => {
    clients.delete(ws);
    console.log('WebSocket connection closed');
  });
});

function broadcast(data: any): void {
  clients.forEach(client => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify(data));
    }
  });
}

const createPayment: RequestHandler = async (req, res, next): Promise<void> => {
  try {
    const { amount, nickname, message, participant } = req.body as PaymentRequest;

    if (!amount || amount < 1) {
      res.status(400).json({ error: 'Invalid amount' });
      return;
    }
    if (!nickname) {
      res.status(400).json({ error: 'Nickname is required' });
      return;
    }

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['blik', 'p24', 'card'],
      line_items: [{
        price_data: {
          currency: 'pln',
          product_data: {
            name: participant ? `Vote for: ${participant.name}` : 'Donate',
            description: message || undefined,
          },
          unit_amount: amount * 100,
        },
        quantity: 1,
      }],
      mode: 'payment',
      success_url: `${req.headers.origin}/success.html`,
      cancel_url: `${req.headers.origin}/cancel.html`,
      payment_intent_data: {
        metadata: {
          nickname,
          message: message || '',
          participantId: participant?.id || '',
          participantName: participant?.name || '',
        }
      }
    });

    res.json({ url: session.url });
  } catch (error) {
    if (error instanceof Error) {
      res.status(500).json({ error: error.message });
    }
    next(error);
  }
};

app.post('/stripe-webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  const sig = req.headers['stripe-signature'];

  try {
    const event = stripe.webhooks.constructEvent(
      req.body,
      sig!,
      process.env.STRIPE_WEBHOOK_SECRET!
    );

    if (event.type === 'payment_intent.succeeded') {
      const paymentIntent = event.data.object as Stripe.PaymentIntent;
      
      const donationData = {
        type: 'donation',
        donation: {
          nickname: paymentIntent.metadata.nickname,
          amount: paymentIntent.amount,
          message: paymentIntent.metadata.message,
          participantName: paymentIntent.metadata.participantName
        }
      };

      broadcast(donationData);

      if (paymentIntent.metadata.participantId) {
        const participantId = paymentIntent.metadata.participantId;
        votes[participantId] = (votes[participantId] || 0) + paymentIntent.amount;
        
        broadcast({
          type: 'votes_update',
          votes: votes
        });
      }
    }

    res.json({ received: true });
  } catch (err) {
    if (err instanceof Error) {
      res.status(400).send(`Webhook Error: ${err.message}`);
    }
  }
});

app.post('/stripe-webhooks', express.json(), (req, res) => {
  try {
    if (req.body.type === 'payment_intent.succeeded') {
      const paymentData = req.body.data.object;
      
      const donation = {
        type: 'donation',
        donation: {
          nickname: paymentData.metadata.nickname,
          amount: paymentData.amount,
          message: paymentData.metadata.message || '',
          participantName: paymentData.metadata.participantName || ''
        }
      };

      broadcast(donation);

      if (paymentData.metadata.participantId) {
        const participantId = paymentData.metadata.participantId;
        votes[participantId] = (votes[participantId] || 0) + paymentData.amount;
        
        broadcast({
          type: 'votes_update',
          votes: votes
        });
      }
      
      res.json({ success: true });
    } else {
      res.json({ success: false, message: 'Unsupported event type' });
    }
  } catch (error) {
    console.error('Webhook processing error:', error);
    res.status(400).json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    });
  }
});

// Test endpoints
app.post('/test-donation', express.json(), (req, res) => {
  const testDonation = {
    type: 'donation',
    donation: {
      nickname: "TestUser123",
      amount: 1500,
      message: "Test message!",
      participantName: "Participant #1"
    }
  };

  broadcast(testDonation);
  res.json({ success: true });
});

app.post('/test-votes', express.json(), (req, res) => {
  const testVotes = {
    type: 'votes_update',
    votes: {
      "1": 15000,
      "2": 20000,
      "3": 10000
    }
  };

  broadcast(testVotes);
  res.json({ success: true });
});

// Voting overlay endpoints
app.get('/voting-overlay', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/voting-overlay.html'));
});

app.get('/api/votes', (req, res) => {
  res.json({ votes });
});

app.post('/api/votes/reset', (req, res) => {
  Object.keys(votes).forEach(key => delete votes[key]);
  
  broadcast({
    type: 'votes_update',
    votes: votes
  });
  
  res.json({ success: true, message: 'Votes reset successfully' });
});

router.post('/api/create-payment', createPayment);
app.use(router);

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});