'use client';

import { useEffect, useState } from 'react';

export default function DebugIdPage() {
    const [userId, setUserId] = useState<string>('Loading...');
    const [error, setError] = useState<string>('');

    useEffect(() => {
        const initLiff = async () => {
            try {
                const liff = (await import('@line/liff')).default;
                // Keep this ID standard or use env var. 
                // Note: You need to add this page URL to your LIFF Endpoint in LINE Dev Console to make it work perfectly,
                // OR just open it in external browser if LIFF ID is not set yet (but getting ID needs LIFF context).
                // For now, we assume users will configure the LIFF ID in the code or env.
                // Since we don't have the LIFF ID yet, we will ask the user to input it or set it up.
                // Actually, for this to work without LIFF ID hardcoded, we might need a dynamic approach.
                // BUT, standard way is to use the existing LIFF ID for the order form.

                // Let's use a placeholder and instruct user to set it if needed, 
                // but easier way: just tell them the ID is in the "Basic Information" tab of LIFF.

                // Wait, if they haven't set up LIFF yet, this page won't work.
                // Let's assume they use the LIFF ID created for the Order Form.
                await liff.init({ liffId: process.env.NEXT_PUBLIC_LIFF_ID || 'YOUR_LIFF_ID' });

                if (!liff.isLoggedIn()) {
                    liff.login();
                    return;
                }

                const profile = await liff.getProfile();
                setUserId(profile.userId);
            } catch (e: any) {
                setError(e.message || 'LIFF init failed');
                setUserId('Error');
            }
        };

        initLiff();
    }, []);

    return (
        <div className="min-h-screen p-8 bg-slate-100 font-mono">
            <h1 className="text-xl font-bold mb-4">User ID Debugger</h1>
            <div className="bg-white p-6 rounded shadow">
                <p className="text-sm text-slate-500 mb-2">Your User ID:</p>
                <p className="text-2xl font-bold text-blue-600 break-all">{userId}</p>
            </div>
            {error && (
                <div className="mt-4 p-4 bg-red-100 text-red-700 rounded">
                    Error: {error}
                </div>
            )}
            <p className="mt-8 text-sm text-slate-500">
                Copy the ID above and paste it into Vercel Environment Variables as <code>LINE_ADMIN_USER_ID</code>.
            </p>
        </div>
    );
}
