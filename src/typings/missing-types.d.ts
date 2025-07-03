declare module 'thales-data';

declare module 'query-string';

declare module '*.pdf';

declare module 'bytes32';

// Fix for module resolution
declare module '@coinbase/onchainkit/minikit' {
    export * from '@coinbase/onchainkit/dist/minikit';
}
