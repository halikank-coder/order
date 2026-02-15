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
            orderType, region, pickupTime, quantity, productType
        } = body;

        const adminUserIdRaw = process.env.LINE_ADMIN_USER_ID;

        if (!adminUserIdRaw) {
            console.error('Missing LINE_ADMIN_USER_ID');
            return NextResponse.json({ error: 'Server configuration error: Missing Admin ID' }, { status: 500 });
        }

        // Support multiple admins (comma separated)
        const adminUserIds = adminUserIdRaw.split(',').map(id => id.trim()).filter(id => id.length > 0);

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

        // Helper for product type translation
        const productTypeMap: Record<string, string> = {
            'arrangement': 'アレンジメント',
            'bouquet': '花束',
            'stand': 'スタンド花',
            'orchid': '胡蝶蘭'
        };
        const productTypeDisplay = productTypeMap[productType] || '未選択';

        // Helper for payment method translation
        const paymentMethodMap: Record<string, string> = {
            'credit': 'クレジットカード (Square)',
            'onsite': '受取時にお支払い'
        };
        const paymentMethodDisplay = paymentMethodMap[body.paymentMethod] || '未選択';

        const orderDetails = `🌸 新しい注文が入りました！ 🌸

👤 お名前: ${name}
📞 電話番号: ${phone}
📅 日時: ${date}

🌷 商品: ${productTypeDisplay}
${typeDetails}
📦 数量: ${quantity}個

🎁 用途: ${usage}
💰 予算: ${budgetDisplay}
💳 支払: ${paymentMethodDisplay}

📝 メッセージ/要望:
${message || 'なし'}
`;

        await client.multicast(adminUserIds, {
            type: 'text',
            text: orderDetails,
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('LINE Notification Error:', error);
        return NextResponse.json({ error: 'Failed to send notification' }, { status: 500 });
    }
}
