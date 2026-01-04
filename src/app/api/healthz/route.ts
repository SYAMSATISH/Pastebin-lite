import { NextResponse } from 'next/server';
import { db } from '@/lib/storage';

export async function GET() {
    try {
        await db.getPaste('health-check-probe');
        return NextResponse.json({ ok: true }, { status: 200 });
    } catch (error) {
        console.error('Health check failed:', error);
        return NextResponse.json({ ok: false }, { status: 503 });
    }
}
