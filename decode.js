#!/usr/bin/env node

const { generateSecretKey, getPublicKey, nip04, SimplePool } = require('nostr-tools');

// Get private key from arguments
const args = process.argv.slice(2);
if (args.length === 0) {
  console.error('Usage: node decode.js <private-key-hex>');
  console.error('Example: node decode.js a1b2c3d4e5f6...');
  process.exit(1);
}

const skHex = args[0];

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

async function fetchAndDecode() {
  try {
    // Convert private key to Uint8Array
    const sk = hexToBytes(skHex);
    const pk = getPublicKey(sk);
    
    console.log(`Your public key: ${pk.slice(0, 16)}...`);
    console.log('Fetching messages from relays...\n');

    // Define relays to check
    const relays = [
      'wss://relay.damus.io',
      'wss://nos.lol',
      'wss://relay.primal.net'
    ];

    // Create a pool to connect to multiple relays
    const pool = new SimplePool();

    // Fetch events where we are tagged or are the author
    // Looking for kind 31337 (hush messages)
    const events = await pool.querySync(
      relays,
      {
        kinds: [31337],
        '#p': [pk],  // Messages tagged to us
        limit: 10
      }
    );

    // Also fetch messages we sent (to ourselves)
    const sentEvents = await pool.querySync(
      relays,
      {
        kinds: [31337],
        authors: [pk],
        limit: 10
      }
    );

    // Combine and deduplicate
    const allEvents = [...events, ...sentEvents];
    const uniqueEvents = Array.from(new Map(allEvents.map(e => [e.id, e])).values());
    
    // Sort by timestamp (newest first)
    uniqueEvents.sort((a, b) => b.created_at - a.created_at);

    if (uniqueEvents.length === 0) {
      console.log('No messages found for your key.');
      pool.close(relays);
      return;
    }

    console.log(`Found ${uniqueEvents.length} message(s):\n`);

    // Decrypt each message
    for (const event of uniqueEvents) {
      console.log('═'.repeat(60));
      console.log('FULL EVENT:');
      console.log(JSON.stringify(event, null, 2));
      console.log('─'.repeat(60));
      
      try {
        // For self-encrypted messages
        const otherPubkey = event.pubkey === pk ? 
          (event.tags.find(tag => tag[0] === 'p')?.[1] || pk) : 
          event.pubkey;
        
        const decrypted = await nip04.decrypt(sk, otherPubkey, event.content);
        
        console.log('DECRYPTED MESSAGE:');
        console.log(decrypted);
        console.log('─'.repeat(60));
        console.log(`Time: ${new Date(event.created_at * 1000).toLocaleString()}`);
        console.log(`From: ${event.pubkey === pk ? 'You' : event.pubkey.slice(0, 16) + '...'}`);
        console.log(`Event ID: ${event.id}`);
        console.log(`Signature: ${event.sig.slice(0, 20)}...`);
        
      } catch (decryptError) {
        console.log('DECRYPTION ERROR:');
        console.log('Could not decrypt this message (might not be for you)');
        console.log(`Error: ${decryptError.message}`);
      }
      
      console.log('═'.repeat(60));
      console.log();
    }

    // Close connections gracefully
    try {
      pool.close(relays);
    } catch (e) {
      // Ignore close errors
    }
    
    // Give connections time to close cleanly
    setTimeout(() => {
      process.exit(0);
    }, 100);

  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

// Run the decoder
console.log('🤫 Hush Message Decoder\n');
fetchAndDecode();