const path = require('path');
const { execFile } = require('child_process');

// @desc    Process chat query via CrewAI Orchestrator
// @route   POST /api/ai/chat
// @access  Public
const processAIChat = async (req, res) => {
  const { message } = req.body;

  if (!message) {
    return res.status(400).json({ error: "Invalid payload: 'message' field is required." });
  }

  const startTime = Date.now();
  
  // Resolve paths dynamically
  const pythonPath = path.join(__dirname, '..', '..', 'crewAI', 'myclaim_ai', '.venv', 'Scripts', 'python.exe');
  const crewCwd = path.join(__dirname, '..', '..', 'crewAI', 'myclaim_ai');
  
  // CLI arguments to pass to the python script
  const args = [
    '-c',
    'import sys; sys.path.insert(0, \'src\'); from myclaim_ai.main import run; run()',
    message
  ];

  // Load crewAI env variables and merge with process.env
  let childEnv = { ...process.env };
  try {
    const fs = require('fs');
    const dotenv = require('dotenv');
    const envPath = path.join(crewCwd, '.env');
    if (fs.existsSync(envPath)) {
      const aiEnvConfig = dotenv.parse(fs.readFileSync(envPath));
      childEnv = { ...childEnv, ...aiEnvConfig };
    }
  } catch (err) {
    console.error(`[AI Gateway Warning] Failed to load CrewAI env file: ${err.message}`);
  }

  console.log(`[AI Gateway] Forwarding query to CrewAI: "${message}"`);

  execFile(pythonPath, args, { cwd: crewCwd, env: childEnv, timeout: 120000 }, (error, stdout, stderr) => {
    const endTime = Date.now();
    const responseTime = endTime - startTime;

    // Log tracking metrics
    console.log(`================ AI OS GATEWAY LOG ================`);
    console.log(`User Query    : "${message}"`);
    console.log(`Response Time : ${responseTime}ms`);
    
    // Parse routing agent and tools used from logs if present in stdout
    const selectedAgents = [];
    const agentsRegex = /Selected Agents:\s*\[(.*?)\]/g;
    let match = agentsRegex.exec(stdout);
    if (match && match[1]) {
      selectedAgents.push(...match[1].split(',').map(s => s.replace(/['"\s]/g, '')));
    }
    console.log(`Selected Agts : ${selectedAgents.length > 0 ? selectedAgents.join(', ') : 'exchange_agent (routing)'}`);
    
    const toolsUsed = [];
    if (stdout.includes('get_claim_summary')) toolsUsed.push('get_claim_summary');
    if (stdout.includes('get_pending_claims')) toolsUsed.push('get_pending_claims');
    if (stdout.includes('get_missing_documents')) toolsUsed.push('get_missing_documents');
    if (stdout.includes('get_employee_summary')) toolsUsed.push('get_employee_summary');
    if (stdout.includes('get_partner_list')) toolsUsed.push('get_partner_list');
    if (stdout.includes('get_financial_summary')) toolsUsed.push('get_financial_summary');
    if (stdout.includes('send_notification')) toolsUsed.push('send_notification');
    console.log(`Tools Invoked : ${toolsUsed.length > 0 ? toolsUsed.join(', ') : 'None'}`);
    
    console.log(`==================================================`);

    if (error) {
      console.error(`[AI Gateway Error] Process execution failed: ${error.message}`);
      
      let clientError = "Internal error running AI agent.";
      let statusCode = 500;
      
      if (error.killed) {
        clientError = "AI Agent execution timed out.";
        statusCode = 504;
      } else if (stdout.includes("RESOURCE_EXHAUSTED") || stderr.includes("RESOURCE_EXHAUSTED")) {
        clientError = "Google Gemini API rate limit / daily quota exceeded. Please try again later.";
        statusCode = 429;
      } else if (stdout.includes("UNAUTHENTICATED") || stderr.includes("UNAUTHENTICATED")) {
        clientError = "Authentication credentials error when connecting to Gemini API.";
        statusCode = 401;
      } else if (stdout.includes("ECONNREFUSED") || stderr.includes("ECONNREFUSED")) {
        clientError = "MyClaim backend is unavailable or refused connection.";
        statusCode = 503;
      }

      return res.status(statusCode).json({
        error: clientError,
        details: stderr || error.message
      });
    }

    if (!stdout.trim()) {
      return res.status(500).json({ error: "Empty response received from AI agent." });
    }

    // Extract the final synthesized answer
    let answer = stdout;
    if (stdout.includes('[Result Output]:')) {
      answer = stdout.substring(stdout.indexOf('[Result Output]:') + '[Result Output]:'.length).trim();
    } else if (stdout.includes('[Result 1 Output]:')) {
      answer = stdout.substring(stdout.indexOf('[Result 1 Output]:') + '[Result 1 Output]:'.length).trim();
    }

    res.json({ answer });
  });
};

module.exports = {
  processAIChat
};
