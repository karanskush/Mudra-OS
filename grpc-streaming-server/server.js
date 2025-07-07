const express = require('express');
const cors = require('cors');
const { v4: uuidv4 } = require('uuid');
const app = express();
const port = 8080;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// In-memory storage for demonstration
const activeStreams = new Map();
const paymentRails = ['ACH', 'UPI', 'SEPA', 'SWIFT', 'RTP', 'PIX'];
const currencies = ['USD', 'EUR', 'GBP', 'INR', 'BRL'];

// Utility functions
const generateMockEvent = (type, userId) => {
  const timestamp = new Date().toISOString();
  
  switch (type) {
    case 'payment':
      return {
        event: {
          paymentInitiated: {
            paymentId: `pay_${uuidv4().substring(0, 8)}`,
            userId,
            amount: Math.floor(Math.random() * 10000) + 100,
            currency: currencies[Math.floor(Math.random() * currencies.length)],
            selectedRail: paymentRails[Math.floor(Math.random() * paymentRails.length)],
            estimatedFee: Math.floor(Math.random() * 50) + 5,
            estimatedTime: `${Math.floor(Math.random() * 60) + 30}s`,
            fxRate: 1.0 + (Math.random() * 0.1),
            status: 'PENDING',
            initiatedAt: timestamp
          }
        }
      };
    
    case 'kyc':
      return {
        event: {
          documentVerified: {
            verificationId: `kyc_${uuidv4().substring(0, 8)}`,
            documentType: ['passport', 'driver_license', 'id_card'][Math.floor(Math.random() * 3)],
            documentId: `doc_${uuidv4().substring(0, 8)}`,
            status: Math.random() > 0.2 ? 'VERIFIED' : 'REJECTED',
            confidence: Math.random() * 0.3 + 0.7,
            verifiedAt: timestamp,
            issues: Math.random() > 0.8 ? ['Document clarity could be improved'] : []
          }
        }
      };
    
    case 'ledger':
      return {
        event: {
          balanceUpdate: {
            accountId: `acc_${Math.floor(Math.random() * 10) + 1}`,
            userId,
            balance: Math.floor(Math.random() * 100000) + 1000,
            currency: currencies[Math.floor(Math.random() * currencies.length)],
            previousBalance: Math.floor(Math.random() * 100000) + 1000,
            changeAmount: Math.floor(Math.random() * 5000) + 100,
            changeType: Math.random() > 0.5 ? 'CREDIT' : 'DEBIT',
            updatedAt: timestamp,
            transactionId: `txn_${uuidv4().substring(0, 8)}`
          }
        }
      };
    
    case 'risk':
      return {
        event: {
          riskAssessmentUpdate: {
            verificationId: `risk_${uuidv4().substring(0, 8)}`,
            riskScore: Math.random(),
            riskLevel: ['LOW', 'MEDIUM', 'HIGH'][Math.floor(Math.random() * 3)],
            riskFactors: {
              'velocity': Math.random(),
              'geography': Math.random(),
              'device': Math.random(),
              'amount': Math.random()
            },
            flags: Math.random() > 0.7 ? ['unusual_location', 'high_velocity'] : [],
            updatedAt: timestamp
          }
        }
      };
    
    default:
      return {
        event: {
          message: `Unknown event type: ${type}`,
          timestamp
        }
      };
  }
};

// Health check endpoints
app.get('/api/grpc/payment/health', (req, res) => {
  res.json({ status: 'healthy', service: 'payment', timestamp: new Date().toISOString() });
});

app.get('/api/grpc/kyc/health', (req, res) => {
  res.json({ status: 'healthy', service: 'kyc', timestamp: new Date().toISOString() });
});

app.get('/api/grpc/ledger/health', (req, res) => {
  res.json({ status: 'healthy', service: 'ledger', timestamp: new Date().toISOString() });
});

