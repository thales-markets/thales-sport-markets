// src/utils/axiosTotp.ts
import axios, { AxiosHeaders, InternalAxiosRequestConfig } from 'axios';

// --- TOTP helpers ---
const toHex = (buf: ArrayBuffer) => [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, '0')).join('');

async function hmacHex(key: CryptoKey, msg: string) {
    const sig = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(msg));
    return toHex(sig);
}

let cachedKey: CryptoKey | null = null;
async function getKey() {
    if (cachedKey) return cachedKey;
    const secret = import.meta.env.VITE_CLIENT_TOTP_SECRET as string;
    cachedKey = await crypto.subtle.importKey(
        'raw',
        new TextEncoder().encode(secret || ''),
        { name: 'HMAC', hash: 'SHA-256' },
        false,
        ['sign']
    );
    return cachedKey;
}

async function genClientTotp(method: string, pathAndQuery: string) {
    const key = await getKey();
    const now = Math.floor(Date.now() / 1000);
    const window5s = Math.floor(now / 5);
    const ts = now.toString();
    const payload = `C5S|${window5s}|${method.toUpperCase()}|${pathAndQuery}`;
    const token = await hmacHex(key, payload);
    return { token, ts };
}

// --- Axios instance with interceptor ---
const axiosTotp = axios.create();

axiosTotp.interceptors.request.use(async (config: InternalAxiosRequestConfig) => {
    try {
        const method = (config.method ?? 'get').toUpperCase();
        const base = config.baseURL ?? (typeof window !== 'undefined' ? window.location.origin : 'http://localhost');
        const rel = config.url ?? '/';
        const abs = new URL(rel, base);
        const pathAndQuery = abs.pathname + (abs.search || '');
        const { token, ts } = await genClientTotp(method, pathAndQuery);
        // ensure headers is an AxiosHeaders instance
        const headers = new AxiosHeaders(config.headers);
        headers.set('X-Client-TOTP', token);
        headers.set('X-Client-Timestamp', ts);
        config.headers = headers;
    } catch (err) {
        console.warn('axiosTotp interceptor failed', err);
        // don’t block the request if anything fails
    }
    return config;
});

export default axiosTotp;
