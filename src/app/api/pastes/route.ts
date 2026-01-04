import { NextResponse } from 'next/server';
import { db } from '@/lib/storage';
import { nanoid } from 'nanoid';
import { Paste } from '@/lib/types';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { content, ttl_seconds, max_views } = body;

        if (typeof content !== 'string' || content.trim().length === 0) {
            return NextResponse.json({ error: 'Content is required and must be a non-empty string' }, { status: 400 });
        }

        if (ttl_seconds !== undefined && (!Number.isInteger(ttl_seconds) || ttl_seconds < 1)) {
            return NextResponse.json({ error: 'ttl_seconds must be an integer >= 1' }, { status: 400 });
        }

        if (max_views !== undefined && (!Number.isInteger(max_views) || max_views < 1)) {
            return NextResponse.json({ error: 'max_views must be an integer >= 1' }, { status: 400 });
        }

        const id = nanoid(8);
        const now = Date.now();
        const expires_at = ttl_seconds ? now + (ttl_seconds * 1000) : null;

        const paste: Paste = {
            id,
            content,
            created_at: now,
            expires_at: expires_at, // possibly null
            max_views: max_views || null,
            views_count: 0
        };

        await db.createPaste(paste);

        const host = request.headers.get('host');
        const protocol = request.headers.get('x-forwarded-proto') || 'http';
        const url = `${protocol}://${host}/p/${id}`;

        return NextResponse.json({ id, url }, { status: 200 });

    } catch (error) {
        console.error('Create paste failed:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
