import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import {
  openSession,
  runSession,
  closeSession,
  getAxTree,
  SessionResult,
  SuiteConfiguration,
  TestConfiguration,
  TestRunnerOptions,
  TestStep,
  logger,
  LogLevel,
  getDomTree,
} from '@applitest/test-runner';
import { z } from 'zod';

let currentSessionId: string | null = null;
let currentSessionType: 'web' | 'mobile' | 'api' | 'mixed' | null = null;

function validateSession(
  sessionId: string,
  errorStructuredContent: any | null
): { valid: boolean; response?: any } {
  if (sessionId !== currentSessionId) {
    const result = {
      valid: false,
      response: {
        content: [
          {
            type: 'text',
            text: `Error: Session ID "${sessionId}" does not match the current open session.`,
          },
        ],
        ...(errorStructuredContent && { structuredContent: errorStructuredContent }),
      },
    };
    return result;
  }
  return { valid: true };
}

/**
 * Creates and configures an MCP server with test runner proxy functionalities
 * This service can be used by both CLI and HTTP interfaces
 */
export function createTestRunnerMcpServer(): McpServer {
  const server = new McpServer({
    name: 'test-runner',
    version: '1.0.0',
  });

  logger.setLogLevel(LogLevel.NONE);

  //#region Register tools

  // Register open-session tool
  server.registerTool(
    'open-session',
    {
      title: 'Open Session Tool',
      description:
        'Open a local test runner session for a given URL and browser:\n' +
        '- If type is "web", a web session will be opened with indicated browser\n' +
        '- If type is "mobile", a mobile session will be opened. It will connect to the locally running appium session and simulator\n' +
        '- If type is "api", an API session will be opened\n' +
        'Note: only one session can be open  at a time ; openinga new session will close the previous one.',
      inputSchema: {
        type: z
          .enum(['web', 'mobile', 'api'])
          .default('web')
          .describe('Type of session to open (web, mobile, api, or mixed)'),
        url: z.string().optional().describe('URL to open in browser'),
        browser: z
          .enum(['chrome', 'firefox', 'edge'])
          .optional()
          .describe('Browser to use for the session (e.g., chrome, firefox, edge)'),
      },
      outputSchema: {
        sessionType: z.enum(['web', 'mobile', 'api']).describe('Type of the opened session'),
        sessionId: z.string().nullable().describe('ID of the opened session'),
      },
    },
    async ({ url, type, browser }) => {
      if (type === 'web' && !url) {
        return {
          content: [
            {
              type: 'text',
              text: 'Error: Url must be provided to open a web session.',
            },
          ],
          structuredContent: { sessionId: undefined },
        };
      }

      if (type === 'web' && !browser) {
        browser = 'chrome';
      }

      let sessionDetails = `Opening test runner session for URL "${url}" using browser "${browser}"`;

      const variables: Record<string, string> = {};
      if (url) {
        variables['startUrl'] = url;
      }

      const runData: TestRunnerOptions = {
        runConfiguration: {
          sessions: [
            {
              type: type,
              browser: {
                name: browser,
                startUrl: url,
              },
            },
          ],
          runType: type,
          runName: `McpServer Open Session  for URL: ${url}`,
        },
        variables: variables,
        suites: [],
        functions: [],
        apis: [],
      };
      const result: SessionResult = await openSession(runData);

      if (result && result.success && result.sessionId) {
        currentSessionId = result.sessionId;
        currentSessionType = type;
        sessionDetails += `\n\nSession successfully created for type ${type} with ID: ${result.sessionId} !`;
      } else {
        sessionDetails += `\n\nFailed to create session.`;
      }
      console.log(`Result from test runner: ${sessionDetails}`);

      return {
        content: [{ type: 'text', text: sessionDetails }],
        structuredContent: { sessionType: type, sessionId: result?.sessionId || null },
      };
    }
  );

  // Register close-session tool
  server.registerTool(
    'close-session',
    {
      title: 'Close Session Tool',
      description: 'Close a test runner session',
      inputSchema: {
        sessionId: z.string().describe('ID of the session to close'),
      },
    },
    async ({ sessionId }) => {
      const checkSession = validateSession(sessionId, null);
      if (!checkSession.valid) {
        return checkSession.response;
      }

      let sessionDetails = `Closing test runner session with ID "${sessionId}"`;

      const result: SessionResult = await closeSession(sessionId);

      if (result && result.success) {
        currentSessionId = null;
        currentSessionType = null;
        sessionDetails += `\n\nSession successfully closed!`;
      } else {
        sessionDetails += `\n\nFailed to close session.`;
      }

      return {
        content: [
          {
            type: 'text',
            text: sessionDetails,
          },
        ],
      };
    }
  );

  //Register get accessibility tree tool
  server.registerTool(
    'get-accessibility-tree',
    {
      title: 'Get Accessibility Tree Tool',
      description:
        'Retrieve the accessibility tree for current page or part of it (based on provided CSS selector)',
      inputSchema: {
        sessionId: z.string().describe('ID of the session to get accessibility tree from'),
        selector: z
          .string()
          .optional()
          .describe('Optional selector to narrow down the accessibility tree'),
      },
      outputSchema: {
        axtree: z.unknown().describe('Accessibility tree object'),
      },
    },
    async ({ sessionId, selector }) => {
      const checkSession = validateSession(sessionId, { axtree: null });
      if (!checkSession.valid) {
        return checkSession.response;
      }

      let sessionDetails = `Retrieving accessibility tree for session ID [${sessionId}]`;

      const result: SessionResult = await getAxTree(sessionId, selector);
      if (!result || !result.success) {
        sessionDetails += `\n\nFailed to retrieve accessibility tree.`;
        return {
          content: [{ type: 'text', text: sessionDetails }],
          structuredContent: { axtree: null },
        };
      }

      sessionDetails += `\n\nAccessibility tree retrieved successfully!!`;
      return {
        content: [
          { type: 'text', text: sessionDetails },
          {
            type: 'text',
            text: JSON.stringify(result.tree, null, 2),
          },
        ],
        structuredContent: { axtree: result.tree },
      };
    }
  );

  //Register get dom tree tool
  server.registerTool(
    'get-dom-tree',
    {
      title: 'Get DOM Tree Tool',
      description:
        'Retrieve the DOM tree for current page or part of it (based on provided selector)',
      inputSchema: {
        sessionId: z.string().describe('ID of the session to get DOM tree from'),
        depth: z
          .number()
          .optional()
          .default(30)
          .describe('Optional depth to limit the DOM tree levels retrieved'),
        selector: z.string().optional().describe('Optional selector to narrow down the DOM tree'),
      },
      outputSchema: {
        domtree: z.unknown().describe('DOM tree object'),
      },
    },
    async ({ sessionId, depth, selector }) => {
      const checkSession = validateSession(sessionId, { domtree: null });
      if (!checkSession.valid) {
        return checkSession.response;
      }

      let sessionDetails = `Retrieving DOM tree for session ID [${sessionId}]`;

      const result: SessionResult = await getDomTree(sessionId, depth, selector);
      if (!result || !result.success) {
        sessionDetails += `\n\nFailed to retrieve DOM tree.`;
        return {
          content: [{ type: 'text', text: sessionDetails }],
          structuredContent: { domtree: null },
        };
      }

      sessionDetails += `\n\nDOM tree retrieved successfully!!`;
      return {
        content: [
          { type: 'text', text: sessionDetails },
          {
            type: 'text',
            text: JSON.stringify(result.tree, null, 2),
          },
        ],
        structuredContent: { domtree: result.tree },
      };
    }
  );

  //Register tool do step
  server.registerTool(
    'do-step',
    {
      title: 'Do Step Tool',
      description:
        'Perform a step action in the test runner session. A few notes about this tool:\n' +
        '- The command should be a valid command recognized by the test runner (e.g., click, item-select, input-text, etc...). Full list can be found at https://raw.githubusercontent.com/Applitest-co-il/test-runner/main/docs/step-commands.md\n' +
        '- The selector is optional but recommended to specify the target element for the action. The order of preference for selector type should be: ARIA (e.g. aria/Submit), content based (e.g. button=Submit), xpath, css ;  \n' +
        '- The position is optional and may be required if the selector matches multiple elements\n' +
        '- The value is optional and may be required for certain commands (e.g., input-text requires a value to input)\n' +
        '- The operator is optional and may be used to alter the command (e..g: comparison type in assertions, execute type for javascript, etc... )\n',
      inputSchema: {
        sessionId: z.string().describe('ID of the session to perform step in'),
        command: z.string().describe('Step command to perform (e.g., click, item-select, etc...)'),
        selectors: z
          .array(z.string())
          .optional()
          .describe('Array of potential selectors for the element to perform action on'),
        position: z
          .int()
          .optional()
          .describe(
            'Optional position index for the selector in case it could match several elements'
          ),
        value: z.string().optional().describe('Optional value for the step (e.g., text input)'),
        operator: z
          .string()
          .optional()
          .describe('Optional operator for the step (e.g type of comparison operators'),
      },
      outputSchema: {
        result: z.boolean().describe('Result of the performed step'),
      },
    },
    async ({ sessionId, command, selectors, position, value, operator }) => {
      const checkSession = validateSession(sessionId, { result: false });
      if (!checkSession.valid) {
        return checkSession.response;
      }

      let sessionDetails = `Performing step in session ID "${sessionId}"`;

      const step: TestStep = {
        command: command,
      };

      if (selectors && selectors.length > 0) {
        step.selectors = selectors;
      }

      if (value) {
        step.value = value;
      }

      if (position !== undefined && position !== -1) {
        step.position = position;
      }

      if (operator) {
        step.operator = operator;
      }

      const tests: TestConfiguration[] = [
        {
          name: 'McpServer Do Step Test',
          type: currentSessionType || 'web',
          steps: [step],
        },
      ];
      const suites: SuiteConfiguration[] = [
        {
          name: 'McpServer Do Step Suite',
          tests: tests,
        },
      ];

      const runData: TestRunnerOptions = {
        suites: suites,
        functions: [],
        apis: [],
      };

      const result: SessionResult = await runSession(sessionId, runData);

      if (!result || !result.success) {
        sessionDetails += `\n\nFailed to execute step: ${result.message || 'Unknown error'}`;
        return {
          content: [{ type: 'text', text: sessionDetails }],
          structuredContent: { result: false },
        };
      }

      sessionDetails += `\n\nStep executed successfully!`;
      return {
        content: [{ type: 'text', text: sessionDetails }],
        structuredContent: { result: true },
      };
    }
  );

  //#endregion

  //#region Register resources

  server.registerResource(
    'server-info',
    'test-runner://info',
    {
      title: 'Server Information',
      description: 'Information about this test runner MCP server',
      mimeType: 'text/plain',
    },
    async uri => {
      const info = `Test Runner MCP Server
======================

This is a simple MCP (Model Context Protocol) server that demonstrates:

- Tools: tools for opening and operating a test runner sessions
- Resources: This information resource
- Prompts: prompts for operating the mcp server: from simple open/close session prompts to generate steps for a full test runner test

This server is designed to act as an entry point for test runner, allowing for easy integration and communication with test runner tools and frameworks.

Available Tools:
- open-session: Opens a test runner session
- close-session: Closes a test runner session
- get-accessibility-tree: Retrieves the accessibility tree for the current page or part of it (based on provided selector)
- get-dom-tree: Retrieves the DOM tree for the current page or part of it (based on provided CSS selector)
- do-step: Performs a step action in the test runner session

Available Resources:
- server-info: Provides information about this MCP server

Available Prompts:
- open-session-prompt: Prompt to open a test runner session
- close-session-prompt: Prompt to close a test runner session
- get-accessibility-tree-prompt: Prompt to get the accessibility tree for the current page or provided selector
- generate test steps prompt: Prompt to generate test steps based on user scenario - scenario shoudl be provided as a json object: [{step: "step", expected: "expected result"}] 

Server Version: 1.0.0
Protocol: Model Context Protocol`;

      return {
        contents: [
          {
            uri: uri.href,
            text: info,
            mimeType: 'text/plain',
          },
        ],
      };
    }
  );

  //#endregion

  //#region Register prompts
  server.registerPrompt(
    'open-session-prompt',
    {
      title: 'Open Session Prompt',
      description: 'Open a session for a given URL and optionally browser',
      argsSchema: {
        url: z.string().describe('URL to open in browser'),
        browser: z
          .string()
          .optional()
          .describe('Browser to use for the session (e.g., chrome, firefox, edge)'),
      },
    },
    ({ url, browser }) => {
      const browserText = browser || 'chrome';

      return {
        messages: [
          {
            role: 'user',
            content: {
              type: 'text',
              text: `Please open a session for ${url} in ${browserText}.`,
            },
          },
        ],
      };
    }
  );

  server.registerPrompt(
    'close-session-prompt',
    {
      title: 'Close Session Prompt',
      description: 'Close a session for a given session ID',
      argsSchema: {
        sessionId: z.string().describe('ID of the session to close'),
      },
    },
    ({ sessionId }) => {
      return {
        messages: [
          {
            role: 'user',
            content: {
              type: 'text',
              text: `Please close the session with ID ${sessionId}.`,
            },
          },
        ],
      };
    }
  );

  server.registerPrompt(
    'get-accessibility-tree-prompt',
    {
      title: 'Get Accessibility Tree Prompt',
      description: 'Get the accessibility tree for current page or provided selector',
      argsSchema: {
        sessionId: z.string().describe('ID of the session to get accessibility tree from'),
        selector: z
          .string()
          .optional()
          .describe('CSS or XPATH selector to get accessibility tree for a specific element'),
      },
    },
    ({ sessionId, selector }) => {
      return {
        messages: [
          {
            role: 'user',
            content: {
              type: 'text',
              text:
                `Please get the accessibility tree for current page using session ID ${sessionId}` +
                (selector ? ` and specifically for selector ${selector} and its children` : '') +
                '.',
            },
          },
        ],
      };
    }
  );

  server.registerPrompt(
    'get-dom-tree-prompt',
    {
      title: 'Get DOM Tree Prompt',
      description: 'Get the DOM tree for current page or provided selector',
      argsSchema: {
        sessionId: z.string().describe('ID of the session to get DOM tree from'),
        selector: z
          .string()
          .optional()
          .describe('CSS selector to get DOM tree for a specific element'),
      },
    },
    ({ sessionId, selector }) => {
      return {
        messages: [
          {
            role: 'user',
            content: {
              type: 'text',
              text:
                `Please get the DOM tree for current page using session ID ${sessionId}` +
                (selector ? ` and specifically for selector ${selector} and its children` : '') +
                '.',
            },
          },
        ],
      };
    }
  );

  server.registerPrompt(
    'generate-test-steps-prompt',
    {
      title: 'Generate Test Steps Prompt',
      description:
        'Generate test steps based on user scenario - scenario should be provided as a json object: [{step: "step", expected: "expected result"}]',
      argsSchema: {
        scenario: z
          .string()
          .describe(
            'User scenario as a JSON string representing an array of steps and expected results'
          ),
      },
    },
    ({ scenario }) => {
      return {
        messages: [
          {
            role: 'user',
            content: {
              type: 'text',
              text:
                `Please generate test steps based on the following user scenario: \n${scenario}\n\n` +
                `The output should be a JSON array in following format: [{note: "step name", command: "command", selectors: ["selector"], value: "value", operator: "operator"}] where:\n` +
                `- selectors: it should include only tested selectors` +
                `- value: value to use in the step (if applicable)\n` +
                `- operator: operator to use in the step (if applicable) \n` +
                `Notes:\n` +
                `- In order to analyze page, 2 tools are available: get-accessibility-tree (priority )and get-dom-tree\n` +
                `- Selectors priority: aria (e.g. aria/XXX), text bound (e.g. h1=XXX, =XXX), generic XPath (e.g. //h1, //tr/td[2]), CSS\n` +
                `- Reference for the available steps' commands can be found at: https://raw.githubusercontent.com/Applitest-co-il/test-runner/main/docs/step-commands.md.\n` +
                `- In case you need additional information to perform a task, please ask user for more details.\n` +
                `- In all steps property fields (selectors, value) it is possible to use dynamic variable in format {{variable_name}} that will be replaced at runtime with the actual variable value.\n` +
                `- In case you need to keep state between steps (e.g. value of search result, clicked text, etc..), please make sure to use variables and associated command to store the state and use it in the following steps.\n` +
                `- In case of navigation or redirection, please make sure to add steps validating page was loaded successfully (e.g. validate page title, validate current url, validate specific element is present such as logo, etc...)\n` +
                `- Assertion priority is:  check on page/dom (e.g. assert-is-displayed, assert-text, etc...), check on accessibility tree (assert-accessibility-tree) as fallback.\n` +
                `- Make sure to add all necessary assertions to validate expected result provided in scenario (i.e. element is displayed and its value is correct one).\n`,
            },
          },
        ],
      };
    }
  );

  server.registerPrompt(
    'generate-test-scenario-prompt',
    {
      title: 'Generate Test Scenario Prompt',
      description:
        'Generate a detailed test scenario based on user high level requirements - requirements should be provided as a text description',
      argsSchema: {
        requirements: z.string().describe('high level requirements for a test scenario'),
      },
    },
    ({ requirements }) => {
      return {
        messages: [
          {
            role: 'user',
            content: {
              type: 'text',
              text:
                `Please generate a detailed test scenario based on the following high level requirements: \n${requirements}\n\n` +
                `The output should be a JSON object representing the test scenario with following format: [{ step: 'steps deatils', expected: 'expected outcomes'}].\n` +
                `Notes:\n` +
                `- Make sure to cover all aspects of the requirements in the scenario.\n` +
                `- Use clear and descriptive step details, it can include multipple action (e.g. Login, then Navigate to, etc..) and use conceptual action not detail interactions (e.g. Simply "Login"  instead of  "Enter username", "Enter password", "Click login")\n` +
                `- Include in expected outcome all the necessary checks to validate completion.\n`,
            },
          },
        ],
      };
    }
  );

  //#endregion

  return server;
}

/**
 * Server configuration and metadata
 */
export const SERVER_CONFIG = {
  name: 'test-runner-proxy-server',
  version: '1.0.0',
  description: 'A simple MCP Test Runner Proxy server with tools, resources, and prompts',
  tools: ['open-session', 'close-session', 'get-accessibility-tree', 'get-dom-tree', 'do-step'],
  resources: ['server-info'],
  prompts: [
    'open-session-prompt',
    'close-session-prompt',
    'get-accessibility-tree-prompt',
    'get-dom-tree-prompt',
    'generate-test-steps-prompt',
  ],
} as const;