// Generic health check
app.get('/api/grpc/health', (req, res) => {
  res.json({ 
    status: 'healthy', 
    services: ['payment', 'kyc', 'ledger', 'risk'],
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// Payment streaming endpoints
app.post('/api/grpc/payment/command', (req, res) => {
  const { command } = req.body;
  
  console.log('Payment command received:', command);
  
  if (command.initiatePayment) {
    const paymentId = `pay_${uuidv4().substring(0, 8)}`;
    
    // Simulate payment processing
    setTimeout(() => {
      const event = {
        event: {
          paymentInitiated: {
            paymentId,
            userId: command.initiatePayment.userId,
            amount: command.initiatePayment.amount,
            currency: command.initiatePayment.currency,
            selectedRail: command.initiatePayment.preferredRail || 'ACH',
            estimatedFee: Math.floor(Math.random() * 50) + 5,
            estimatedTime: '45s',
            fxRate: 1.0,
            status: 'PENDING',
            initiatedAt: new Date().toISOString()
          }
        }
      };
      
      broadcastToStreams('payment', event);
      
      // Simulate status updates
      setTimeout(() => {
        const statusUpdate = {
          event: {
            paymentStatusUpdate: {
              paymentId,
              status: 'PROCESSING',
              message: 'Payment is being processed by the rail',
              timestamp: new Date().toISOString(),
              railInfo: {
                railName: command.initiatePayment.preferredRail || 'ACH',
                processingTime: '30s',
                fee: Math.floor(Math.random() * 50) + 5
              }
            }
          }
        };
        broadcastToStreams('payment', statusUpdate);
      }, 2000);
      
      // Simulate completion
      setTimeout(() => {
        const completion = {
          event: {
            paymentCompleted: {
              paymentId,
              finalAmount: command.initiatePayment.amount,
              actualFee: Math.floor(Math.random() * 50) + 5,
              completedAt: new Date().toISOString(),
              confirmationCode: `conf_${uuidv4().substring(0, 8)}`,
              railUsed: command.initiatePayment.preferredRail || 'ACH',
              fxRate: 1.0
            }
          }
        };
        broadcastToStreams('payment', completion);
      }, 5000);
    }, 500);
    
    res.json({ success: true, paymentId });
  } else {
    res.json({ success: true, message: 'Command processed' });
  }
});

app.get('/api/grpc/payment/stream', (req, res) => {
  const { userId } = req.query;
  
  // Set up Server-Sent Events
  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    'Connection': 'keep-alive',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Cache-Control'
  });
  
  const streamId = `payment_${userId}_${Date.now()}`;
  activeStreams.set(streamId, { res, userId, type: 'payment' });
  
  // Send initial connection confirmation
  res.write(`data: ${JSON.stringify({
    event: {
      connected: {
        streamId,
        userId,
        type: 'payment',
        timestamp: new Date().toISOString()
      }
    }
  })}\n\n`);
  
  // Send periodic mock events
  const eventInterval = setInterval(() => {
    const event = generateMockEvent('payment', userId);
    res.write(`data: ${JSON.stringify(event)}\n\n`);
  }, 10000); // Every 10 seconds
  
  // Handle client disconnect
  req.on('close', () => {
    clearInterval(eventInterval);
    activeStreams.delete(streamId);
    console.log(`Payment stream closed for user: ${userId}`);
  });
});

// KYC streaming endpoints
app.post('/api/grpc/kyc/command', (req, res) => {
  const { command } = req.body;
  
  console.log('KYC command received:', command);
  
  if (command.startVerification) {
    const verificationId = `kyc_${uuidv4().substring(0, 8)}`;
    
    setTimeout(() => {
      const event = {
        event: {
          verificationStarted: {
            verificationId,
            userId: command.startVerification.userId,
            country: command.startVerification.country,
            requiredDocuments: ['passport', 'proof_of_address'],
            estimatedTime: '5-10 minutes',
            startedAt: new Date().toISOString()
          }
        }
      };
      
      broadcastToStreams('kyc', event);
    }, 500);
    
    res.json({ success: true, verificationId });
  } else if (command.uploadDocument) {
    setTimeout(() => {
      const event = {
        event: {
          documentUploaded: {
            verificationId: `kyc_${uuidv4().substring(0, 8)}`,
            documentType: command.uploadDocument.documentType,
            documentId: `doc_${uuidv4().substring(0, 8)}`,
            status: 'PROCESSING',
            uploadedAt: new Date().toISOString(),
            processingTime: '2-3 minutes'
          }
        }
      };
      
      broadcastToStreams('kyc', event);
      
      // Simulate verification result
      setTimeout(() => {
        const verification = {
          event: {
            documentVerified: {
              verificationId: `kyc_${uuidv4().substring(0, 8)}`,
              documentType: command.uploadDocument.documentType,
              documentId: `doc_${uuidv4().substring(0, 8)}`,
              status: Math.random() > 0.2 ? 'VERIFIED' : 'REJECTED',
              confidence: Math.random() * 0.3 + 0.7,
              verifiedAt: new Date().toISOString(),
              issues: Math.random() > 0.8 ? ['Document clarity could be improved'] : []
            }
          }
        };
        broadcastToStreams('kyc', verification);
      }, 3000);
    }, 500);
    
    res.json({ success: true, message: 'Document uploaded for processing' });
  } else {
    res.json({ success: true, message: 'Command processed' });
  }
});

app.get('/api/grpc/kyc/stream', (req, res) => {
  const { userId } = req.query;
  
  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    'Connection': 'keep-alive',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Cache-Control'
  });
  
  const streamId = `kyc_${userId}_${Date.now()}`;
  activeStreams.set(streamId, { res, userId, type: 'kyc' });
  
  res.write(`data: ${JSON.stringify({
    event: {
      connected: {
        streamId,
        userId,
        type: 'kyc',
        timestamp: new Date().toISOString()
      }
    }
  })}\n\n`);
  
  const eventInterval = setInterval(() => {
    const event = generateMockEvent('kyc', userId);
    res.write(`data: ${JSON.stringify(event)}\n\n`);
  }, 15000); // Every 15 seconds
  
  req.on('close', () => {
    clearInterval(eventInterval);
    activeStreams.delete(streamId);
    console.log(`KYC stream closed for user: ${userId}`);
  });
});

