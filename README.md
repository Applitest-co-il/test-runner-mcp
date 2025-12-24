# Test Runner MCP Server

🤖 **Connect AI Assistants to Your Testing Infrastructure**

A Model Context Protocol (MCP) server that enables AI assistants like **Claude Desktop** and **Google Gemini** to interact with your web and mobile testing infrastructure through natural language.

> **Powered by**: [@applitest/test-runner](https://www.npmjs.com/package/@applitest/test-runner) ([GitHub](https://github.com/Applitest-co-il/test-runner)) - Enterprise-grade browser & mobile automation engine  
> **MCP Version**: 1.0+ compatible  
> **Supported Clients**: Claude Desktop 0.7+, Gemini CLI, Custom MCP clients

## 🎯 What This Enables

Transform how you interact with test automation:

- **"Open a browser session for https://example.com and click the login button"**
- **"Test the checkout flow and verify the total is correct"**
- **"Get the accessibility tree and check for ARIA violations"**
- **"Run a mobile test on the iOS simulator"**
- **"Generate test-runner JSON for this workflow so I can replay it without AI"** 💡

## 🚀 Key Features

### Core Technology

- 🎯 **Powered by Applitest Test Runner** - Uses [@applitest/test-runner](https://www.npmjs.com/package/@applitest/test-runner) ([GitHub](https://github.com/Applitest-co-il/test-runner)) as the automation engine for all browser and mobile interactions
- 🔄 **AI-Generated → Standalone Tests** - Generate test-runner JSON format that can be replayed without MCP or AI
- 📝 **Export & Reuse** - Convert AI conversations into reusable test automation scripts

### Capabilities

- 🗣️ **Natural Language Testing** - Control test automation through conversations
- 🌐 **Multi-Browser Support** - Chrome, Firefox, Edge automation via test-runner
- 📱 **Mobile Testing** - iOS and Android via Appium integration through test-runner\*
- 🔍 **Accessibility Analysis** - Built-in accessibility tree inspection
- 🤝 **Multi-Client Support** - Works with Claude Desktop, Gemini, and more
- 🛠️ **Developer Tools** - Full debugging with MCP Inspector

> ⚠️ **Note on Mobile Testing**: While [@applitest/test-runner](https://www.npmjs.com/package/@applitest/test-runner) fully supports native mobile app testing for iOS and Android, the MCP server does not yet generate fully validated test-runner JSON for native mobile apps. Web and mobile web testing are fully supported. Native mobile app support via MCP is coming soon.

## 💰 Cost-Effective Testing Strategy

**The Economic Advantage:**

1. **Use AI to Design**: Let Claude/Gemini help you create and refine test scenarios
2. **Generate JSON Format**: Get test-runner JSON output from your AI conversations
3. **Replay Without AI**: Execute the same tests repeatedly using just test-runner (no AI costs!)
4. **Iterate When Needed**: Return to AI only when you need to modify or create new tests

**Example Workflow:**

```
1. AI Conversation → Design test flow with Claude
2. Generate → Export as test-runner JSON
3. Save → Store JSON in your test repository
4. Execute → Run unlimited times via test-runner CLI (free!)
5. CI/CD → Integrate in your pipeline without MCP overhead
```

## 📋 Prerequisites

- **Node.js** 20+ (recommended 24+)
- **npm** or **yarn**
- **[@applitest/test-runner](https://www.npmjs.com/package/@applitest/test-runner)** (installed automatically as dependency)
- For web testing: Chrome, Firefox, or Edge browser
- For mobile testing: Appium server and simulators/emulators

## ⚡ Quick Start

```bash
# Clone and install
git clone https://github.com/Applitest-co-il/test-runner-mcp.git
cd test-runner-mcp
npm install
npm run build

# The test-runner dependency is included automatically
# No separate installation of @applitest/test-runner needed!
```

## 🚀 Installation & Setup

### Step 1: Install Dependencies

```bash
cd test-runner-mcp
npm install
npm run build
```

> 💡 **Note**: The [@applitest/test-runner](https://www.npmjs.com/package/@applitest/test-runner) ([GitHub](https://github.com/Applitest-co-il/test-runner)) package is installed automatically as a core dependency

### Step 2: Choose Your AI Assistant

## 🎭 Deployment Options

### Option 1: Claude Desktop (Recommended)

**Requirements**: Claude Desktop 0.7.0 or later

#### 1. Locate Configuration File

- **Windows**: `%APPDATA%\Claude\claude_desktop_config.json`
- **macOS**: `~/Library/Application Support/Claude/claude_desktop_config.json`
- **Linux**: `~/.config/Claude/claude_desktop_config.json`

#### 2. Add MCP Server Configuration

```json
{
  "mcpServers": {
    "test-runner": {
      "command": "node",
      "args": ["/absolute/path/to/test-runner-mcp/dist/cli.js"]
    }
  }
}
```

**Example (Windows)**:

```json
{
  "mcpServers": {
    "test-runner": {
      "command": "node",
      "args": ["C:\\Users\\YourName\\Projects\\test-runner-mcp\\dist\\cli.js"]
    }
  }
}
```

**Example (macOS/Linux)**:

```json
{
  "mcpServers": {
    "test-runner": {
      "command": "node",
      "args": ["/Users/yourname/projects/test-runner-mcp/dist/cli.js"]
    }
  }
}
```

#### 3. Restart Claude Desktop

Completely quit and restart Claude Desktop (not just close the window).

#### 4. Verify Installation

In Claude, look for the 🔌 icon or type:

- _"List available MCP tools"_
- _"What test runner tools do you have?"_

You should see tools like `open-session`, `close-session`, `do-step`, and `get-accessibility-tree`.

---

### Option 2: Google Gemini CLI

**Requirements**: Gemini CLI with MCP support

> 📚 **Documentation**: See [Gemini CLI MCP Server Guide](https://geminicli.com/docs/tools/mcp-server/)

#### 1. Install Gemini CLI

```bash
npm install -g @google/genai-cli
```

#### 2. Configure MCP Server

**Option A: Workspace Configuration (Recommended)**

Create `<project>/.gemini/settings.json` in your workspace:

```json
{
  "mcpServers": {
    "test-runner": {
      "command": "node",
      "args": ["./dist/cli.js"]
    }
  }
}
```

Then start Gemini from your workspace directory:

```bash
cd /path/to/test-runner-mcp
gemini
```

**Option B: System-Wide Configuration**

Configure MCP servers globally for all users on the system:

- **Linux**: `/etc/gemini-cli/settings.json`
- **Windows**: `C:\ProgramData\gemini-cli\settings.json`
- **macOS**: `/Library/Application Support/GeminiCli/settings.json`

```json
{
  "mcpServers": {
    "test-runner": {
      "command": "node",
      "args": ["/absolute/path/to/test-runner-mcp/dist/cli.js"]
    }
  }
}
```

> 💡 **Note**: Use absolute paths. On Windows, escape backslashes (`C:\\path\\to\\file`) or use forward slashes (`C:/path/to/file`)

Start Gemini normally:

```bash
gemini  # Automatically loads system settings
```

> 📌 **Tip**: Override the system settings path using the `GEMINI_CLI_SYSTEM_SETTINGS_PATH` environment variable if needed

#### 3. Test the Connection

In Gemini CLI:

```
> use mcp test-runner
> call tool open-session with {"type": "web", "url": "https://example.com", "browser": "chrome"}
```

---

### Option 3: HTTP Server Mode

For custom integrations or web applications:

#### 1. Start HTTP Server

```bash
npm run http
# Server starts on http://localhost:3000
```

#### 2. Configure Custom Port (Optional)

Create `.env` file:

```env
MCP_SERVER_PORT=3000
```

#### 3. Send MCP Requests

```bash
curl -X POST http://localhost:3000/mcp \
  -H "Content-Type: application/json" \
  -d '{
    "jsonrpc": "2.0",
    "id": 1,
    "method": "tools/list"
  }'
```

---

### Option 4: Direct CLI Usage

For scripting or testing:

```bash
# Standard mode
npm run cli

# Debug mode
npm run cli:debug
```

## 🔧 Available Tools

Once connected to an AI assistant, these tools become available:

### `open-session`

Opens a test automation session using **Applitest Test Runner**

```
Parameters:
- type: 'web' | 'mobile' | 'api'
- url: Target URL (for web sessions)
- browser: 'chrome' | 'firefox' | 'edge'

Returns: sessionId, sessionType

Note: Currently optimized for web and mobile web sessions.
Native mobile app testing is supported by test-runner but
not yet fully integrated in MCP JSON generation.
```

### `close-session`

Closes the current test-runner session

```
Parameters:
- sessionId: ID of session to close
```

### `get-accessibility-tree`

Retrieves page accessibility information via **test-runner**

```
Parameters:
- sessionId: Active session ID
- selector: Optional CSS selector to focus on

Returns: Accessibility tree structure
```

### `do-step`

Performs test automation actions through **test-runner engine**

```
Parameters:
- sessionId: Active session ID
- command: Action to perform (click, input-text, etc.)
- selector: Target element selector
- value: Input value (for text input)
- position: Element index (if multiple matches)
- operator: Optional operator for assertions

Note: All commands use test-runner's automation engine
Full command list: https://github.com/Applitest-co-il/test-runner/blob/main/docs/step-commands.md
```

## 📋 Available Prompts

### `generate-test-json`

Generates test-runner JSON format from your AI conversation

```
Use this prompt to:
1. Convert AI-guided test flows into test-runner JSON
2. Save the JSON for unlimited replay without AI costs
3. Share tests with your team
4. Integrate into CI/CD pipelines

Example usage in Claude:
"Use the generate-test-json prompt to create a reusable test
 for the login flow we just executed"
```

**Benefits:**

- ✅ One-time AI cost to design the test
- ✅ Zero cost for subsequent executions
- ✅ No MCP overhead in production
- ✅ Standard test-runner JSON format
- ✅ Version control friendly
- ✅ Team collaboration ready

```
Parameters:
- sessionId: Active session ID
- command: Action to perform (click, input-text, etc.)
- selector: Target element selector
- value: Input value (for text input)
- position: Element index (if multiple matches)
```

## 🤖 Example Conversations

### With Claude Desktop - Interactive Testing

**You**: "Open a web session for https://example.com in Chrome"

**Claude**: ✅ _Uses `open-session` tool (powered by test-runner)_  
"I've opened a Chrome browser session at https://example.com. Session ID: abc123"

---

**You**: "Click on the Login button"

**Claude**: ✅ _Uses `do-step` tool (executes via test-runner)_  
"I clicked the Login button successfully."

---

**You**: "Type 'admin@test.com' in the email field"

**Claude**: ✅ _Uses `do-step` with command='input-text'_  
"I've entered the email address."

---

**You**: "What's the accessibility tree for the login form?"

**Claude**: ✅ _Uses `get-accessibility-tree` (test-runner's built-in feature)_  
"Here's the accessibility structure of the login form: [tree data]"

---

### 💰 **Effective Workflow - Generate Reusable Tests**

**You**: "Now use the generate-test-json prompt to create a reusable test from what we just did"

**Claude**: ✅ _Uses `generate-test-json` prompt_  
"Here's the test-runner JSON format for your login flow:

```json
{
  "suites": [
    {
      "name": "Login Flow Test",
      "tests": [
        {
          "name": "Complete Login",
          "type": "web",
          "steps": [
            {
              "command": "navigate",
              "value": "https://example.com"
            },
            {
              "command": "click",
              "selectors": ["button=Login"]
            },
            {
              "command": "input-text",
              "selectors": ["input[type='email']"],
              "value": "admin@test.com"
            }
          ]
        }
      ]
    }
  ]
}
```

**Save this JSON and run it anytime with test-runner CLI - no AI needed!**

````bash
# Run unlimited times without MCP/AI costs
npx @applitest/test-runner --config login-test.json
```"

---

**Key Benefit**: You just paid for AI once to design the test. Now you can run it thousands of times in CI/CD with zero AI costs! 🎉

---

### With Gemini CLI

```bash
gemini> use mcp test-runner

# Open session via test-runner
gemini> call tool open-session with {
  "type": "web",
  "url": "https://google.com",
  "browser": "chrome"
}
# Returns: { sessionId: "xyz789", sessionType: "web" }

gemini> call tool do-step with {
  "sessionId": "xyz789",
  "command": "click",
  "selector": "button[name='btnK']"
}
# Returns: { result: true }

# Generate reusable test-runner JSON
gemini> call prompt generate-test-json with { "sessionId": "xyz789" }
# Returns test-runner JSON format you can save and replay
````

## 🏗️ Architecture & How It Works

### The Test Runner Core

This MCP server is a **thin wrapper** around [@applitest/test-runner](https://www.npmjs.com/package/@applitest/test-runner) ([GitHub](https://github.com/Applitest-co-il/test-runner)), which handles all the heavy lifting:

```
┌─────────────────┐
│  Claude/Gemini  │  ← Natural language input
└────────┬────────┘
         │ MCP Protocol
┌────────▼─────────┐
│   MCP Server     │  ← This project (translation layer)
└────────┬─────────┘
         │ Direct API calls
┌────────▼──────────┐
│ Test Runner Core │  ← @applitest/test-runner
│  - WebDriver      │     (does all the work)
│  - Appium         │
│  - Browser Control│
└───────────────────┘
```

**What the MCP Server Does:**

- Translates natural language → test-runner API calls
- Manages session state
- Provides prompt templates for JSON generation
- Handles MCP protocol communication

**What Test Runner Does:**

- All browser automation (Chrome, Firefox, Edge)
- All mobile automation (iOS, Android via Appium)
- Element selection and interaction
- Accessibility tree inspection
- Screenshot capture
- Test execution and validation

### Why This Architecture is Economical

1. **AI designs the test** → MCP translates to test-runner commands
2. **Prompt generates JSON** → Pure test-runner format (no MCP dependency)
3. **JSON executes standalone** → test-runner CLI runs it (no AI/MCP needed!)
4. **Result**: Pay for AI design once, run for free forever

## 🛠️ Development & Testing

### MCP Inspector (Recommended for Development)

Test your server interactively before connecting to Claude:

```bash
# Start the MCP inspector
npm run inspector:cli

# Or test HTTP mode
npm run inspector:http
```

Opens a web interface where you can test all tools manually.

### Direct Testing

```bash
# Run the CLI version
npm run cli

# Run with debugging
npm run cli:debug

# Run HTTP server
npm run http

# HTTP with debugging
npm run http:debug
```

- Send requests to the MCP server
- View responses in real-time
- Test different MCP operations
- Debug communication issues

### Automated Testing

The framework includes automated tests for MCP server functionality. Run them with:

```bash
npm test -- --grep "MCP"
```

## 🏗️ Architecture Overview

The MCP server is implemented in TypeScript and consists of several key components:

### Core Files

- `src/mcpserver/cli.ts` - Command-line interface and entry point
- `src/mcpserver/mcp-service.ts` - Main MCP server implementation
- `src/mcpserver/http.ts` - HTTP transport layer (if needed)

### Transport Layer

The MCP server uses **stdio transport** for communication with Claude Desktop, which provides:

- Reliable bidirectional communication
- JSON-RPC message protocol
- Error handling and recovery
- Process lifecycle management

### Available Tools and Resources

The MCP server exposes various tools and resources that AI assistants can use:

- **Test Execution** - Run individual tests or test suites
- **Configuration Management** - Read and modify test configurations
- **Result Analysis** - Access test results and generate reports
- **Environment Management** - Control test environments and settings

## 🐛 Troubleshooting

### Claude Desktop Issues

#### Server Not Appearing

1. **Check configuration file location**
   - Windows: Press `Win+R`, type `%APPDATA%\Claude` and verify `claude_desktop_config.json` exists
   - Mac: Check `~/Library/Application Support/Claude/`
   - Verify JSON syntax is valid (use a JSON validator)

2. **Verify paths are absolute**

   ```json
   // ❌ Wrong (relative path)
   "args": ["./dist/cli.js"]

   // ✅ Correct (absolute path)
   "args": ["C:\\Users\\YourName\\Projects\\test-runner-mcp\\dist\\cli.js"]
   ```

3. **Check Claude Desktop version**
   - Go to Help → About Claude Desktop
   - Ensure version is 0.7.0 or later
   - Update if necessary

4. **View logs**
   - Windows: `%APPDATA%\Claude\logs`
   - Mac: `~/Library/Logs/Claude`
   - Look for MCP-related errors

#### Tools Not Working

1. **Rebuild the server**

   ```bash
   npm run build
   ```

2. **Test with inspector first**

   ```bash
   npm run inspector:cli
   ```

3. **Check dependencies**
   ```bash
   npm install
   npm list @applitest/test-runner
   ```

#### Common Errors

**"Cannot find module"**

```bash
# Solution: Ensure all dependencies installed
npm install
npm run build
```

**"ENOENT: no such file or directory"**

```json
// Solution: Use absolute paths and escape backslashes on Windows
"args": ["C:\\Projects\\test-runner-mcp\\dist\\cli.js"]
```

---

### Gemini CLI Issues

#### MCP Config Not Loading

1. **Verify config file location**

   ```bash
   cat ~/.config/gemini/mcp_config.json
   ```

2. **Check JSON syntax**

   ```bash
   # Validate JSON
   cat ~/.config/gemini/mcp_config.json | python -m json.tool
   ```

3. **Specify config explicitly**
   ```bash
   gemini --mcp-config /full/path/to/mcp_config.json
   ```

#### Tools Not Available

1. **List available servers**

   ```bash
   gemini> list mcp servers
   ```

2. **Connect to specific server**

   ```bash
   gemini> use mcp test-runner
   ```

3. **Check Gemini CLI version**
   ```bash
   gemini --version
   # Ensure MCP support is available
   ```

---

### General Connection Issues

**Port conflicts (HTTP mode)**

```bash
# Check if port 3000 is in use
netstat -an | grep 3000  # Mac/Linux
netstat -an | findstr 3000  # Windows

# Use different port
# Edit .env file:
MCP_SERVER_PORT=3001
```

**Node.js version issues**

```bash
# Check version
node --version

# Should be 18.x or 20.x
# Update if needed
```

**Permission errors**

```bash
# On Mac/Linux, may need to make CLI executable
chmod +x dist/cli.js
```

## 🔗 Advanced Configuration

### Multi-Environment Setup (Claude Desktop)

Run different instances for dev, staging, and production:

```json
{
  "mcpServers": {
    "test-runner-dev": {
      "command": "node",
      "args": ["C:\\dev\\test-runner-mcp\\dist\\cli.js"],
      "env": {
        "NODE_ENV": "development",
        "TEST_BASE_URL": "http://localhost:3000"
      }
    },
    "test-runner-staging": {
      "command": "node",
      "args": ["C:\\staging\\test-runner-mcp\\dist\\cli.js"],
      "env": {
        "NODE_ENV": "staging",
        "TEST_BASE_URL": "https://staging.example.com"
      }
    },
    "test-runner-prod": {
      "command": "node",
      "args": ["C:\\prod\\test-runner-mcp\\dist\\cli.js"],
      "env": {
        "NODE_ENV": "production",
        "TEST_BASE_URL": "https://example.com"
      }
    }
  }
}
```

### Custom Environment Variables

```json
{
  "mcpServers": {
    "test-runner": {
      "command": "node",
      "args": ["/path/to/dist/cli.js"],
      "env": {
        "APPIUM_HOST": "localhost",
        "APPIUM_PORT": "4723",
        "HEADLESS": "true",
        "SCREENSHOT_PATH": "/tmp/screenshots"
      }
    }
  }
}
```

### Gemini CLI Advanced Usage

> 📚 **Reference**: [Gemini CLI MCP Server Documentation](https://geminicli.com/docs/tools/mcp-server/)

#### Workspace-Specific Configuration

For project-specific MCP servers, create `.gemini/settings.json` in your project root:

```json
{
  "mcpServers": {
    "test-runner": {
      "command": "node",
      "args": ["./dist/cli.js"],
      "env": {
        "NODE_ENV": "development",
        "HEADLESS": "false"
      }
    }
  }
}
```

Start Gemini from project root:

```bash
cd /path/to/test-runner-mcp
gemini  # Automatically loads .gemini/settings.json
```

#### Custom Configuration per Session

```bash
# Start with specific config
gemini --mcp-config ~/configs/test-config.json

# Override environment variables
MCP_SERVER_PORT=3001 gemini --mcp-config ~/configs/test-config.json
```

#### Scripted Testing

Create a Gemini script file `test-script.gemini`:

```
use mcp test-runner
call tool open-session with {"type":"web","url":"https://example.com","browser":"chrome"}
call tool do-step with {"sessionId":"[SESSION_ID]","command":"click","selector":"#login"}
call tool close-session with {"sessionId":"[SESSION_ID]"}
```

Run it:

```bash
gemini --script test-script.gemini
```

### HTTP API Integration

For custom clients or webhooks:

```javascript
// POST to http://localhost:3000/mcp
{
  "jsonrpc": "2.0",
  "id": 1,
  "method": "tools/call",
  "params": {
    "name": "open-session",
    "arguments": {
      "type": "web",
      "url": "https://example.com",
      "browser": "chrome"
    }
  }
}
```

## 🆘 Getting Help

### Quick Diagnostics

1. **Test with MCP Inspector** (fastest way to debug)

   ```bash
   npm run inspector:cli
   ```

   Open the URL shown to test all tools interactively

2. **Check Build Status**

   ```bash
   npm run build
   # Should complete without errors
   ```

3. **Verify Dependencies**

   ```bash
   npm list @applitest/test-runner @modelcontextprotocol/sdk
   ```

4. **Enable Debug Logging**

   ```bash
   # For CLI
   npm run cli:debug

   # For HTTP
   npm run http:debug
   ```

### Platform-Specific Logs

**Claude Desktop:**

- Windows: `%APPDATA%\Claude\logs\mcp*.log`
- Mac: `~/Library/Logs/Claude/mcp*.log`
- In app: Help → View Logs

**Gemini CLI:**

```bash
# Enable verbose logging
gemini --verbose --mcp-config ~/.config/gemini/mcp_config.json
```

### Common Solutions

| Issue               | Solution                                               |
| ------------------- | ------------------------------------------------------ |
| Server not detected | Check absolute paths, rebuild with `npm run build`     |
| Tools unavailable   | Restart Claude/Gemini, check MCP version compatibility |
| Module errors       | Run `npm install`, verify Node.js 18+                  |
| Port conflicts      | Change `MCP_SERVER_PORT` in `.env` file                |
| Permission denied   | `chmod +x dist/cli.js` on Mac/Linux                    |

### Report Issues

If you encounter problems:

1. ✅ Test with MCP Inspector first
2. 📋 Collect relevant logs
3. 🐛 [Open a GitHub issue](https://github.com/Applitest-co-il/test-runner-mcp/issues)
4. 📧 Include:
   - Platform (Windows/Mac/Linux)
   - Client (Claude Desktop/Gemini CLI)
   - Node.js version
   - Error messages
   - Config file (redact sensitive info)

## 🌟 What's Next?

### Extend Your Setup

- **Custom Commands**: Add domain-specific test steps
- **CI/CD Integration**: Trigger tests from your pipeline
- **Multi-Session**: Handle parallel browser sessions
- **Custom Assertions**: Build validation rules for your app

### Resources

#### Applitest Test Runner

- 📦 [NPM Package](https://www.npmjs.com/package/@applitest/test-runner) - Install and documentation
- 🔧 [GitHub Repository](https://github.com/Applitest-co-il/test-runner) - Source code and examples
- 📚 [Step Commands Reference](https://github.com/Applitest-co-il/test-runner/blob/main/docs/step-commands.md) - All available automation commands

#### MCP & AI Clients

- 📖 [MCP Specification](https://modelcontextprotocol.io/) - Latest MCP protocol docs
- 🤖 [Claude Desktop](https://claude.ai/desktop) - Download Claude Desktop
- 💎 [Gemini CLI](https://ai.google.dev/gemini-api/docs/cli) - Gemini command-line docs
- 🔍 [MCP Inspector](https://github.com/modelcontextprotocol/inspector) - Debug tool

#### This Project

- 🐛 [GitHub Issues](https://github.com/Applitest-co-il/test-runner-mcp/issues) - Report bugs
- 💬 [Discussions](https://github.com/Applitest-co-il/test-runner-mcp/discussions) - Ask questions

### Version Compatibility

| Client         | Minimum Version | Status             |
| -------------- | --------------- | ------------------ |
| Claude Desktop | 0.7.0           | ✅ Fully Supported |
| Gemini CLI     | Latest          | ⚠️ Experimental    |
| Custom Clients | MCP 1.0+        | ✅ Supported       |

---

**Ready to start?** Jump to [Installation & Setup](#-installation--setup) 🚀
