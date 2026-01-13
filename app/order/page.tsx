'use client';

import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { CalendarIcon, CreditCard, Banknote, ShoppingBag, Truck, Clock, MapPin, Package } from "lucide-react";

export default function OrderPage() {
    const [formData, setFormData] = useState({
        name: '',
        phone: '',
        date: '',
        orderType: 'delivery', // 'delivery' | 'pickup'
        region: 'takamatsu',   // 'takamatsu' | 'other'
        pickupTime: '10:00',
        usage: '',
        budget: '',
        budgetCustom: '',
        quantity: '1',
        message: '',
        paymentMethod: 'credit'
    });

    const [isSubmitted, setIsSubmitted] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    // Mock Square Links (Same as before, simplified for this example)
    const PAYMENT_LINKS = {
        '3300': 'https://square.link/u/B3FkQL5S',
        '5500': 'https://square.link/u/cRv8q9eh',
        '11000': 'https://square.link/u/qMcNrqQe',
        'custom': 'https://square.link/u/zD979fe1',
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Validation for Budget
        if (formData.budget === 'custom') {
            const amount = parseInt(formData.budgetCustom);
            if (isNaN(amount) || amount < 2000) {
                alert('ご予算は最低2,000円からとなります。');
                return;
            }
        }

        setIsLoading(true);

        try {
            const res = await fetch('/api/notify', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });

            if (!res.ok) throw new Error('Notification failed');

            setIsSubmitted(true);
        } catch (error) {
            console.error(error);
            alert('送信に失敗しました。もう一度お試しください。');
        } finally {
            setIsLoading(false);
        }
    };

    // Generate time slots for pickup (24 hours, 30 min intervals)
    const timeSlots = [];
    for (let i = 0; i < 24; i++) {
        const hour = i.toString().padStart(2, '0');
        timeSlots.push(`${hour}:00`);
        timeSlots.push(`${hour}:30`);
    }

    if (isSubmitted) {
        // Simple success view (Updated with basics, keeping it simple as per original)
        const displayAmount = formData.budget === 'custom'
            ? parseInt(formData.budgetCustom || '0').toLocaleString()
            : parseInt(formData.budget).toLocaleString();

        const paymentUrl = PAYMENT_LINKS[formData.budget as keyof typeof PAYMENT_LINKS] || PAYMENT_LINKS['custom'];

        return (
            <div className="min-h-screen bg-gradient-to-b from-pink-50 to-white p-4 font-sans text-slate-800 flex items-center justify-center">
                <Card className="max-w-md w-full shadow-xl border-none overflow-hidden animate-in fade-in zoom-in duration-300">
                    <CardHeader className="bg-green-50 p-8 text-center">
                        <div className="mx-auto bg-green-100 p-4 rounded-full w-20 h-20 flex items-center justify-center shadow-sm mb-4">
                            <Truck className="w-10 h-10 text-green-600" />
                        </div>
                        <CardTitle className="text-2xl font-bold text-green-800 mb-2">ご注文ありがとうございます</CardTitle>
                        <CardDescription className="text-slate-600">
                            内容を承りました。<br />支払い手続きをお願いします。
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="p-8 space-y-6 text-center">
                        <p className="text-3xl font-bold text-slate-900">¥{displayAmount} <span className="text-base font-normal text-slate-500">~</span></p>
                        <p className="text-sm text-slate-500">※送料等は別途計算となる場合があります</p>
                        <a href={paymentUrl} target="_blank" rel="noopener noreferrer" className="block w-full">
                            <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-6 text-lg rounded-xl shadow-lg gap-2">
                                <CreditCard className="w-5 h-5" /> Squareで支払う
                            </Button>
                        </a>
                        <Button variant="outline" className="w-full" onClick={() => window.location.reload()}>トップに戻る</Button>
                    </CardContent>
                </Card>
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
                        お届け・来店受取のご予約
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
                                    </div>
                                    <div className="text-xs text-slate-500 bg-white p-3 rounded border border-slate-200">
                                        {formData.region === 'takamatsu' ? '高松市内: 3,000円以上で送料無料' : '市外: 5,000円以上で送料無料'}
                                        <br />
                                        <span className="text-pink-500">※条件未満やスタンド花などは別途ご相談となります</span>
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
                                    min={new Date(Date.now() + 86400000).toISOString().split('T')[0]}
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

                        {/* Budget */}
                        <div className="space-y-3">
                            <Label className="text-sm font-semibold text-slate-700">ご予算</Label>
                            <div className="grid grid-cols-2 gap-3">
                                {['3300', '5500', '11000'].map((price) => (
                                    <Button
                                        key={price} type="button"
                                        variant={formData.budget === price ? "default" : "outline"}
                                        onClick={() => setFormData({ ...formData, budget: price, budgetCustom: '' })}
                                        className={`h-14 text-lg font-medium transition-all ${formData.budget === price ? "bg-pink-600 hover:bg-pink-700 shadow-md transform scale-[1.02]" : "bg-white hover:bg-slate-50"}`}
                                    >
                                        {parseInt(price).toLocaleString()}円
                                    </Button>
                                ))}
                                <Button
                                    type="button"
                                    variant={formData.budget === 'custom' ? "default" : "outline"}
                                    onClick={() => setFormData({ ...formData, budget: 'custom' })}
                                    className={`h-14 text-lg font-medium transition-all ${formData.budget === 'custom' ? "bg-pink-600 hover:bg-pink-700 shadow-md transform scale-[1.02]" : "bg-white hover:bg-slate-50"}`}
                                >
                                    その他 (2000円~)
                                </Button>
                            </div>
                            {formData.budget === 'custom' && (
                                <div className="space-y-2">
                                    <div className="relative">
                                        <Input
                                            type="number" min="2000" placeholder="金額を入力 (2000円以上)"
                                            className="h-12 text-lg pl-10"
                                            value={formData.budgetCustom}
                                            onChange={(e) => setFormData({ ...formData, budgetCustom: e.target.value })}
                                        />
                                        <Banknote className="absolute left-3 top-3.5 h-5 w-5 text-slate-400" />
                                        <span className="absolute right-4 top-3.5 text-slate-500">円</span>
                                    </div>
                                    <p className="text-xs text-red-500 font-medium">※ 最低2,000円からとなります。</p>
                                </div>
                            )}
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
            <p className="text-center text-xs text-slate-400 mt-8 pb-4">© Shirasaka Flower Shop</p>
        </div>
    );
}
