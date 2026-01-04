import { db } from './storage';
import { Paste } from './types';

export class PasteError extends Error {
    constructor(message: string, public status: number) {
        super(message);
    }
}

export async function getPasteAndConsume(id: string, now: number = Date.now()): Promise<Paste> {
    const paste = await db.getPaste(id);

    if (!paste) {
        throw new PasteError('Paste not found', 404);
    }

    if (paste.expires_at !== null && paste.expires_at !== undefined) {
        if (now >= paste.expires_at) {
            throw new PasteError('Paste expired', 404);
        }
    }

    if (paste.max_views !== null && paste.max_views !== undefined) {
        if (paste.views_count >= paste.max_views) {
            throw new PasteError('View limit exceeded', 404);
        }
    }

    paste.views_count += 1;
    await db.updatePaste(paste);

    return paste;
}
