import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { StreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/streamableHttp.js';
import { createTestRunnerMcpServer, SERVER_CONFIG } from './mcp-service';

dotenv.config({ path: '.env', debug: true });
const PORT = process.env.MCP_SERVER_PORT || 3000;

/**
 * HTTP interface for the MCP Hello World server
 * Provides web dashboard and MCP endpoint
 */
async function main() {
  const app = express();

  // Middleware
  app.use(cors());
  app.use(express.json());

  // Create the MCP server
  const server = createTestRunnerMcpServer();

  // MCP endpoint - handles all MCP communication
  app.post('/mcp', async (req, res) => {
    try {
      // Create a new transport for each request to prevent request ID collisions
      const transport = new StreamableHTTPServerTransport({
        sessionIdGenerator: undefined,
        enableJsonResponse: true,
      });

      res.on('close', () => {
        transport.close();
      });

      await server.connect(transport);
      await transport.handleRequest(req, res, req.body);
    } catch (error) {
      console.error('Error handling MCP request:', error);
      if (!res.headersSent) {
        res.status(500).json({
          jsonrpc: '2.0',
          error: {
            code: -32603,
            message: 'Internal server error',
          },
          id: null,
        });
      }
    }
  });

  // Health check endpoint
  app.get('/health', (_, res) => {
    res.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      server: SERVER_CONFIG.name,
      version: SERVER_CONFIG.version,
    });
  });

  // API info endpoint
  app.get('/api/info', (_, res) => {
    res.json({
      server: SERVER_CONFIG,
      endpoints: {
        mcp: '/mcp',
        health: '/health',
        info: '/api/info',
        dashboard: '/',
      },
    });
  });

  // Web dashboard
  app.get('/', (_, res) => {
    res.send(`
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>MCP Test Runner Proxy Server</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            max-width: 800px;
            margin: 0 auto;
            padding: 2rem;
            background: #f5f5f5;
        }
        .container {
            background: white;
            border-radius: 8px;
            padding: 2rem;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        h1 { color: #333; border-bottom: 2px solid #007acc; padding-bottom: 0.5rem; }
        h2 { color: #555; margin-top: 2rem; }
        .status { padding: 1rem; background: #e8f5e8; border-radius: 4px; margin: 1rem 0; }
        .endpoint { background: #f8f9fa; padding: 1rem; border-radius: 4px; margin: 0.5rem 0; font-family: monospace; }
        .tools, .resources { background: #f0f8ff; padding: 1rem; border-radius: 4px; margin: 1rem 0; }
        ul { margin: 0.5rem 0; }
        .test-section { background: #fff9e6; padding: 1rem; border-radius: 4px; margin: 1rem 0; }
        button { background: #007acc; color: white; border: none; padding: 0.5rem 1rem; border-radius: 4px; cursor: pointer; }
        button:hover { background: #005a9e; }
        #testResult { margin-top: 1rem; padding: 1rem; background: #f8f9fa; border-radius: 4px; white-space: pre-wrap; font-family: monospace; }
    </style>
</head>
<body>
    <div class="container">
        <h1>🚀 Test Runner MCP Server</h1>
        
        <div class="status">
            ✅ <strong>Server Status:</strong> Running on port ${PORT}
            <br>📅 <strong>Started:</strong> ${new Date().toLocaleString()}
        </div>

        <h2>📡 API Endpoints</h2>
        <div class="endpoint">POST /mcp - MCP Protocol Endpoint</div>
        <div class="endpoint">GET /health - Health Check</div>
        <div class="endpoint">GET /api/info - Server Information</div>
        <div class="endpoint">GET / - This Dashboard</div>

        <h2>🛠️ Available Tools</h2>
        <div class="tools">
            <ul>
                ${SERVER_CONFIG.tools.map(tool => `<li><strong>${tool}</strong></li>`).join('')}
            </ul>
        </div>

        <h2>📚 Available Resources</h2>
        <div class="resources">
            <ul>
                ${SERVER_CONFIG.resources.map(resource => `<li><strong>${resource}</strong></li>`).join('')}
            </ul>
        </div>

        <h2>💬 Available Prompts</h2>
        <div class="resources">
            <ul>
                ${SERVER_CONFIG.prompts.map(prompt => `<li><strong>${prompt}</strong></li>`).join('')}
            </ul>
        </div>

        <h2>🔧 Test Tools</h2>
        <div class="test-section">
            <button onclick="testOpenSessionTool()">Test Open Session Tool</button>
            <button onclick="testCloseSessionTool()">Test Close Session Tool</button>
            <button onclick="testHealthCheck()">Test Health Check</button>
            <div id="testResult"></div>
        </div>

        <h2>🔌 Claude Desktop Integration</h2>
        <p>To connect this server to Claude Desktop using HTTP transport:</p>
        <div class="endpoint">
{
  "mcpServers": {
    "test-runner-proxy": {
      "type": "http",
      "url": "http://localhost:${PORT}/mcp"
    }
  }
}
        </div>
        
        <p>Or for stdio transport, use the CLI interface instead.</p>
    </div>

    <script>
        async function testOpenSessionTool() {
            const result = document.getElementById('testResult');
            result.textContent = 'Testing open-session tool...';
            
            try {
                const response = await fetch('/mcp', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        jsonrpc: '2.0',
                        id: 1,
                        method: 'tools/call',
                        params: {
                            name: 'open-session',
                            arguments: { url: 'https://applitest.co.il', browser: 'chrome' }
                        }
                    })
                });
                const data = await response.json();
                result.textContent = JSON.stringify(data, null, 2);
            } catch (error) {
                result.textContent = 'Error: ' + error.message;
            }
        }

        async function testCloseSessionTool() {
            const result = document.getElementById('testResult');
            result.textContent = 'Testing close-session tool...';
            
            try {
                const response = await fetch('/mcp', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        jsonrpc: '2.0',
                        id: 1,
                        method: 'tools/call',
                        params: {
                            name: 'close-session',
                            arguments: { sessionId: 'test-session-id' }
                        }
                    })
                });
                const data = await response.json();
                result.textContent = JSON.stringify(data, null, 2);
            } catch (error) {
                result.textContent = 'Error: ' + error.message;
            }
        }

        async function testHealthCheck() {
            const result = document.getElementById('testResult');
            result.textContent = 'Testing health check...';
            
            try {
                const response = await fetch('/health');
                const data = await response.json();
                result.textContent = JSON.stringify(data, null, 2);
            } catch (error) {
                result.textContent = 'Error: ' + error.message;
            }
        }
    </script>
</body>
</html>
    `);
  });

  // Start server
  app.listen(PORT, () => {
    console.log(`🚀 Test Runner MCP HTTP server running on port ${PORT}`);
    console.log(`📊 Dashboard: http://localhost:${PORT}`);
    console.log(`🔌 MCP endpoint: http://localhost:${PORT}/mcp`);
    console.log(`❤️ Health check: http://localhost:${PORT}/health`);
  });
}

main().catch(error => {
  console.error('Failed to start MCP HTTP server:', error);
  process.exit(1);
});
