import { NextResponse } from 'next/server';
import { Client } from '@line/bot-sdk';

export async function POST(req: Request) {
    try {
        const config = {
            channelAccessToken: process.env.LINE_CHANNEL_ACCESS_TOKEN || '',
            channelSecret: process.env.LINE_CHANNEL_SECRET || '',
        };

        if (!config.channelAccessToken) {
            console.error('Missing LINE_CHANNEL_ACCESS_TOKEN');
            return NextResponse.json({ error: 'Server configuration error: Missing Token' }, { status: 500 });
        }

        const client = new Client(config);

        const body = await req.json();
        const {
            name, phone, date, usage, budget, message, budgetCustom,
            orderType, region, pickupTime, quantity
        } = body;

        const adminUserId = process.env.LINE_ADMIN_USER_ID;

        if (!adminUserId) {
            console.error('Missing LINE_ADMIN_USER_ID');
            return NextResponse.json({ error: 'Server configuration error: Missing Admin ID' }, { status: 500 });
        }

        // Helper for budget display
        const budgetDisplay = budget === 'custom'
            ? `${parseInt(budgetCustom || '0').toLocaleString()}円 (その他)`
            : `${parseInt(budget).toLocaleString()}円`;

        // Helper for order type details
        let typeDetails = '';
        if (orderType === 'delivery') {
            typeDetails = `🚚 受け取り方法: 配送\n📍 エリア: ${region === 'takamatsu' ? '高松市内' : '高松市外'}`;
        } else {
            typeDetails = `🛍 受け取り方法: 店頭受取\n⏰ 来店時間: ${pickupTime}`;
        }

        const orderDetails = `🌸 新しい注文が入りました！ 🌸

👤 お名前: ${name}
📞 電話番号: ${phone}
📅 日時: ${date}

${typeDetails}
📦 数量: ${quantity}個

🎁 用途: ${usage}
💰 予算: ${budgetDisplay}

📝 メッセージ/要望:
${message || 'なし'}
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
