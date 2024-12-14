const { HttpAgent } = require('@dfinity/agent');

// Create a new agent instance
const agent = new HttpAgent({ host: 'http://localhost:8000' });

// Log the agent object to confirm it works
console.log('Agent created:', agent);
