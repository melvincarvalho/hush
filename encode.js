#!/usr/bin/env node

const { getPublicKey, nip04, finalizeEvent, SimplePool } = require('nostr-tools');
const readline = require('readline');

// Get private key from arguments
const args = process.argv.slice(2);
if (args.length === 0) {
  console.error('Usage: node encode.js <private-key-hex> [message]');
  console.error('Example: node encode.js a1b2c3d4e5f6... "Hello world"');
  console.error('If no message provided, will read from stdin');
  process.exit(1);
}

const skHex = args[0];
const messageArg = args.slice(1).join(' ');

// Validate hex key
if (!/^[0-9a-fA-F]{64}$/.test(skHex)) {
  console.error('Error: Invalid private key. Must be 64 hex characters.');
  process.exit(1);
}

// Convert hex to Uint8Array
function hexToBytes(hex) {
  const bytes = new Uint8Array(hex.length / 2);
  for (let i = 0; i < hex.length; i += 2) {
    bytes[i / 2] = parseInt(hex.substr(i, 2), 16);
  }
  return bytes;
}

async function sendMessage(message) {
  // Set up unhandled rejection handler
  process.on('unhandledRejection', (reason, promise) => {
    // Ignore websocket close errors
    if (reason && reason.toString().includes('websocket')) {
      return;
    }
    console.error('Unhandled Rejection:', reason);
  });
  
  try {
    // Convert private key to Uint8Array
    const sk = hexToBytes(skHex);
    const pk = getPublicKey(sk);
    
    console.log(`\n🤫 Hush Message Encoder`);
    console.log(`Your public key: ${pk.slice(0, 16)}...`);
    console.log(`Message length: ${message.length} chars\n`);

    // Encrypt to self (NIP-04)
    const encrypted = await nip04.encrypt(sk, pk, message);
    
    // Create unsigned event
    const unsignedEvent = {
      kind: 31337,
      created_at: Math.floor(Date.now() / 1000),
      tags: [['p', pk], ['hush', '1']],
      content: encrypted,
      pubkey: pk
    };
    
    // Finalize event (signs it and adds id)
    const signedEvent = finalizeEvent(unsignedEvent, sk);
    
    console.log('Event created:');
    console.log(JSON.stringify(signedEvent, null, 2));
    console.log();

    // Define relays
    const relays = [
      'wss://relay.damus.io',
      'wss://nos.lol', 
      'wss://relay.primal.net'
    ];

    // Create pool and publish
    const pool = new SimplePool();
    
    console.log('Publishing to relays...');
    
    // Publish to all relays with timeout and verification
    const results = await Promise.allSettled(
      relays.map(async (relay) => {
        try {
          const pub = pool.publish([relay], signedEvent);
          await Promise.race([
            pub,
            new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout')), 5000))
          ]);
          
          // Try to verify the message was stored by querying it back
          try {
            const verify = await pool.querySync([relay], {
              kinds: [31337],
              ids: [signedEvent.id],
              limit: 1
            });
            if (verify.length > 0) {
              console.log(`✓ Published and verified on ${relay}`);
            } else {
              console.log(`⚠ Published to ${relay} but not found on query`);
            }
          } catch (verifyError) {
            console.log(`✓ Published to ${relay} (verification failed)`);
          }
          
          return { relay, success: true };
        } catch (error) {
          console.log(`✗ Failed to publish to ${relay}: ${error.message}`);
          return { relay, success: false, error: error.message };
        }
      })
    );
    
    // Check if at least one succeeded
    const successCount = results.filter(r => r.value?.success).length;
    
    if (successCount > 0) {
      console.log(`\n✓ Message hushed! Published to ${successCount}/${relays.length} relays`);
      console.log(`Event ID: ${signedEvent.id}`);
    } else {
      console.error('\n✗ Failed to publish to any relay');
    }
    
    // Let connections close naturally and exit
    setTimeout(() => {
      process.exit(0);
    }, 1000);
    
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

// Get message from argument or stdin
if (messageArg) {
  // Message provided as argument
  sendMessage(messageArg);
} else {
  // Read from stdin
  console.log('Enter message (Ctrl+D when done):');
  
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
    terminal: false
  });
  
  let message = '';
  rl.on('line', (line) => {
    message += (message ? '\n' : '') + line;
  });
  
  rl.on('close', () => {
    if (message) {
      sendMessage(message);
    } else {
      console.error('No message provided');
      process.exit(1);
    }
  });
}