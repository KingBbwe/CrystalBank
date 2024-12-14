const { HttpAgent } = require('@dfinity/agent');
const { TextEncoder } = require('util');

global.TextEncoder = TextEncoder;

const agent = new HttpAgent({ host: 'http://localhost:8000' });
console.log('Agent created:', agent);
