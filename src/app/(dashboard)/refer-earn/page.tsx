"use client";

import dynamic from 'next/dynamic';

const ReferEarn = dynamic(() => import("@/components/ReferEarn/page"), {
  ssr: false,
});

export default function ReferEarnPage() {
  return <ReferEarn />;
} 