// Ledger streaming endpoints
app.post('/api/grpc/ledger/command', (req, res) => {
  const { command } = req.body;
  
  console.log('Ledger command received:', command);
  
  if (command.createTransaction) {
    const transactionId = `txn_${uuidv4().substring(0, 8)}`;
    
    setTimeout(() => {
      const event = {
        event: {
          transactionCreated: {
            transactionId,
            fromAccountId: command.createTransaction.fromAccountId,
            toAccountId: command.createTransaction.toAccountId,
            amount: command.createTransaction.amount,
            currency: command.createTransaction.currency,
            description: command.createTransaction.description,
            reference: command.createTransaction.reference,
            status: 'PENDING',
            createdAt: new Date().toISOString(),
            estimatedSettlement: '2-3 minutes'
          }
        }
      };
      
      broadcastToStreams('ledger', event);
      
      // Simulate balance updates
      setTimeout(() => {
        const balanceUpdate = {
          event: {
            balanceUpdate: {
              accountId: command.createTransaction.fromAccountId,
              userId: 'demo_user',
              balance: Math.floor(Math.random() * 100000) + 1000,
              currency: command.createTransaction.currency,
              previousBalance: Math.floor(Math.random() * 100000) + 1000,
              changeAmount: command.createTransaction.amount,
              changeType: 'DEBIT',
              updatedAt: new Date().toISOString(),
              transactionId
            }
          }
        };
        broadcastToStreams('ledger', balanceUpdate);
      }, 2000);
    }, 500);
    
    res.json({ success: true, transactionId });
  } else {
    res.json({ success: true, message: 'Command processed' });
  }
});

app.get('/api/grpc/ledger/stream', (req, res) => {
  const { userId } = req.query;
  
  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    'Connection': 'keep-alive',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Cache-Control'
  });
  
  const streamId = `ledger_${userId}_${Date.now()}`;
  activeStreams.set(streamId, { res, userId, type: 'ledger' });
  
  res.write(`data: ${JSON.stringify({
    event: {
      connected: {
        streamId,
        userId,
        type: 'ledger',
        timestamp: new Date().toISOString()
      }
    }
  })}\n\n`);
  
  const eventInterval = setInterval(() => {
    const event = generateMockEvent('ledger', userId);
    res.write(`data: ${JSON.stringify(event)}\n\n`);
  }, 8000); // Every 8 seconds
  
  req.on('close', () => {
    clearInterval(eventInterval);
    activeStreams.delete(streamId);
    console.log(`Ledger stream closed for user: ${userId}`);
  });
});

// Risk monitoring endpoint
app.get('/api/grpc/risk/stream', (req, res) => {
  const { userId } = req.query;
  
  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    'Connection': 'keep-alive',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Cache-Control'
  });
  
  const streamId = `risk_${userId}_${Date.now()}`;
  activeStreams.set(streamId, { res, userId, type: 'risk' });
  
  res.write(`data: ${JSON.stringify({
    event: {
      connected: {
        streamId,
        userId,
        type: 'risk',
        timestamp: new Date().toISOString()
      }
    }
  })}\n\n`);
  
  const eventInterval = setInterval(() => {
    const event = generateMockEvent('risk', userId);
    res.write(`data: ${JSON.stringify(event)}\n\n`);
  }, 12000); // Every 12 seconds
  
  req.on('close', () => {
    clearInterval(eventInterval);
    activeStreams.delete(streamId);
    console.log(`Risk stream closed for user: ${userId}`);
  });
});

