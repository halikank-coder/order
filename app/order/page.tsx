'use client';

import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { CalendarIcon, CreditCard, Banknote, ShoppingBag, Truck } from "lucide-react";

export default function OrderPage() {
    const [formData, setFormData] = useState({
        name: '',
        phone: '',
        date: '',
        usage: '',
        budget: '',
        budgetCustom: '',
        message: '',
        paymentMethod: 'credit'
    });

    const [isSubmitted, setIsSubmitted] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    // Mock Square Links - In production, these would be env vars or fetched from config
    const PAYMENT_LINKS = {
        '3300': 'https://square.link/u/B3FkQL5S',
        '5500': 'https://square.link/u/cRv8q9eh',
        '11000': 'https://square.link/u/qMcNrqQe',
        'custom': 'https://square.link/u/zD979fe1',
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            const res = await fetch('/api/notify', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });

            if (!res.ok) {
                throw new Error('Notification failed');
            }

            console.log("Order Data Sent & Notification Triggered");
            setIsSubmitted(true);
        } catch (error) {
            console.error(error);
            alert('送信に失敗しました。もう一度お試しください。');
        } finally {
            setIsLoading(false);
        }
    };

    if (isSubmitted) {
        const paymentUrl = PAYMENT_LINKS[formData.budget as keyof typeof PAYMENT_LINKS];
        const displayAmount = formData.budget === 'custom'
            ? parseInt(formData.budgetCustom || '0').toLocaleString()
            : parseInt(formData.budget).toLocaleString();

        return (
            <div className="min-h-screen bg-gradient-to-b from-pink-50 to-white p-4 font-sans text-slate-800 flex items-center justify-center">
                <Card className="max-w-md w-full shadow-xl border-none overflow-hidden animate-in fade-in zoom-in duration-300">
                    <CardHeader className="bg-green-50 p-8 text-center">
                        <div className="mx-auto bg-green-100 p-4 rounded-full w-20 h-20 flex items-center justify-center shadow-sm mb-4">
                            <Truck className="w-10 h-10 text-green-600" />
                        </div>
                        <CardTitle className="text-2xl font-bold text-green-800 mb-2">ご注文ありがとうございます</CardTitle>
                        <CardDescription className="text-slate-600">
                            内容を承りました。<br />
                            以下のボタンからお支払い手続きをお願いいたします。
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="p-8 space-y-6">
                        <div className="text-center space-y-4">
                            <p className="text-sm font-medium text-slate-500">お支払い金額</p>
                            <p className="text-3xl font-bold text-slate-900">¥{displayAmount}</p>
                            {formData.budget === 'custom' && (
                                <p className="text-sm text-red-500 font-medium bg-red-50 p-2 rounded">
                                    ※ 決済画面にて、上記の金額をご自身で入力してください。
                                </p>
                            )}
                            <a
                                href={paymentUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="block w-full"
                            >
                                <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-6 text-lg rounded-xl shadow-lg transition-all flex items-center justify-center gap-2">
                                    <CreditCard className="w-5 h-5" />
                                    Squareで支払う
                                </Button>
                            </a>
                            <p className="text-xs text-slate-400 mt-2">
                                ※ 外部の安全な決済ページ(Square)へ移動します
                            </p>
                        </div>

                        <Button variant="outline" className="w-full" onClick={() => window.location.reload()}>
                            トップに戻る
                        </Button>
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
                        素敵なフラワーギフトをお届けします。
                    </CardDescription>
                </CardHeader>
                <CardContent className="pt-8 px-6">
                    <form onSubmit={handleSubmit} className="space-y-8">

                        {/* Name */}
                        <div className="space-y-2">
                            <Label htmlFor="name" className="text-sm font-semibold text-slate-700">お名前 <span className="text-pink-500">*</span></Label>
                            <Input
                                id="name"
                                required
                                placeholder="例: 白坂 花子"
                                className="h-12 text-lg bg-slate-50 border-slate-200 focus:border-pink-300 focus:ring-pink-300"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            />
                        </div>

                        {/* Phone */}
                        <div className="space-y-2">
                            <Label htmlFor="phone" className="text-sm font-semibold text-slate-700">電話番号 <span className="text-pink-500">*</span></Label>
                            <Input
                                id="phone"
                                type="tel"
                                required
                                placeholder="例: 090-1234-5678"
                                className="h-12 text-lg bg-slate-50 border-slate-200 focus:border-pink-300 focus:ring-pink-300"
                                value={formData.phone}
                                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                            />
                        </div>

                        {/* Date */}
                        <div className="space-y-2">
                            <Label htmlFor="date" className="text-sm font-semibold text-slate-700">受取・配送希望日 <span className="text-pink-500">*</span></Label>
                            <div className="relative">
                                <Input
                                    id="date"
                                    type="date"
                                    required
                                    className="h-12 text-lg bg-slate-50 border-slate-200 focus:border-pink-300 focus:ring-pink-300 pl-10"
                                    value={formData.date}
                                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                                />
                                <CalendarIcon className="absolute left-3 top-3.5 h-5 w-5 text-slate-400" />
                            </div>
                        </div>

                        {/* Usage */}
                        <div className="space-y-2">
                            <Label htmlFor="usage" className="text-sm font-semibold text-slate-700">ご用途</Label>
                            <Select onValueChange={(val) => setFormData({ ...formData, usage: val })}>
                                <SelectTrigger className="h-12 text-lg bg-slate-50 border-slate-200 focus:border-pink-300 focus:ring-pink-300">
                                    <SelectValue placeholder="選択してください" />
                                </SelectTrigger>
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

                        {/* Budget */}
                        <div className="space-y-3">
                            <Label className="text-sm font-semibold text-slate-700">ご予算</Label>
                            <div className="grid grid-cols-2 gap-3 mb-2">
                                <Button
                                    type="button"
                                    variant={formData.budget === '3300' ? "default" : "outline"}
                                    onClick={() => setFormData({ ...formData, budget: '3300', budgetCustom: '' })}
                                    className={`h-14 text-lg font-medium transition-all ${formData.budget === '3300' ? "bg-pink-600 hover:bg-pink-700 shadow-md transform scale-[1.02]" : "bg-white hover:bg-slate-50"}`}
                                >
                                    3,300円
                                </Button>
                                <Button
                                    type="button"
                                    variant={formData.budget === '5500' ? "default" : "outline"}
                                    onClick={() => setFormData({ ...formData, budget: '5500', budgetCustom: '' })}
                                    className={`h-14 text-lg font-medium transition-all ${formData.budget === '5500' ? "bg-pink-600 hover:bg-pink-700 shadow-md transform scale-[1.02]" : "bg-white hover:bg-slate-50"}`}
                                >
                                    5,500円
                                </Button>
                                <Button
                                    type="button"
                                    variant={formData.budget === '11000' ? "default" : "outline"}
                                    onClick={() => setFormData({ ...formData, budget: '11000', budgetCustom: '' })}
                                    className={`h-14 text-lg font-medium transition-all ${formData.budget === '11000' ? "bg-pink-600 hover:bg-pink-700 shadow-md transform scale-[1.02]" : "bg-white hover:bg-slate-50"}`}
                                >
                                    11,000円
                                </Button>
                                <Button
                                    type="button"
                                    variant={formData.budget === 'custom' ? "default" : "outline"}
                                    onClick={() => setFormData({ ...formData, budget: 'custom' })}
                                    className={`h-14 text-lg font-medium transition-all ${formData.budget === 'custom' ? "bg-pink-600 hover:bg-pink-700 shadow-md transform scale-[1.02]" : "bg-white hover:bg-slate-50"}`}
                                >
                                    その他
                                </Button>
                            </div>
                            {formData.budget === 'custom' && (
                                <div className="animate-in fade-in slide-in-from-top-2 duration-200">
                                    <div className="relative">
                                        <Input
                                            type="number"
                                            placeholder="ご希望の金額"
                                            className="h-12 text-lg bg-slate-50 border-slate-200 focus:border-pink-300 focus:ring-pink-300 pl-10"
                                            value={formData.budgetCustom}
                                            onChange={(e) => setFormData({ ...formData, budgetCustom: e.target.value })}
                                        />
                                        <Banknote className="absolute left-3 top-3.5 h-5 w-5 text-slate-400" />
                                        <span className="absolute right-4 top-3.5 text-slate-500">円</span>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Message */}
                        <div className="space-y-2">
                            <Label htmlFor="message" className="text-sm font-semibold text-slate-700">メッセージカード / その他ご要望</Label>
                            <Textarea
                                id="message"
                                placeholder="例: メッセージカード「お誕生日おめでとう！」をお願いします。赤系でまとめてほしいです。"
                                className="bg-slate-50 border-slate-200 focus:border-pink-300 focus:ring-pink-300 min-h-[100px] text-base"
                                value={formData.message}
                                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                            />
                        </div>

                        <Button type="submit" className="w-full bg-pink-600 hover:bg-pink-700 text-white font-bold py-6 text-xl rounded-xl shadow-lg hover:shadow-xl transition-all mt-4 transform active:scale-95">
                            注文を確認する
                        </Button>
                    </form>
                </CardContent>
            </Card>

            <p className="text-center text-xs text-slate-400 mt-8 pb-4">
                © Shirasaka Flower Shop
            </p>
        </div>
    );
}
