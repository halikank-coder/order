import { NextResponse } from 'next/server';
import { Client, WebhookEvent, FlexMessage, TextMessage } from '@line/bot-sdk';
import * as crypto from 'crypto';

const config = {
    channelAccessToken: process.env.LINE_CHANNEL_ACCESS_TOKEN || '',
    channelSecret: process.env.LINE_CHANNEL_SECRET || '',
};

const client = new Client(config);

export async function POST(req: Request) {
    try {
        const body = await req.text();
        const signature = req.headers.get('x-line-signature');

        if (!config.channelSecret || !signature) {
            return NextResponse.json({ error: 'Missing config or signature' }, { status: 400 });
        }

        // Verify signature
        const hash = crypto
            .createHmac('sha256', config.channelSecret)
            .update(body)
            .digest('base64');

        if (hash !== signature) {
            return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
        }

        const data = JSON.parse(body);
        const events: WebhookEvent[] = data.events;

        // Process all events
        await Promise.all(events.map(async (event) => {
            return handleEvent(event);
        }));

        return NextResponse.json({ status: 'success' });
    } catch (error) {
        console.error('Webhook Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

async function handleEvent(event: WebhookEvent) {
    if (event.type !== 'message' || event.message.type !== 'text') {
        return Promise.resolve(null);
    }

    const text = event.message.text;
    const replyToken = event.replyToken;

    if (text === 'カタログ') {
        return handleCatalog(replyToken);
    } else if (text === 'よくある質問') {
        return handleFAQ(replyToken);
    } else if (text === '個別相談をお願いします') {
        return handleChatSupport(replyToken);
    }

    return Promise.resolve(null);
}

async function handleCatalog(replyToken: string) {
    const flexMessage: FlexMessage = {
        type: 'flex',
        altText: '商品カタログ',
        contents: {
            type: 'carousel',
            contents: [
                {
                    type: 'bubble',
                    hero: {
                        type: 'image',
                        url: 'https://images.unsplash.com/photo-1563241527-3004b7be025a?w=800&q=80', // Placeholder: Bouquet
                        size: 'full',
                        aspectRatio: '20:13',
                        aspectMode: 'cover'
                    },
                    body: {
                        type: 'box',
                        layout: 'vertical',
                        contents: [
                            {
                                type: 'text',
                                text: '季節の花束',
                                weight: 'bold',
                                size: 'xl'
                            },
                            {
                                type: 'text',
                                text: '3,300円〜',
                                size: 'md',
                                color: '#E11D48',
                                margin: 'sm'
                            },
                            {
                                type: 'text',
                                text: 'お誕生日や記念日に人気のアレンジメントです。',
                                size: 'sm',
                                color: '#666666',
                                wrap: true,
                                margin: 'md'
                            }
                        ]
                    },
                    footer: {
                        type: 'box',
                        layout: 'vertical',
                        contents: [
                            {
                                type: 'button',
                                action: {
                                    type: 'uri',
                                    label: '注文画面へ',
                                    uri: 'https://liff.line.me/YOUR_LIFF_ID/order' // Should be updated with real LIFF or URL
                                },
                                style: 'primary',
                                color: '#DB2777'
                            }
                        ]
                    }
                },
                {
                    type: 'bubble',
                    hero: {
                        type: 'image',
                        url: 'https://images.unsplash.com/photo-1582794543139-8ac92a900275?w=800&q=80', // Placeholder: Arrangement
                        size: 'full',
                        aspectRatio: '20:13',
                        aspectMode: 'cover'
                    },
                    body: {
                        type: 'box',
                        layout: 'vertical',
                        contents: [
                            {
                                type: 'text',
                                text: 'アレンジメント',
                                weight: 'bold',
                                size: 'xl'
                            },
                            {
                                type: 'text',
                                text: '5,500円〜',
                                size: 'md',
                                color: '#E11D48',
                                margin: 'sm'
                            },
                            {
                                type: 'text',
                                text: 'カゴ付きでそのまま飾れるギフトに最適な商品です。',
                                size: 'sm',
                                color: '#666666',
                                wrap: true,
                                margin: 'md'
                            }
                        ]
                    },
                    footer: {
                        type: 'box',
                        layout: 'vertical',
                        contents: [
                            {
                                type: 'button',
                                action: {
                                    type: 'uri',
                                    label: '注文画面へ',
                                    uri: 'https://liff.line.me/YOUR_LIFF_ID/order'
                                },
                                style: 'primary',
                                color: '#DB2777'
                            }
                        ]
                    }
                },
                {
                    type: 'bubble',
                    hero: {
                        type: 'image',
                        url: 'https://images.unsplash.com/photo-1533616688232-6304da7c9339?w=800&q=80', // Placeholder: Stand
                        size: 'full',
                        aspectRatio: '20:13',
                        aspectMode: 'cover'
                    },
                    body: {
                        type: 'box',
                        layout: 'vertical',
                        contents: [
                            {
                                type: 'text',
                                text: 'スタンド花',
                                weight: 'bold',
                                size: 'xl'
                            },
                            {
                                type: 'text',
                                text: '16,500円〜',
                                size: 'md',
                                color: '#E11D48',
                                margin: 'sm'
                            },
                            {
                                type: 'text',
                                text: '開店祝いや公演祝いに。豪華に彩ります。',
                                size: 'sm',
                                color: '#666666',
                                wrap: true,
                                margin: 'md'
                            }
                        ]
                    },
                    footer: {
                        type: 'box',
                        layout: 'vertical',
                        contents: [
                            {
                                type: 'button',
                                action: {
                                    type: 'uri',
                                    label: '注文画面へ',
                                    uri: 'https://liff.line.me/YOUR_LIFF_ID/order'
                                },
                                style: 'primary',
                                color: '#DB2777'
                            }
                        ]
                    }
                }
            ]
        }
    };

    return client.replyMessage(replyToken, flexMessage);
}

async function handleFAQ(replyToken: string) {
    const faqText = `【よくある質問】

📦注文・支払
Q.注文方法は？
A.LINEメニューの「ご注文・予約」へ。24h受付中。

Q.支払い方法は？
A.カード決済(Square)です。注文後にURLを送ります。

Q.当日配送は？
A.お急ぎの方はお電話かLINEでご相談を。

Q.送料は？
A.高松市内3,000円〜、市外5,000円〜で【無料】。
※大型商品は要相談

💐商品
Q.予算指定は？
A.フォームで「その他」を選び金額入力ください。

Q.用途は？
A.誕生日・開店祝・お供え等、要望に合わせて作成します。

🏪無人店舗
Q.営業時間は？
A.24時間365日いつでもどうぞ。

Q.購入・支払は？
A.商品を自由にお選び頂き、QR決済や料金箱へ。

💬その他
Q.相談は？
A.「個別相談」メニューからどうぞ。

Q.インボイスは？
A.発行可能です。備考欄へ記載ください。`;

    return client.replyMessage(replyToken, {
        type: 'text',
        text: faqText,
    });
}

async function handleChatSupport(replyToken: string) {
    return client.replyMessage(replyToken, {
        type: 'text',
        text: `お問い合わせありがとうございます。\n\nスタッフが確認次第、順次ご返信させていただきます。\nご相談内容や、ご希望の商品イメージ写真などがございましたら、続けて送信してください。`,
    });
}
