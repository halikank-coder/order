import { NextResponse } from 'next/server';
import { Client } from '@line/bot-sdk';
import { google } from 'googleapis';

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
            orderType, region, deliveryTime, pickupTime, quantity, productType, atmosphere
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
            const timeStrMap: Record<string, string> = {
                'any': '指定なし',
                'morning': '午前中',
                '14-16': '14:00-16:00',
                '16-18': '16:00-18:00',
                '18-20': '18:00-20:00',
                '19-21': '19:00-21:00'
            };
            const timeStr = timeStrMap[deliveryTime] || deliveryTime || '指定なし';
            typeDetails = `🚚 受け取り方法: 配送\n📍 エリア: ${region === 'takamatsu' ? '高松市内' : '高松市外'}\n⏰ お届け希望: ${timeStr}`;
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

        // Helper for atmosphere translation
        const atmosphereMap: Record<string, string> = {
            'warm': '暖色系',
            'cool': '寒色系',
            'vitamin': 'ビタミンカラー系',
            'chic': 'シック系',
            'white': 'ホワイト系',
            'omakase': 'おまかせ'
        };
        const atmosphereDisplay = atmosphere ? atmosphereMap[atmosphere] || atmosphere : '指定なし';

        const orderDetails = `🌸 新しい注文が入りました！ 🌸

👤 お名前: ${name}
📞 電話番号: ${phone}
📅 日時: ${date}

🌷 商品: ${productTypeDisplay}
${typeDetails}
📦 数量: ${quantity}個

🎁 用途: ${usage}
💰 予算: ${budgetDisplay}
🎨 雰囲気: ${atmosphereDisplay}
💳 支払: ${paymentMethodDisplay}

📝 メッセージ/要望:
${message || 'なし'}
`;

        await client.multicast(adminUserIds, {
            type: 'text',
            text: orderDetails,
        });

        // Add to Google Calendar
        try {
            if (process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL && process.env.GOOGLE_PRIVATE_KEY && process.env.GOOGLE_CALENDAR_ID) {
                const auth = new google.auth.JWT(
                    process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
                    undefined,
                    process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n'),
                    ['https://www.googleapis.com/auth/calendar.events']
                );
                const calendar = google.calendar({ version: 'v3', auth });

                const summary = `[${orderType === 'delivery' ? '配送' : '店頭'}] ${name}様 - ${productTypeDisplay}`;
                const description = orderDetails;

                let start: any = {};
                let end: any = {};

                if (orderType === 'delivery') {
                    // All-day event for delivery
                    const startDate = new Date(date);
                    const endDate = new Date(startDate);
                    endDate.setDate(endDate.getDate() + 1);
                    const endString = endDate.toISOString().split('T')[0];
                    start = { date: date, timeZone: 'Asia/Tokyo' };
                    end = { date: endString, timeZone: 'Asia/Tokyo' };
                } else {
                    // Specific time event for pickup
                    const startDateTime = new Date(`${date}T${pickupTime}:00+09:00`);
                    const endDateTime = new Date(startDateTime.getTime() + 30 * 60000); // 30 mins duration
                    start = { dateTime: startDateTime.toISOString(), timeZone: 'Asia/Tokyo' };
                    end = { dateTime: endDateTime.toISOString(), timeZone: 'Asia/Tokyo' };
                }

                await calendar.events.insert({
                    calendarId: process.env.GOOGLE_CALENDAR_ID,
                    requestBody: { summary, description, start, end }
                });
            } else {
                console.log('Google Calendar credentials not fully provided. Skipping calendar insertion.');
            }
        } catch (calendarError) {
            console.error('Failed to add to Google Calendar:', calendarError);
            // Proceed despite calendar error; LINE notification already sent
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('LINE Notification Error:', error);
        return NextResponse.json({ error: 'Failed to send notification' }, { status: 500 });
    }
}
