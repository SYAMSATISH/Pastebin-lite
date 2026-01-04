import { NextResponse } from 'next/server';
import { getPasteAndConsume, PasteError } from '@/lib/pastes';

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;

    const isTestMode = process.env.TEST_MODE === '1';
    let now = Date.now();

    if (isTestMode) {
        const testNowHeader = request.headers.get('x-test-now-ms');
        if (testNowHeader) {
            const parsed = parseInt(testNowHeader, 10);
            if (!isNaN(parsed)) {
                now = parsed;
            }
        }
    }

    try {
        const paste = await getPasteAndConsume(id, now);

        const remaining = paste.max_views !== null && paste.max_views !== undefined
            ? Math.max(0, paste.max_views - paste.views_count)
            : null;

        return NextResponse.json({
            content: paste.content,
            remaining_views: remaining,
            expires_at: paste.expires_at ? new Date(paste.expires_at).toISOString() : null
        });

    } catch (error) {
        if (error instanceof PasteError) {
            return NextResponse.json({ error: error.message }, { status: error.status });
        }
        console.error('Get paste failed:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
