import { kv } from "@vercel/kv";
import fs from "fs/promises";
import path from "path";
import { Paste } from "./types";

const DATA_DIR = path.join(process.cwd(), "data");
const DATA_FILE = path.join(DATA_DIR, "store.json");

const USE_KV = !!process.env.KV_REST_API_URL;

async function ensureDataDir() {
    try {
        await fs.mkdir(DATA_DIR, { recursive: true });
    } catch (e) {
        // ignore
    }
}

async function readLocalStore(): Promise<Record<string, Paste>> {
    try {
        await ensureDataDir();
        const data = await fs.readFile(DATA_FILE, "utf-8");
        return JSON.parse(data);
    } catch (error) {
        if ((error as any).code === "ENOENT") {
            return {};
        }
        throw error;
    }
}

async function writeLocalStore(data: Record<string, Paste>) {
    await ensureDataDir();
    await fs.writeFile(DATA_FILE, JSON.stringify(data, null, 2));
}

export const db = {
    async getPaste(id: string): Promise<Paste | null> {
        if (USE_KV) {
            return await kv.get<Paste>(`paste:${id}`);
        } else {
            const store = await readLocalStore();
            return store[id] || null;
        }
    },

    async createPaste(paste: Paste): Promise<void> {
        if (USE_KV) {
            // Not setting redis-level TTL to ensure deterministic time testing capability
            // even if real time passes differently.
            await kv.set(`paste:${paste.id}`, paste);
        } else {
            const store = await readLocalStore();
            store[paste.id] = paste;
            await writeLocalStore(store);
        }
    },

    async updatePaste(paste: Paste): Promise<void> {
        if (USE_KV) {
            await kv.set(`paste:${paste.id}`, paste);
        } else {
            const store = await readLocalStore();
            store[paste.id] = paste;
            await writeLocalStore(store);
        }
    },

    async deletePaste(id: string): Promise<void> {
        if (USE_KV) {
            await kv.del(`paste:${id}`);
        } else {
            const store = await readLocalStore();
            delete store[id];
            await writeLocalStore(store);
        }
    }
};
