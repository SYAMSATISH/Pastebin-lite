import { headers } from 'next/headers';
import { notFound } from 'next/navigation';
import { getPasteAndConsume, PasteError } from '@/lib/pastes';
import Link from 'next/link';

export default async function ViewPaste({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const headersList = await headers();

    const isTestMode = process.env.TEST_MODE === '1';
    let now = Date.now();

    if (isTestMode) {
        const testNowHeader = headersList.get('x-test-now-ms');
        if (testNowHeader) {
            const parsed = parseInt(testNowHeader, 10);
            if (!isNaN(parsed)) {
                now = parsed;
            }
        }
    }

    let paste;
    try {
        paste = await getPasteAndConsume(id, now);
    } catch (err) {
        if (err instanceof PasteError && err.status === 404) {
            notFound();
        }
        throw err;
    }

    return (
        <div className="min-h-screen bg-slate-950 text-slate-200 p-8 flex justify-center">
            <div className="w-full max-w-3xl space-y-6">
                <h1 className="text-2xl font-bold text-slate-400 border-b border-white/10 pb-4">
                    Paste <span className="text-indigo-400">{id}</span>
                </h1>
                <div className="relative group">
                    <pre className="bg-slate-900/50 border border-white/10 rounded-xl p-6 font-mono text-sm whitespace-pre-wrap break-words overflow-auto max-h-[80vh] selection:bg-indigo-500/30">
                        {paste.content}
                    </pre>
                </div>
                <div className="text-xs text-slate-500 flex gap-4">
                    <span>Created: {new Date(paste.created_at).toLocaleString()}</span>
                    {paste.expires_at && (
                        <span>Expires: {new Date(paste.expires_at).toLocaleString()}</span>
                    )}
                    {paste.max_views && (
                        <span>Views: {paste.views_count} / {paste.max_views}</span>
                    )}
                </div>
                <div className="pt-4">
                    <Link href="/" className="text-indigo-400 hover:text-indigo-300 transition-colors text-sm">
                        &larr; Create New Paste
                    </Link>
                </div>
            </div>
        </div>
    );
}
