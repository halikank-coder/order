import { NextResponse } from 'next/server';
import { Client } from '@line/bot-sdk';

const config = {
    channelAccessToken: process.env.LINE_CHANNEL_ACCESS_TOKEN || '',
    channelSecret: process.env.LINE_CHANNEL_SECRET || '',
};

const client = new Client(config);

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { name, phone, date, usage, budget, message, budgetCustom } = body;

        const adminUserId = process.env.LINE_ADMIN_USER_ID;

        if (!config.channelAccessToken || !adminUserId) {
            console.error('Missing LINE configuration');
            return NextResponse.json({ error: 'Server configuration error' }, { status: 500 });
        }

        const orderDetails = `🌸 新しい注文が入りました！ 🌸

👤 お名前: ${name}
📞 電話番号: ${phone}
📅 受取希望日: ${date}
🎁 用途: ${usage}
💰 予算: ${budget === 'custom' ? `${budgetCustom}円 (その他)` : `${parseInt(budget).toLocaleString()}円`}

📝 メッセージ/要望:
${message}
`;

        await client.pushMessage(adminUserId, {
            type: 'text',
            text: orderDetails,
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('LINE Notification Error:', error);
        return NextResponse.json({ error: 'Failed to send notification' }, { status: 500 });
    }
}
