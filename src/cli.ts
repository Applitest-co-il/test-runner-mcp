#!/usr/bin/env node
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { createTestRunnerMcpServer } from './mcp-service';

/**
 * CLI interface for the Test Runner MCP server
 * Uses stdio transport for Claude Desktop integration
 */
async function main() {
    // Create the MCP server
    const server = createTestRunnerMcpServer();

    // Create stdio transport
    const transport = new StdioServerTransport();

    // Connect server to transport with timeout handling
    try {
        await server.connect(transport);
        console.error('MCP Test Runner Proxy CLI server running on stdio...');
    } catch (error) {
        console.error('Failed to connect server to transport:', error);
        process.exit(1);
    }
}

main().catch((error) => {
    console.error('Failed to start MCP Test Runner Proxy CLI server:', error);
    process.exit(1);
});
