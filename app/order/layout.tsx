import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "ご注文フォーム | Shirasaka Flower Shop",
    description: "お祝い、お供え、その他用途に合わせたフラワーギフトのご注文を承ります。",
};

export default function OrderLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return <>{children}</>;
}
