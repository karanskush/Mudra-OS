import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  BoltIcon, 
  CodeBracketIcon, 
  DocumentTextIcon, 
  PlayCircleIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon,
  ClipboardDocumentIcon,
  ArrowRightIcon,
  CubeIcon,
  ShieldCheckIcon
} from '@heroicons/react/24/outline';

const GRPCGuide: React.FC = () => {
  const [activeSection, setActiveSection] = useState('overview');
  const [copiedText, setCopiedText] = useState<string | null>(null);

  const handleCopy = async (text: string, label: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedText(label);
      setTimeout(() => setCopiedText(null), 2000);
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  const sections = [
    { id: 'overview', title: 'Overview', icon: InformationCircleIcon },
    { id: 'quickstart', title: 'Quick Start', icon: PlayCircleIcon },
    { id: 'services', title: 'Services', icon: CubeIcon },
    { id: 'streaming', title: 'Streaming APIs', icon: BoltIcon },
    { id: 'examples', title: 'Code Examples', icon: CodeBracketIcon },
    { id: 'security', title: 'Security', icon: ShieldCheckIcon },
    { id: 'troubleshooting', title: 'Troubleshooting', icon: ExclamationTriangleIcon },
  ];

  const streamingAPIs = [
    {
      name: 'Transaction Monitor',
      service: 'PaymentService',
      method: 'TransactionMonitor',
      description: 'Real-time payment monitoring with dynamic filtering',
      useCase: 'Operations dashboards, fraud detection, real-time analytics',
      example: `// Client streaming example
const stream = client.transactionMonitor();

// Start monitoring
stream.write({
  command: {
    start_monitoring: {
      user_id: "user_123",
      status_filter: ["PROCESSING", "COMPLETED"],
      min_amount: 100.0,
      currency_filter: ["USD", "EUR"]
    }
  }
});

// Handle server responses
stream.on('data', (response) => {
  if (response.event.payment_update) {
    console.log('Payment update:', response.event.payment_update);
  }
});`
    },
    {
      name: 'Webhook Debugger',
      service: 'WebhookService',
      method: 'WebhookDebugger',
      description: 'Live webhook debugging and testing',
      useCase: 'Integration testing, webhook performance monitoring',
      example: `// Webhook debugging example
const debugStream = client.webhookDebugger();

// Start debugging
debugStream.write({
  command: {
    start_debugging: {
      endpoint_url: "https://api.partner.com/webhooks",
      event_types: ["payment.completed", "payment.failed"],
      debug_level: "DETAILED"
    }
  }
});

// Monitor webhook deliveries
debugStream.on('data', (response) => {
  if (response.response.delivery_attempt) {
    console.log('Delivery attempt:', response.response.delivery_attempt);
  }
});`
    },
    {
      name: 'Interactive Reconciliation',
      service: 'ReconciliationService',
      method: 'InteractiveReconciliation',
      description: 'Real-time reconciliation workflows',
      useCase: 'Accounting operations, variance resolution, audit trails',
      example: `// Reconciliation workflow example
const reconStream = client.interactiveReconciliation();

// Start reconciliation
reconStream.write({
  action: {
    start_reconciliation: {
      reconciliation_type: "DAILY_SETTLEMENT",
      date_range: {
        start_date: "2024-01-20",
        end_date: "2024-01-20"
      }
    }
  }
});

// Handle variance detection
reconStream.on('data', (response) => {
  if (response.result.variance_detected) {
    console.log('Variance detected:', response.result.variance_detected);
  }
});`
    }
  ];

  const codeExamples = {
    go: `// Go client example
package main

import (
    "context"
    "log"
    "google.golang.org/grpc"
    pb "github.com/your-org/fintech-proto/gen/go"
)

func main() {
    conn, err := grpc.Dial("localhost:50051", grpc.WithInsecure())
    if err != nil {
        log.Fatalf("Failed to connect: %v", err)
    }
    defer conn.Close()

    client := pb.NewPaymentServiceClient(conn)
    
    // Create a payment
    payment, err := client.CreatePayment(context.Background(), &pb.CreatePaymentRequest{
        Amount:   100.00,
        Currency: "USD",
        UserId:   "user_123",
    })
    
    if err != nil {
        log.Fatalf("Failed to create payment: %v", err)
    }
    
    log.Printf("Payment created: %s", payment.PaymentId)
}`,
    javascript: `// Node.js client example
const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');

const packageDefinition = protoLoader.loadSync('payment.proto');
const paymentProto = grpc.loadPackageDefinition(packageDefinition).fintech.payment.v1;

const client = new paymentProto.PaymentService('localhost:50051', 
    grpc.credentials.createInsecure());

// Create a payment
client.createPayment({
    amount: 100.00,
    currency: 'USD',
    userId: 'user_123'
}, (error, response) => {
    if (error) {
        console.error('Error:', error);
        return;
    }
    console.log('Payment created:', response.paymentId);
});`,
    python: `# Python client example
import grpc
import payment_pb2
import payment_pb2_grpc

def main():
    # Create a gRPC channel
    channel = grpc.insecure_channel('localhost:50051')
    
    # Create a client
    client = payment_pb2_grpc.PaymentServiceStub(channel)
    
    # Create a payment
    request = payment_pb2.CreatePaymentRequest(
        amount=100.00,
        currency='USD',
        user_id='user_123'
    )
    
    response = client.CreatePayment(request)
    print(f'Payment created: {response.payment_id}')

if __name__ == '__main__':
    main()`
  };

  const renderContent = () => {
    switch (activeSection) {
      case 'overview':
        return (
          <div className="space-y-8">
            <div>
              <h2 className="text-3xl font-bold text-gray-900  mb-4">gRPC Overview</h2>
              <p className="text-lg text-gray-600  mb-6">
                Our gRPC implementation provides high-performance, real-time APIs for financial operations. 
                Built on Protocol Buffers, it offers type safety, efficient serialization, and advanced 
                streaming capabilities.
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-blue-50  p-6 rounded-xl border border-blue-200 ">
                <h3 className="text-xl font-semibold text-blue-900  mb-3">Key Features</h3>
                <ul className="space-y-2 text-blue-800 ">
                  <li className="flex items-center gap-2">
                    <CheckCircleIcon className="h-5 w-5" />
                    Bidirectional streaming APIs
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircleIcon className="h-5 w-5" />
                    Real-time transaction monitoring
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircleIcon className="h-5 w-5" />
                    Interactive webhook debugging
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircleIcon className="h-5 w-5" />
                    Type-safe protocol buffers
                  </li>
                </ul>
              </div>

              <div className="bg-brand-500  p-6 rounded-xl border border-green-200 ">
                <h3 className="text-xl font-semibold text-secondary  mb-3">Benefits</h3>
                <ul className="space-y-2 text-secondary ">
                  <li className="flex items-center gap-2">
                    <CheckCircleIcon className="h-5 w-5" />
                    10x faster than REST APIs
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircleIcon className="h-5 w-5" />
                    Built-in load balancing
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircleIcon className="h-5 w-5" />
                    Automatic code generation
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircleIcon className="h-5 w-5" />
                    Multi-language support
                  </li>
                </ul>
              </div>
            </div>

            <div className="bg-gradient-to-r from-indigo-500 to-purple-600 text-primary p-8 rounded-xl">
              <h3 className="text-2xl font-bold mb-4">Connection Details</h3>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold mb-2">Development</h4>
                  <code className="bg-black/20 px-3 py-1 rounded text-sm">
                    localhost:50051
                  </code>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Production</h4>
                  <code className="bg-black/20 px-3 py-1 rounded text-sm">
                    grpc.fintech-os.com:443
                  </code>
                </div>
              </div>
            </div>
          </div>
        );

      case 'quickstart':
        return (
          <div className="space-y-8">
            <div>
              <h2 className="text-3xl font-bold text-gray-900  mb-4">Quick Start Guide</h2>
              <p className="text-lg text-gray-600  mb-6">
                Get up and running with our gRPC APIs in minutes.
              </p>
            </div>

            <div className="space-y-6">
              {[
                {
                  step: 1,
                  title: "Install gRPC Tools",
                  description: "Install the necessary tools for your language",
                  code: `# For Go
go install google.golang.org/protobuf/cmd/protoc-gen-go@latest
go install google.golang.org/grpc/cmd/protoc-gen-go-grpc@latest`,
                  language: "bash"
                },
                {
                  step: 2,
                  title: "Download Proto Files",
                  description: "Get the latest protocol buffer definitions",
                  code: `# Clone the proto repository
git clone https://github.com/your-org/fintech-proto.git
cd fintech-proto`,
                  language: "bash"
                },
                {
                  step: 3,
                  title: "Generate Client Code",
                  description: "Generate client libraries for your language",
                  code: `# For Go
protoc --go_out=. --go_opt=paths=source_relative \\
    --go-grpc_out=. --go-grpc_opt=paths=source_relative \\
    payment.proto`,
                  language: "bash"
                },
                {
                  step: 4,
                  title: "Connect & Test",
                  description: "Connect to the gRPC server and make your first call",
                  code: `// Test connection
grpcurl -plaintext localhost:50051 list
grpcurl -plaintext localhost:50051 fintech.payment.v1.PaymentService/GetPayment`,
                  language: "bash"
                }
              ].map((item) => (
                <div key={item.step} className="bg-white  rounded-xl p-6 border border-gray-200 ">
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 w-8 h-8 bg-blue-600 text-primary rounded-full flex items-center justify-center font-bold">
                      {item.step}
                    </div>
                    <div className="flex-1">
                      <h3 className="text-xl font-semibold text-gray-900  mb-2">
                        {item.title}
                      </h3>
                      <p className="text-gray-600  mb-4">
                        {item.description}
                      </p>
                      <div className="relative">
                        <button
                          onClick={() => handleCopy(item.code, `step-${item.step}`)}
                          className="absolute top-2 right-2 p-2 bg-gray-700 hover:bg-gray-600 rounded-md transition-colors"
                        >
                          <ClipboardDocumentIcon className="h-4 w-4 text-primary" />
                        </button>
                        <pre className="bg-gray-900 text-gray-300 p-4 rounded-lg overflow-x-auto">
                          <code>{item.code}</code>
                        </pre>
                        {copiedText === `step-${item.step}` && (
                          <div className="absolute top-2 right-12 bg-brand-500 text-primary px-2 py-1 rounded text-sm">
                            Copied!
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );

      case 'streaming':
        return (
          <div className="space-y-8">
            <div>
              <h2 className="text-3xl font-bold text-gray-900  mb-4">Streaming APIs</h2>
              <p className="text-lg text-gray-600  mb-6">
                Our bidirectional streaming APIs enable real-time, interactive workflows for financial operations.
              </p>
            </div>

            <div className="space-y-8">
              {streamingAPIs.map((api, index) => (
                <motion.div
                  key={api.name}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className="bg-white  rounded-xl p-6 border border-gray-200 "
                >
                  <div className="flex items-start gap-4 mb-6">
                    <div className="flex-shrink-0 w-12 h-12 bg-purple-600 text-primary rounded-lg flex items-center justify-center">
                      <BoltIcon className="h-6 w-6" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-xl font-semibold text-gray-900  mb-2">
                        {api.name}
                      </h3>
                      <p className="text-gray-600  mb-2">
                        {api.description}
                      </p>
                      <div className="flex items-center gap-4 text-sm text-gray-500 ">
                        <span>Service: {api.service}</span>
                        <span>Method: {api.method}</span>
                      </div>
                    </div>
                  </div>

                  <div className="mb-4">
                    <h4 className="font-semibold text-gray-900  mb-2">Use Cases</h4>
                    <p className="text-gray-600  text-sm">
                      {api.useCase}
                    </p>
                  </div>

                  <div className="relative">
                    <button
                      onClick={() => handleCopy(api.example, api.name)}
                      className="absolute top-2 right-2 p-2 bg-gray-700 hover:bg-gray-600 rounded-md transition-colors z-10"
                    >
                      <ClipboardDocumentIcon className="h-4 w-4 text-primary" />
                    </button>
                    <pre className="bg-gray-900 text-gray-300 p-4 rounded-lg overflow-x-auto">
                      <code>{api.example}</code>
                    </pre>
                    {copiedText === api.name && (
                      <div className="absolute top-2 right-12 bg-brand-500 text-primary px-2 py-1 rounded text-sm">
                        Copied!
                      </div>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        );

      case 'examples':
        return (
          <div className="space-y-8">
            <div>
              <h2 className="text-3xl font-bold text-gray-900  mb-4">Code Examples</h2>
              <p className="text-lg text-gray-600  mb-6">
                Complete examples in multiple programming languages.
              </p>
            </div>

            <div className="space-y-8">
              {Object.entries(codeExamples).map(([language, code]) => (
                <div key={language} className="bg-white  rounded-xl p-6 border border-gray-200 ">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xl font-semibold text-gray-900  capitalize">
                      {language === 'javascript' ? 'Node.js' : language}
                    </h3>
                    <button
                      onClick={() => handleCopy(code, language)}
                      className="p-2 bg-gray-600 hover:bg-gray-500 rounded-md transition-colors"
                    >
                      <ClipboardDocumentIcon className="h-4 w-4 text-primary" />
                    </button>
                  </div>
                  <pre className="bg-gray-900 text-gray-300 p-4 rounded-lg overflow-x-auto">
                    <code>{code}</code>
                  </pre>
                  {copiedText === language && (
                    <div className="mt-2 text-secondary text-sm">
                      ✓ Code copied to clipboard
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        );

      default:
        return (
          <div className="text-center py-12">
            <p className="text-gray-600 ">
              Select a section from the sidebar to view content.
            </p>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50   ">
      <div className="pt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid lg:grid-cols-4 gap-8">
            {/* Sidebar */}
            <div className="lg:col-span-1">
              <div className="bg-white  rounded-xl p-6 border border-gray-200  sticky top-8">
                <h3 className="text-lg font-semibold text-gray-900  mb-4 flex items-center gap-2">
                  <BoltIcon className="h-5 w-5" />
                  gRPC Guide
                </h3>
                <nav className="space-y-2">
                  {sections.map((section) => (
                    <button
                      key={section.id}
                      onClick={() => setActiveSection(section.id)}
                      className={`w-full text-left p-3 rounded-lg transition-colors flex items-center gap-3 ${
                        activeSection === section.id
                          ? 'bg-blue-600 text-primary'
                          : 'text-gray-700  hover:bg-gray-100 :bg-gray-700'
                      }`}
                    >
                      <section.icon className="h-5 w-5" />
                      {section.title}
                    </button>
                  ))}
                </nav>
              </div>
            </div>

            {/* Main Content */}
            <div className="lg:col-span-3">
              <div className="bg-white  rounded-xl p-8 border border-gray-200 ">
                {renderContent()}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GRPCGuide; 