
// Scripts to test the webhook
const crypto = require('crypto');

async function testWebhook() {
    const channelSecret = process.env.LINE_CHANNEL_SECRET || 'test_secret';

    // 1. Test Catalog Intent
    console.log('--- Testing Catalog Intent ---');
    await sendEvent(channelSecret, 'カタログ');

    // 2. Test FAQ Intent
    console.log('\n--- Testing FAQ Intent ---');
    await sendEvent(channelSecret, 'よくある質問');
}

async function sendEvent(secret, text) {
    const body = JSON.stringify({
        events: [{
            type: 'message',
            replyToken: 'test_reply_token',
            message: {
                type: 'text',
                text: text
            }
        }]
    });

    const signature = crypto
        .createHmac('sha256', secret)
        .update(body)
        .digest('base64');

    try {
        const res = await fetch('http://localhost:3000/api/webhook', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-line-signature': signature
            },
            body: body
        });

        console.log(`Response Status: ${res.status}`);
        const json = await res.json();
        console.log('Response Body:', json);
    } catch (e) {
        console.error('Fetch Error:', e);
    }
}

testWebhook();
