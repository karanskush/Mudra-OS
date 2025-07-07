#!/usr/bin/env node

const { setTimeout } = require('timers/promises');

// ANSI colors for terminal output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  dim: '\x1b[2m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
  console.log(colors[color] + message + colors.reset);
}

function header(message) {
  console.log('\n' + colors.bright + colors.blue + '='.repeat(60) + colors.reset);
  console.log(colors.bright + colors.blue + message + colors.reset);
  console.log(colors.bright + colors.blue + '='.repeat(60) + colors.reset + '\n');
}

async function sendCommand(url, command) {
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(command)
    });
    
    const result = await response.json();
    return result;
  } catch (error) {
    log(`Error sending command: ${error.message}`, 'red');
    return null;
  }
}

async function checkHealth() {
  try {
    const response = await fetch('http://localhost:8080/api/grpc/health');
    const result = await response.json();
    
    if (result.status === 'healthy') {
      log('✅ Server is healthy and ready!', 'green');
      log(`📊 Services: ${result.services.join(', ')}`, 'cyan');
      log(`⏰ Uptime: ${Math.floor(result.uptime)}s`, 'cyan');
      return true;
    } else {
      log('❌ Server health check failed', 'red');
      return false;
    }
  } catch (error) {
    log(`❌ Cannot connect to server: ${error.message}`, 'red');
    log('🔧 Make sure the server is running on http://localhost:8080', 'yellow');
    return false;
  }
}

async function demonstratePaymentFlow() {
  header('💸 PAYMENT PROCESSING DEMO');
  
  log('🚀 Initiating payment...', 'cyan');
  
  const paymentCommand = {
    command: {
      initiatePayment: {
        userId: 'demo_user',
        fromAccountId: 'acc_sender',
        toAccountId: 'acc_receiver',
        amount: 2500,
        currency: 'USD',
        description: 'Demo payment via gRPC streaming',
        reference: `PAY_DEMO_${Date.now()}`,
        preferredRail: 'UPI'
      }
    }
  };
  
  const result = await sendCommand('http://localhost:8080/api/grpc/payment/command', paymentCommand);
  
  if (result && result.success) {
    log(`✅ Payment initiated successfully!`, 'green');
    log(`💰 Amount: $${paymentCommand.command.initiatePayment.amount}`, 'cyan');
    log(`🚄 Rail: ${paymentCommand.command.initiatePayment.preferredRail}`, 'cyan');
    log(`📋 Reference: ${paymentCommand.command.initiatePayment.reference}`, 'cyan');
    log(`🔄 Watch the stream for real-time updates...`, 'yellow');
  } else {
    log('❌ Payment initiation failed', 'red');
  }
}

async function demonstrateKYCFlow() {
  header('🛡️ KYC VERIFICATION DEMO');
  
  log('📋 Starting KYC verification...', 'cyan');
  
  const kycCommand = {
    command: {
      startVerification: {
        userId: 'demo_user',
        country: 'IN',
        name: 'Demo User',
        email: 'demo@fintech.com',
        phone: '+919876543210',
        amount: 50000
      }
    }
  };
  
  const result = await sendCommand('http://localhost:8080/api/grpc/kyc/command', kycCommand);
  
  if (result && result.success) {
    log(`✅ KYC verification started!`, 'green');
    log(`👤 User: ${kycCommand.command.startVerification.name}`, 'cyan');
    log(`🌍 Country: ${kycCommand.command.startVerification.country}`, 'cyan');
    log(`💵 Amount: $${kycCommand.command.startVerification.amount}`, 'cyan');
    
    // Simulate document upload
    await setTimeout(2000);
    log('📄 Uploading passport document...', 'cyan');
    
    const uploadCommand = {
      command: {
        uploadDocument: {
          userId: 'demo_user',
          documentType: 'passport',
          documentData: 'base64_mock_passport_data',
          fileName: 'passport_demo.jpg'
        }
      }
    };
    
    const uploadResult = await sendCommand('http://localhost:8080/api/grpc/kyc/command', uploadCommand);
    
    if (uploadResult && uploadResult.success) {
      log(`✅ Document uploaded for verification!`, 'green');
      log(`🔄 Watch the stream for verification updates...`, 'yellow');
    }
  } else {
    log('❌ KYC verification start failed', 'red');
  }
}

async function demonstrateLedgerFlow() {
  header('📊 LEDGER OPERATIONS DEMO');
  
  log('💳 Creating ledger transaction...', 'cyan');
  
  const ledgerCommand = {
    command: {
      createTransaction: {
        fromAccountId: 'acc_business',
        toAccountId: 'acc_personal',
        amount: 1500,
        currency: 'USD',
        description: 'Demo ledger transaction',
        reference: `TXN_DEMO_${Date.now()}`,
        metadata: {
          category: 'transfer',
          source: 'demo_script'
        }
      }
    }
  };
  
  const result = await sendCommand('http://localhost:8080/api/grpc/ledger/command', ledgerCommand);
  
  if (result && result.success) {
    log(`✅ Transaction created successfully!`, 'green');
    log(`💰 Amount: $${ledgerCommand.command.createTransaction.amount}`, 'cyan');
    log(`📋 Reference: ${ledgerCommand.command.createTransaction.reference}`, 'cyan');
    log(`🔄 Watch the stream for balance updates...`, 'yellow');
  } else {
    log('❌ Transaction creation failed', 'red');
  }
}

