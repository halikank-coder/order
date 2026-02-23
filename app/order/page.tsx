'use client';

import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { CalendarIcon, CreditCard, Banknote, ShoppingBag, Truck, Clock, Package, CheckCircle2, Camera } from "lucide-react";

export default function OrderPage() {
    const [formData, setFormData] = useState({
        name: '',
        phone: '',
        date: '',
        orderType: 'delivery', // 'delivery' | 'pickup'
        deliveryTime: 'any',   // 'any' | 'morning' | '14-16' | '16-18' | '18-20' | '19-21'
        productType: '',       // 'arrangement' | 'bouquet' | 'stand' | 'orchid'
        region: 'takamatsu',   // 'takamatsu' | 'other'
        pickupTime: '10:00',
        usage: '',
        budget: '3000',
        atmosphere: '',
        budgetCustom: '',
        quantity: '1',
        message: '',
        paymentMethod: 'credit'
    });

    const [isSubmitted, setIsSubmitted] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [orderNumber, setOrderNumber] = useState('');

    // Dynamic budgets for normal products
    const normalBudgets = ['2000', '3000', '4000', '5000', '6000', '7000', '8000', '10000'];

    // Atmosphere Options
    const atmosphereOptions = [
        { id: 'warm', label: '暖色系', src: '/images/styles/warm.png' },
        { id: 'cool', label: '寒色系', src: '/images/styles/cool.png' },
        { id: 'vitamin', label: 'ビタミン', src: '/images/styles/vitamin.jpg' },
        { id: 'chic', label: 'シック', src: '/images/styles/chic.jpg' },
        { id: 'white', label: 'ホワイト', src: '/images/styles/white.jpg' },
        { id: 'omakase', label: 'おまかせ', src: '/images/styles/omakase.jpg' }
    ];

    // Restrict atmosphere options if budget <= 2000
    const currentBudgetVal = formData.budget === 'custom' ? parseInt(formData.budgetCustom || '0') : parseInt(formData.budget || '0');
    const availableAtmospheres = currentBudgetVal <= 2000
        ? atmosphereOptions.filter(a => ['warm', 'cool', 'vitamin'].includes(a.id))
        : atmosphereOptions;

    // Mock Square Links (Same as before, simplified for this example)
    const PAYMENT_LINKS = {
        '3300': 'https://square.link/u/B3FkQL5S',
        '5500': 'https://square.link/u/cRv8q9eh',
        '11000': 'https://square.link/u/qMcNrqQe',
        'custom': 'https://square.link/u/zD979fe1',
    };

    // Display helpers for the confirmation screen
    const productTypeMap: Record<string, string> = {
        'arrangement': 'アレンジメント',
        'bouquet': '花束',
        'stand': 'スタンド花',
        'orchid': '胡蝶蘭'
    };

    const usageMap: Record<string, string> = {
        'birthday': '🎂 お誕生日',
        'anniversary': '💍 記念日',
        'opening': '🎊 開店祝い',
        'funeral': '🕊 お供え',
        'home': '🏠 ご自宅用',
        'other': '🎸 その他'
    };

    const atmosphereMap: Record<string, string> = {
        'warm': '暖色系',
        'cool': '寒色系',
        'vitamin': 'ビタミンカラー',
        'chic': 'シック',
        'white': 'ホワイト',
        'omakase': 'おまかせ'
    };

    const deliveryTimeMap: Record<string, string> = {
        'any': '指定なし',
        'morning': '午前中',
        '14-16': '14:00 - 16:00',
        '16-18': '16:00 - 18:00',
        '18-20': '18:00 - 20:00',
        '19-21': '19:00 - 21:00'
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Validation for Orchid
        if (!formData.productType) {
            alert('商品タイプを選択してください。');
            return;
        }

        // Validation for Budget
        if (formData.budget === 'custom') {
            const amount = parseInt(formData.budgetCustom);
            if (formData.productType === 'orchid') {
                if (isNaN(amount) || amount < 15000) {
                    alert('胡蝶蘭のご予算は最低15,000円からとなります。');
                    return;
                }
            } else if (formData.productType === 'stand') {
                if (isNaN(amount) || amount < 10000) {
                    alert('スタンド花のご予算は最低10,000円からとなります。');
                    return;
                }
            } else {
                if (isNaN(amount) || amount < 2000) {
                    alert('ご予算は最低2,000円からとなります。');
                    return;
                }
            }
        } else if (formData.productType === 'orchid' && ['3300', '5500', '11000'].includes(formData.budget)) {
            // Case where user selected orchid but kept a lower preset budget
            alert('胡蝶蘭のご予算は最低15,000円からとなります。「その他」から15,000円以上を入力してください。');
            return;
        } else if (formData.productType === 'stand' && parseInt(formData.budget) < 10000) {
            alert('スタンド花のご予算は最低10,000円からとなります。');
            return;
        }

        setIsLoading(true);

        try {
            const res = await fetch('/api/notify', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });

            if (!res.ok) throw new Error('Notification failed');

            // Generate order number
            const now = new Date();
            const yr = now.getFullYear().toString().slice(-2);
            const mo = (now.getMonth() + 1).toString().padStart(2, '0');
            const dy = now.getDate().toString().padStart(2, '0');
            const rnd = Math.floor(Math.random() * 9000 + 1000);
            setOrderNumber(`SH-${yr}${mo}${dy}-${rnd}`);

            setIsSubmitted(true);
        } catch (error) {
            console.error(error);
            alert('送信に失敗しました。もう一度お試しください。');
        } finally {
            setIsLoading(false);
        }
    };

    // Calculate minimum allowed date (at least 24 hours from now) in local time
    const minDateObj = new Date(Date.now() + 86400000);
    const tzOffset = minDateObj.getTimezoneOffset() * 60000;
    const minDateLocalStr = new Date(minDateObj.getTime() - tzOffset).toISOString().split('T')[0];

    // Generate time slots for pickup (24 hours, 30 min intervals)
    const timeSlots = [];
    for (let i = 0; i < 24; i++) {
        const hour = i.toString().padStart(2, '0');
        timeSlots.push(`${hour}:00`);
        timeSlots.push(`${hour}:30`);
    }

    if (isSubmitted) {
        const displayAmount = formData.budget === 'custom'
            ? parseInt(formData.budgetCustom || '0').toLocaleString()
            : parseInt(formData.budget).toLocaleString();

        const paymentUrl = PAYMENT_LINKS[formData.budget as keyof typeof PAYMENT_LINKS] || PAYMENT_LINKS['custom'];

        return (
            <div className="min-h-screen bg-gradient-to-b from-green-50 to-white p-4 font-sans text-slate-800">
                <div className="max-w-md mx-auto space-y-4 pt-8 pb-16">
                    {/* Success Header */}
                    <Card className="shadow-xl border-none overflow-hidden animate-in fade-in zoom-in duration-300">
                        <CardHeader className="bg-green-50 p-8 text-center border-b border-green-100">
                            <div className="mx-auto bg-green-100 p-4 rounded-full w-20 h-20 flex items-center justify-center shadow-sm mb-4">
                                <CheckCircle2 className="w-10 h-10 text-green-600" />
                            </div>
                            <CardTitle className="text-2xl font-bold text-green-800 mb-2">ご注文ありがとうございます</CardTitle>
                            <CardDescription className="text-slate-600">
                                ご注文を受け付けました。<br />
                                スタッフが確認後、ご連絡いたします。
                            </CardDescription>
                            <div className="mt-4 inline-block bg-white px-4 py-2 rounded-full border border-green-200 shadow-sm">
                                <p className="text-xs text-slate-400 mb-0.5">注文番号</p>
                                <p className="text-lg font-bold text-green-700 tracking-wider">{orderNumber}</p>
                            </div>
                        </CardHeader>
                    </Card>

                    {/* Order Summary Card */}
                    <Card className="shadow-lg border border-slate-100 overflow-hidden">
                        <CardHeader className="bg-slate-50 p-4 border-b border-slate-100">
                            <CardTitle className="text-base font-bold text-slate-700 flex items-center gap-2">
                                📋 ご注文内容
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-0">
                            <div className="divide-y divide-slate-100">
                                <div className="flex justify-between px-5 py-3">
                                    <span className="text-sm text-slate-500">お名前</span>
                                    <span className="text-sm font-semibold text-slate-800">{formData.name}</span>
                                </div>
                                <div className="flex justify-between px-5 py-3">
                                    <span className="text-sm text-slate-500">電話番号</span>
                                    <span className="text-sm font-semibold text-slate-800">{formData.phone}</span>
                                </div>
                                <div className="flex justify-between px-5 py-3">
                                    <span className="text-sm text-slate-500">受取方法</span>
                                    <span className="text-sm font-semibold text-slate-800">
                                        {formData.orderType === 'delivery' ? '🚚 配送' : '🛍 店頭受取'}
                                    </span>
                                </div>
                                {formData.orderType === 'delivery' && (
                                    <>
                                        <div className="flex justify-between px-5 py-3">
                                            <span className="text-sm text-slate-500">配送エリア</span>
                                            <span className="text-sm font-semibold text-slate-800">
                                                {formData.region === 'takamatsu' ? '高松市内' : '高松市外'}
                                            </span>
                                        </div>
                                        <div className="flex justify-between px-5 py-3">
                                            <span className="text-sm text-slate-500">配送希望日</span>
                                            <span className="text-sm font-semibold text-slate-800">{formData.date}</span>
                                        </div>
                                        <div className="flex justify-between px-5 py-3">
                                            <span className="text-sm text-slate-500">希望時間帯</span>
                                            <span className="text-sm font-semibold text-slate-800">
                                                {deliveryTimeMap[formData.deliveryTime] || formData.deliveryTime}
                                            </span>
                                        </div>
                                    </>
                                )}
                                {formData.orderType === 'pickup' && (
                                    <>
                                        <div className="flex justify-between px-5 py-3">
                                            <span className="text-sm text-slate-500">来店予定日</span>
                                            <span className="text-sm font-semibold text-slate-800">{formData.date}</span>
                                        </div>
                                        <div className="flex justify-between px-5 py-3">
                                            <span className="text-sm text-slate-500">来店時間</span>
                                            <span className="text-sm font-semibold text-slate-800">{formData.pickupTime}</span>
                                        </div>
                                    </>
                                )}
                                <div className="flex justify-between px-5 py-3 bg-pink-50/50">
                                    <span className="text-sm text-slate-500">商品タイプ</span>
                                    <span className="text-sm font-bold text-pink-700">
                                        {productTypeMap[formData.productType] || '未選択'}
                                    </span>
                                </div>
                                <div className="flex justify-between px-5 py-3 bg-pink-50/50">
                                    <span className="text-sm text-slate-500">ご予算</span>
                                    <span className="text-sm font-bold text-pink-700">¥{displayAmount}〜</span>
                                </div>
                                <div className="flex justify-between px-5 py-3">
                                    <span className="text-sm text-slate-500">数量</span>
                                    <span className="text-sm font-semibold text-slate-800">{formData.quantity}個</span>
                                </div>
                                {formData.atmosphere && (
                                    <div className="flex justify-between px-5 py-3">
                                        <span className="text-sm text-slate-500">雰囲気</span>
                                        <span className="text-sm font-semibold text-slate-800">
                                            {atmosphereMap[formData.atmosphere] || formData.atmosphere}
                                        </span>
                                    </div>
                                )}
                                {formData.usage && (
                                    <div className="flex justify-between px-5 py-3">
                                        <span className="text-sm text-slate-500">ご用途</span>
                                        <span className="text-sm font-semibold text-slate-800">
                                            {usageMap[formData.usage] || formData.usage}
                                        </span>
                                    </div>
                                )}
                                <div className="flex justify-between px-5 py-3">
                                    <span className="text-sm text-slate-500">お支払い</span>
                                    <span className="text-sm font-semibold text-slate-800">
                                        {formData.paymentMethod === 'credit' ? '💳 クレジットカード' : '💴 受取時にお支払い'}
                                    </span>
                                </div>
                                {formData.message && (
                                    <div className="px-5 py-3">
                                        <span className="text-sm text-slate-500 block mb-1">ご要望</span>
                                        <p className="text-sm text-slate-800 bg-slate-50 p-3 rounded-lg border border-slate-100">{formData.message}</p>
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Screenshot Notice */}
                    <div className="flex items-center gap-3 bg-amber-50 p-4 rounded-xl border border-amber-200 text-amber-800">
                        <Camera className="w-5 h-5 shrink-0" />
                        <p className="text-xs leading-relaxed">
                            <span className="font-bold">この画面をスクリーンショットで保存</span>していただくと、注文内容をいつでもご確認いただけます。
                        </p>
                    </div>

                    {/* Payment Section */}
                    <Card className="shadow-lg border-none overflow-hidden">
                        <CardContent className="p-6 space-y-4">
                            {formData.paymentMethod === 'credit' ? (
                                <>
                                    <p className="text-center text-sm text-slate-500">お支払い手続きをお願いします</p>
                                    <a href={paymentUrl} target="_blank" rel="noopener noreferrer" className="block w-full">
                                        <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-6 text-lg rounded-xl shadow-lg gap-2">
                                            <CreditCard className="w-5 h-5" /> Squareで支払う
                                        </Button>
                                    </a>
                                    <p className="text-xs text-slate-400 text-center">※送料等は別途計算となる場合があります</p>
                                </>
                            ) : (
                                <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 text-slate-600 text-center">
                                    <p className="font-bold mb-1">【お支払いについて】</p>
                                    <p className="text-sm">商品のお受け取り時に、現金またはPayPay等でお支払いください。</p>
                                </div>
                            )}

                            <Button variant="outline" className="w-full" onClick={() => window.location.reload()}>トップに戻る</Button>
                        </CardContent>
                    </Card>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-b from-pink-50 to-white p-4 font-sans text-slate-800">
            <Card className="max-w-md mx-auto shadow-xl border-none overflow-hidden">
                <CardHeader className="bg-pink-100/50 p-6 text-center">
                    <div className="mx-auto bg-white p-3 rounded-full w-16 h-16 flex items-center justify-center shadow-sm mb-2">
                        <ShoppingBag className="w-8 h-8 text-pink-500" />
                    </div>
                    <CardTitle className="text-2xl font-bold text-slate-800 tracking-tight">ご注文フォーム</CardTitle>
                    <CardDescription className="text-slate-600">
                        お届け・来店受取のご予約 (v1.1)
                    </CardDescription>
                </CardHeader>
                <CardContent className="pt-8 px-6">
                    <form onSubmit={handleSubmit} className="space-y-8">

                        {/* Order Type */}
                        <div className="space-y-3 bg-slate-50 p-4 rounded-xl border border-slate-100">
                            <Label className="text-base font-semibold text-slate-800 flex items-center gap-2">
                                <Truck className="w-4 h-4 text-pink-500" /> 受取方法 <span className="text-pink-500">*</span>
                            </Label>
                            <RadioGroup
                                defaultValue="delivery"
                                value={formData.orderType}
                                onValueChange={(val) => setFormData({ ...formData, orderType: val })}
                                className="grid grid-cols-2 gap-4"
                            >
                                <div>
                                    <RadioGroupItem value="delivery" id="delivery" className="peer sr-only" />
                                    <Label
                                        htmlFor="delivery"
                                        className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-white p-4 hover:bg-slate-50 peer-data-[state=checked]:border-pink-500 peer-data-[state=checked]:text-pink-600 cursor-pointer transition-all"
                                    >
                                        <Truck className="mb-2 h-6 w-6" />
                                        配送
                                    </Label>
                                </div>
                                <div>
                                    <RadioGroupItem value="pickup" id="pickup" className="peer sr-only" />
                                    <Label
                                        htmlFor="pickup"
                                        className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-white p-4 hover:bg-slate-50 peer-data-[state=checked]:border-pink-500 peer-data-[state=checked]:text-pink-600 cursor-pointer transition-all"
                                    >
                                        <ShoppingBag className="mb-2 h-6 w-6" />
                                        店頭受取
                                    </Label>
                                </div>
                            </RadioGroup>

                            {/* Conditional Info for Delivery */}
                            {formData.orderType === 'delivery' && (
                                <div className="space-y-3 pt-2">
                                    <div className="space-y-2">
                                        <Label className="text-sm font-medium text-slate-700">配送エリア</Label>
                                        <Select value={formData.region} onValueChange={(val) => setFormData({ ...formData, region: val })}>
                                            <SelectTrigger><SelectValue /></SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="takamatsu">高松市内</SelectItem>
                                                <SelectItem value="other">高松市外 (県内・県外)</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <div className="text-xs text-slate-500 bg-white p-3 rounded border border-slate-200 mt-1">
                                            {formData.region === 'takamatsu' ? '高松市内: 3,000円以上で送料無料' : '市外: 5,000円以上で送料無料'}
                                            <br />
                                            <span className="text-pink-500">※条件未満やスタンド花などは別途ご相談となります</span>
                                        </div>
                                    </div>
                                    <div className="space-y-2 pt-2">
                                        <Label className="text-sm font-medium text-slate-700">お届け希望時間帯</Label>
                                        <Select value={formData.deliveryTime} onValueChange={(val) => setFormData({ ...formData, deliveryTime: val })}>
                                            <SelectTrigger><SelectValue placeholder="希望なし" /></SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="any">希望なし</SelectItem>
                                                <SelectItem value="morning">午前中</SelectItem>
                                                <SelectItem value="14-16">14:00 - 16:00</SelectItem>
                                                <SelectItem value="16-18">16:00 - 18:00</SelectItem>
                                                <SelectItem value="18-20">18:00 - 20:00</SelectItem>
                                                <SelectItem value="19-21">19:00 - 21:00</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <p className="text-xs text-slate-500">※交通事情により前後する場合がございます</p>
                                    </div>
                                    <div className="text-xs text-slate-600 bg-blue-50/70 p-3 rounded border border-blue-100">
                                        <p className="font-bold mb-1">【翌日以降のお届けについて】</p>
                                        <p>翌日のお届けをご希望の場合は、<strong>前日の正午まで</strong>にご注文をお願いいたします。<br />※当日配達などお急ぎの場合は直接お電話でご相談ください。</p>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Date & Time */}
                        <div className="grid grid-cols-1 gap-4">
                            <Label htmlFor="date" className="text-sm font-semibold text-slate-700">
                                {formData.orderType === 'delivery' ? '配送希望日' : '来店予定日'} <span className="text-pink-500">*</span>
                            </Label>
                            <div className="relative">
                                <Input
                                    id="date" type="date" required
                                    min={minDateLocalStr}
                                    className="h-12 text-lg pl-10"
                                    value={formData.date}
                                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                                />
                                <CalendarIcon className="absolute left-3 top-3.5 h-5 w-5 text-slate-400" />
                            </div>

                            {/* Pickup Time */}
                            {formData.orderType === 'pickup' && (
                                <div className="space-y-2">
                                    <Label htmlFor="time" className="text-sm font-semibold text-slate-700">来店時間 <span className="text-pink-500">*</span></Label>
                                    <div className="relative">
                                        <Select value={formData.pickupTime} onValueChange={(val) => setFormData({ ...formData, pickupTime: val })}>
                                            <SelectTrigger className="pl-10 h-12 text-lg">
                                                <SelectValue placeholder="時間を選択" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {timeSlots.map(time => (
                                                    <SelectItem key={time} value={time}>{time}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <Clock className="absolute left-3 top-3.5 h-5 w-5 text-slate-400" />
                                    </div>
                                    <p className="text-xs text-slate-500">※多少余裕を持ったお時間をご指定ください</p>
                                </div>
                            )}
                        </div>

                        {/* Name & Phone */}
                        <div className="grid grid-cols-1 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="name" className="text-sm font-semibold text-slate-700">お名前 <span className="text-pink-500">*</span></Label>
                                <Input id="name" required placeholder="例: 白坂 花子" className="h-12" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="phone" className="text-sm font-semibold text-slate-700">電話番号 <span className="text-pink-500">*</span></Label>
                                <Input id="phone" type="tel" required placeholder="例: 090-1234-5678" className="h-12" value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} />
                            </div>
                        </div>

                        {/* Product Type (New) */}
                        <div className="space-y-3">
                            <Label className="text-base font-semibold text-slate-800">商品タイプ <span className="text-pink-500">*</span></Label>
                            <div className="grid grid-cols-2 gap-3">
                                {[
                                    { id: 'arrangement', label: 'アレンジメント' },
                                    { id: 'bouquet', label: '花束' },
                                    { id: 'stand', label: 'スタンド花' },
                                    { id: 'orchid', label: '胡蝶蘭 (15,000円~)' }
                                ].map((type) => (
                                    <div key={type.id}>
                                        <Button
                                            type="button"
                                            variant={formData.productType === type.id ? "default" : "outline"}
                                            onClick={() => {
                                                const updates: any = { productType: type.id };
                                                // If switching to orchid, reset budget if it's too low or a preset
                                                if (type.id === 'orchid') {
                                                    updates.budget = 'custom';
                                                    updates.budgetCustom = '';
                                                } else if (type.id === 'stand' && formData.budget !== 'custom' && parseInt(formData.budget) < 10000) {
                                                    // If switching to stand and current budget is < 10000
                                                    updates.budget = '10000';
                                                }
                                                setFormData({ ...formData, ...updates });
                                            }}
                                            className={`w-full h-14 text-sm font-medium transition-all ${formData.productType === type.id ? "bg-pink-600 hover:bg-pink-700 shadow-md transform scale-[1.02]" : "bg-white hover:bg-slate-50"}`}
                                        >
                                            {type.label}
                                        </Button>
                                    </div>
                                ))}
                            </div>
                            <div className="mt-3 p-3 bg-slate-50 rounded text-xs text-slate-600 border border-slate-100 space-y-1.5">
                                <p className="font-bold flex items-center gap-1">💡 商品の選び方・サイズの目安</p>
                                <p><strong>アレンジメント:</strong> カゴや器に入っており、そのまま飾れます。3,300円で食卓サイズ（約20cm）、5,500円で少しボリュームが出ます。</p>
                                <p><strong>花束:</strong> 花瓶にいけて飾るタイプ。発表会や送別会など、直接手渡しする際におすすめです。</p>
                                <p><strong>スタンド花:</strong> 開店祝などに適しています（最低10,000円から）。</p>
                                <p><strong>胡蝶蘭:</strong> 開店祝などに適しています（最低15,000円から、事前予約を推奨）。</p>
                            </div>
                        </div>

                        {/* Budget */}
                        <div className="space-y-3">
                            <Label className="text-sm font-semibold text-slate-700">ご予算 (税込)</Label>
                            <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                                {formData.productType !== 'orchid' && normalBudgets.map((price) => {
                                    // Stand minimum 10k
                                    if (formData.productType === 'stand' && parseInt(price) < 10000) return null;

                                    return (
                                        <Button
                                            key={price} type="button"
                                            variant={formData.budget === price ? "default" : "outline"}
                                            onClick={() => setFormData({ ...formData, budget: price, budgetCustom: '' })}
                                            className={`h-12 text-sm font-medium transition-all ${formData.budget === price ? "bg-pink-600 hover:bg-pink-700 shadow-md transform scale-[1.02]" : "bg-white hover:bg-slate-50"} ${formData.productType === 'stand' && price === '10000' ? 'col-span-2' : ''}`}
                                        >
                                            {parseInt(price).toLocaleString()}円
                                        </Button>
                                    );
                                })}
                                <Button
                                    type="button"
                                    variant={formData.budget === 'custom' ? "default" : "outline"}
                                    onClick={() => setFormData({ ...formData, budget: 'custom' })}
                                    className={`h-12 text-sm font-medium transition-all ${formData.budget === 'custom' ? "bg-pink-600 hover:bg-pink-700 shadow-md " : "bg-white hover:bg-slate-50"} ${formData.productType === 'orchid' ? 'col-span-3' : ''} ${formData.productType === 'stand' ? 'col-span-2' : ''}`}
                                >
                                    {formData.productType === 'orchid' ? '金額を指定 (15,000円~)' : formData.productType === 'stand' ? '金額を指定 (10,000円~)' : 'その他'}
                                </Button>
                            </div>
                            {formData.budget === 'custom' && (
                                <div className="space-y-2 pt-2">
                                    <div className="relative">
                                        <Input
                                            type="number"
                                            min={formData.productType === 'orchid' ? "15000" : formData.productType === 'stand' ? "10000" : "2000"}
                                            placeholder={formData.productType === 'orchid' ? "金額を入力 (15000円以上)" : formData.productType === 'stand' ? "金額を入力 (10000円以上)" : "金額を入力 (2000円以上)"}
                                            className="h-12 pl-4"
                                            value={formData.budgetCustom}
                                            onChange={(e) => setFormData({ ...formData, budgetCustom: e.target.value })}
                                        />
                                        <span className="absolute right-4 top-3.5 text-slate-500 font-bold">円</span>
                                    </div>
                                    <p className="text-xs text-red-500 font-medium">
                                        {formData.productType === 'orchid' ? '※ 胡蝶蘭は最低15,000円からとなります。' : formData.productType === 'stand' ? '※ スタンド花は最低10,000円からとなります。' : '※ 最低2,000円からとなります。'}
                                    </p>
                                </div>
                            )}
                        </div>

                        {/* Atmosphere (Color/Style) Selection */}
                        <div className="space-y-3 bg-pink-50/50 p-4 rounded-xl border border-pink-100">
                            <Label className="text-base font-semibold text-slate-800 flex items-center gap-2">
                                ご希望の雰囲気
                            </Label>

                            {currentBudgetVal <= 2000 && (
                                <div className="text-xs bg-yellow-50 text-yellow-800 p-2 rounded border border-yellow-200 mb-2">
                                    ※ 2,000円以下の商品は、コストの都合上「暖色系」「寒色系」「ビタミン」の3択となります。
                                </div>
                            )}

                            <div className="grid grid-cols-3 gap-3">
                                {availableAtmospheres.map((atm) => (
                                    <div
                                        key={atm.id}
                                        onClick={() => setFormData({ ...formData, atmosphere: atm.id })}
                                        className={`cursor-pointer rounded-xl overflow-hidden border-2 transition-all ${formData.atmosphere === atm.id ? 'border-pink-500 ring-2 ring-pink-200 transform scale-[1.02]' : 'border-transparent hover:border-pink-200'}`}
                                    >
                                        <div className="aspect-square relative bg-slate-100">
                                            {/* eslint-disable-next-line @next/next/no-img-element */}
                                            <img src={atm.src} alt={atm.label} className="w-full h-full object-cover" />
                                        </div>
                                        <div className={`text-center py-2 text-xs font-bold ${formData.atmosphere === atm.id ? 'bg-pink-500 text-white' : 'bg-white text-slate-700 border-x border-b border-slate-200'}`}>
                                            {atm.label}
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="mt-3 p-3 bg-white rounded text-xs text-red-600 border border-slate-200 shadow-sm leading-relaxed">
                                <strong>⚠️ お花のご指定に関するご注意</strong><br />
                                時期によって入荷できないものは他のお花で代用いたします。<br />
                                <span className="text-slate-600">※ お花の極力のご指定がある場合は、下部の「ご要望」欄へご記入ください。価格とご希望が合わない場合はご相談させていただきます。</span>
                            </div>
                        </div>

                        {/* Payment Method */}
                        <div className="space-y-3 bg-slate-50 p-4 rounded-xl border border-slate-100">
                            <Label className="text-base font-semibold text-slate-800 flex items-center gap-2">
                                <CreditCard className="w-4 h-4 text-pink-500" /> お支払い方法 <span className="text-pink-500">*</span>
                            </Label>
                            <RadioGroup
                                defaultValue="credit"
                                value={formData.paymentMethod}
                                onValueChange={(val) => setFormData({ ...formData, paymentMethod: val })}
                                className="grid grid-cols-1 gap-3"
                            >
                                <div>
                                    <RadioGroupItem value="credit" id="credit" className="peer sr-only" />
                                    <Label
                                        htmlFor="credit"
                                        className="flex items-center justify-between rounded-md border-2 border-muted bg-white p-4 hover:bg-slate-50 peer-data-[state=checked]:border-pink-500 peer-data-[state=checked]:text-pink-600 cursor-pointer transition-all"
                                    >
                                        <div className="flex items-center gap-3">
                                            <CreditCard className="h-5 w-5" />
                                            <div className="flex flex-col">
                                                <span className="font-semibold">クレジットカード (Square)</span>
                                                <span className="text-xs text-slate-500">今すぐオンラインで決済</span>
                                            </div>
                                        </div>
                                    </Label>
                                </div>
                                <div>
                                    <RadioGroupItem value="onsite" id="onsite" className="peer sr-only" />
                                    <Label
                                        htmlFor="onsite"
                                        className="flex items-center justify-between rounded-md border-2 border-muted bg-white p-4 hover:bg-slate-50 peer-data-[state=checked]:border-pink-500 peer-data-[state=checked]:text-pink-600 cursor-pointer transition-all"
                                    >
                                        <div className="flex items-center gap-3">
                                            <Banknote className="h-5 w-5" />
                                            <div className="flex flex-col">
                                                <span className="font-semibold">受取時にお支払い</span>
                                                <span className="text-xs text-slate-500">来店時または配送受取時</span>
                                            </div>
                                        </div>
                                    </Label>
                                </div>
                            </RadioGroup>
                        </div>

                        {/* Usage & Quantity */}
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="usage" className="text-sm font-semibold text-slate-700">ご用途</Label>
                                <Select onValueChange={(val) => setFormData({ ...formData, usage: val })}>
                                    <SelectTrigger className="h-12"><SelectValue placeholder="選択" /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="birthday">🎂 お誕生日</SelectItem>
                                        <SelectItem value="anniversary">💍 記念日</SelectItem>
                                        <SelectItem value="opening">🎊 開店祝い</SelectItem>
                                        <SelectItem value="funeral">🕊 お供え</SelectItem>
                                        <SelectItem value="home">🏠 ご自宅用</SelectItem>
                                        <SelectItem value="other">🎸 その他</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="quantity" className="text-sm font-semibold text-slate-700">数量</Label>
                                <div className="relative">
                                    <Input
                                        id="quantity" type="number" min="1"
                                        className="h-12 pl-10"
                                        value={formData.quantity}
                                        onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                                    />
                                    <Package className="absolute left-3 top-3.5 h-5 w-5 text-slate-400" />
                                </div>
                            </div>
                        </div>

                        {/* Message */}
                        <div className="space-y-2">
                            <Label htmlFor="message" className="text-sm font-semibold text-slate-700">メッセージ / ご要望</Label>
                            <Textarea
                                id="message"
                                placeholder="例: メッセージカード「おめでとう！」希望。赤系でまとめて。"
                                className="min-h-[100px] text-base"
                                value={formData.message}
                                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                            />
                        </div>

                        <Button type="submit" disabled={isLoading} className="w-full bg-pink-600 hover:bg-pink-700 text-white font-bold py-6 text-xl rounded-xl shadow-lg hover:shadow-xl transition-all mt-4">
                            {isLoading ? '送信中...' : '注文内容を確認する'}
                        </Button>
                    </form>
                </CardContent>
            </Card>

            {/* FAQ Section */}
            <div className="max-w-md mx-auto mt-8 px-4">
                <h3 className="text-sm font-bold text-slate-700 mb-4 flex items-center gap-2">
                    <span className="bg-slate-200 text-slate-600 text-xs px-2 py-0.5 rounded-full">FAQ</span>
                    よくあるお問い合わせ
                </h3>
                <div className="space-y-4">
                    <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-100">
                        <p className="text-sm font-bold text-slate-800 mb-2">Q. お花が完成した写真を送ってもらえますか？</p>
                        <p className="text-sm text-slate-600">A. はい、可能です。「メッセージ/ご要望」欄に写真希望の旨と送付先（LINE等）をご記入ください。</p>
                    </div>
                    <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-100">
                        <p className="text-sm font-bold text-slate-800 mb-2">Q. 当日の予約はできますか？</p>
                        <p className="text-sm text-slate-600">A. 原則として、品質保持のため**24時間以上前**（前日）までのご予約をお願いしております。当日のご予約はお受けできませんのでご了承ください。</p>
                    </div>
                </div>
            </div>

            <p className="text-center text-xs text-slate-400 mt-8 pb-8">© Shirasaka Flower Shop</p>
        </div>
    );
}