// Utility function to broadcast events to all streams of a type
function broadcastToStreams(type, event) {
  for (const [streamId, stream] of activeStreams.entries()) {
    if (stream.type === type) {
      try {
        stream.res.write(`data: ${JSON.stringify(event)}\n\n`);
      } catch (error) {
        console.error(`Error broadcasting to stream ${streamId}:`, error);
        activeStreams.delete(streamId);
      }
    }
  }
}

// Admin endpoints for demonstration
app.get('/api/admin/streams', (req, res) => {
  const streamInfo = Array.from(activeStreams.entries()).map(([id, stream]) => ({
    id,
    type: stream.type,
    userId: stream.userId,
    connected: true
  }));
  
  res.json({
    activeStreams: streamInfo,
    totalStreams: activeStreams.size,
    timestamp: new Date().toISOString()
  });
});

app.post('/api/admin/broadcast', (req, res) => {
  const { type, event } = req.body;
  
  if (type && event) {
    broadcastToStreams(type, { event });
    res.json({ success: true, message: `Event broadcasted to ${type} streams` });
  } else {
    res.status(400).json({ success: false, message: 'Invalid request' });
  }
});

// Simple web interface
app.get('/', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html>
    <head>
        <title>gRPC Streaming Demo Server</title>
        <style>
            body { font-family: Arial, sans-serif; margin: 40px; }
            h1 { color: #333; }
            .endpoint { background: #f5f5f5; padding: 10px; margin: 10px 0; border-radius: 5px; }
            .method { color: #007bff; font-weight: bold; }
            .url { color: #28a745; }
            code { background: #f8f9fa; padding: 2px 4px; border-radius: 3px; }
        </style>
    </head>
    <body>
        <h1>🚀 gRPC Streaming Demo Server</h1>
        <p>Server is running on port ${port}</p>
        
        <h2>Available Endpoints:</h2>
        
        <div class="endpoint">
            <div class="method">GET</div>
            <div class="url">/api/grpc/health</div>
            <div>Health check for all services</div>
        </div>
        
        <div class="endpoint">
            <div class="method">GET</div>
            <div class="url">/api/grpc/payment/stream?userId=demo</div>
            <div>Server-Sent Events stream for payment updates</div>
        </div>
        
        <div class="endpoint">
            <div class="method">POST</div>
            <div class="url">/api/grpc/payment/command</div>
            <div>Send payment commands</div>
        </div>
        
        <div class="endpoint">
            <div class="method">GET</div>
            <div class="url">/api/grpc/kyc/stream?userId=demo</div>
            <div>Server-Sent Events stream for KYC updates</div>
        </div>
        
        <div class="endpoint">
            <div class="method">GET</div>
            <div class="url">/api/grpc/ledger/stream?userId=demo</div>
            <div>Server-Sent Events stream for ledger updates</div>
        </div>
        
        <div class="endpoint">
            <div class="method">GET</div>
            <div class="url">/api/admin/streams</div>
            <div>View active streams</div>
        </div>
        
        <h2>Test with curl:</h2>
        <code>curl -N ${req.protocol}://${req.get('host')}/api/grpc/payment/stream?userId=demo</code>
        
        <h2>Test with Postman:</h2>
        <p>Set up a GET request to any stream endpoint and watch the real-time events!</p>
    </body>
    </html>
  `);
});

app.listen(port, () => {
  console.log(`🚀 gRPC Streaming Demo Server running on http://localhost:${port}`);
  console.log(`📡 Stream endpoints:`);
  console.log(`   Payment: http://localhost:${port}/api/grpc/payment/stream?userId=demo`);
  console.log(`   KYC: http://localhost:${port}/api/grpc/kyc/stream?userId=demo`);
  console.log(`   Ledger: http://localhost:${port}/api/grpc/ledger/stream?userId=demo`);
  console.log(`   Risk: http://localhost:${port}/api/grpc/risk/stream?userId=demo`);
  console.log(`📊 Admin: http://localhost:${port}/api/admin/streams`);
}); 