async function showStreamingInstructions() {
  header('📡 REAL-TIME STREAMING INSTRUCTIONS');
  
  log('To see the real-time events, open these URLs in your browser or Postman:', 'cyan');
  log('', 'reset');
  
  log('💸 Payment Stream:', 'yellow');
  log('   http://localhost:8080/api/grpc/payment/stream?userId=demo_user', 'green');
  log('', 'reset');
  
  log('🛡️ KYC Stream:', 'yellow');
  log('   http://localhost:8080/api/grpc/kyc/stream?userId=demo_user', 'green');
  log('', 'reset');
  
  log('📊 Ledger Stream:', 'yellow');
  log('   http://localhost:8080/api/grpc/ledger/stream?userId=demo_user', 'green');
  log('', 'reset');
  
  log('🔍 Risk Monitoring Stream:', 'yellow');
  log('   http://localhost:8080/api/grpc/risk/stream?userId=demo_user', 'green');
  log('', 'reset');
  
  log('💡 Tip: Use curl with -N flag for streaming in terminal:', 'magenta');
  log('   curl -N http://localhost:8080/api/grpc/payment/stream?userId=demo_user', 'dim');
  log('', 'reset');
  
  log('📊 Monitor active streams:', 'magenta');
  log('   curl http://localhost:8080/api/admin/streams', 'dim');
}

async function showPostmanInstructions() {
  header('📮 POSTMAN TESTING GUIDE');
  
  log('1. Create a new Postman workspace', 'cyan');
  log('2. Import these requests:', 'cyan');
  log('', 'reset');
  
  const requests = [
    { method: 'GET', url: 'http://localhost:8080/api/grpc/health', desc: 'Health Check' },
    { method: 'GET', url: 'http://localhost:8080/api/grpc/payment/stream?userId=demo', desc: 'Payment Stream' },
    { method: 'POST', url: 'http://localhost:8080/api/grpc/payment/command', desc: 'Payment Command' },
    { method: 'GET', url: 'http://localhost:8080/api/grpc/kyc/stream?userId=demo', desc: 'KYC Stream' },
    { method: 'POST', url: 'http://localhost:8080/api/grpc/kyc/command', desc: 'KYC Command' },
    { method: 'GET', url: 'http://localhost:8080/api/grpc/ledger/stream?userId=demo', desc: 'Ledger Stream' },
    { method: 'POST', url: 'http://localhost:8080/api/grpc/ledger/command', desc: 'Ledger Command' }
  ];
  
  requests.forEach((req, index) => {
    const methodColor = req.method === 'GET' ? 'green' : 'yellow';
    log(`   ${index + 1}. ${req.method}`, methodColor);
    log(`      ${req.url}`, 'cyan');
    log(`      ${req.desc}`, 'dim');
    log('', 'reset');
  });
  
  log('3. For streaming endpoints (GET requests):', 'magenta');
  log('   - Click Send and watch real-time events appear', 'dim');
  log('   - Events will continue streaming until you cancel', 'dim');
  log('', 'reset');
  
  log('4. For command endpoints (POST requests):', 'magenta');
  log('   - Set Content-Type: application/json', 'dim');
  log('   - Use the example payloads from the README', 'dim');
}

async function runCompleteDemo() {
  header('🚀 gRPC STREAMING FINTECH DEMO');
  
  log('This demo will show real-time fintech operations using gRPC streaming!', 'cyan');
  log('', 'reset');
  
  // Check if server is running
  const serverHealthy = await checkHealth();
  if (!serverHealthy) {
    log('', 'reset');
    log('Please start the server first:', 'yellow');
    log('  cd grpc-streaming-server', 'dim');
    log('  npm install', 'dim');
    log('  npm start', 'dim');
    return;
  }
  
  await setTimeout(2000);
  
  // Show streaming instructions first
  await showStreamingInstructions();
  
  log('⏰ Starting demo flows in 5 seconds...', 'yellow');
  log('   Open the streaming URLs above to see real-time events!', 'magenta');
  await setTimeout(5000);
  
  // Run demo flows
  await demonstratePaymentFlow();
  await setTimeout(3000);
  
  await demonstrateKYCFlow();
  await setTimeout(3000);
  
  await demonstrateLedgerFlow();
  await setTimeout(2000);
  
  await showPostmanInstructions();
  
  header('✨ DEMO COMPLETE');
  log('The demo has sent several commands that will generate streaming events.', 'green');
  log('Check the streaming URLs to see the real-time updates!', 'cyan');
  log('', 'reset');
  log('Frontend integration: Visit http://localhost:3000/grpc-demo', 'magenta');
  log('Or use the real-time payment page: http://localhost:3000/payments', 'magenta');
}

// Check if this script is being run directly
if (require.main === module) {
  runCompleteDemo().catch(error => {
    log(`Demo failed: ${error.message}`, 'red');
    process.exit(1);
  });
}

module.exports = {
  checkHealth,
  demonstratePaymentFlow,
  demonstrateKYCFlow,
  demonstrateLedgerFlow,
  runCompleteDemo
}; 