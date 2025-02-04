import { generalConfig } from 'config/general';
import { ErrorInfo } from 'react';
import { isMobile } from 'utils/device';

const EXCLUDE_ERRORS = ['User rejected the request', 'user reject this request'];
const DEPLOY_ERRORS = [
    'Failed to fetch dynamically imported module',
    'error loading dynamically imported module',
    'Importing a module script failed',
    "'text/html' is not a valid JavaScript MIME type",
];

export const isErrorExcluded = (error: Error) =>
    EXCLUDE_ERRORS.some((excluded) => (error.message + (error.stack || '')).includes(excluded));

export const isDeployError = (errorMessage: string) =>
    DEPLOY_ERRORS.some((deployError) => (errorMessage || '').includes(deployError));

export const logErrorToDiscord = (error: Error, info: ErrorInfo, data?: string) => {
    const content = `IsMobile: ${isMobile()}\n${data ? `${data}\n` : ''}Error:\n${
        error.message + '\n' + error.stack || ''
    }\n${info.componentStack ? `ErrorInfo:\n${info.componentStack}` : ''}`;

    fetch(`${generalConfig.API_URL}/discord/log-error`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content }),
    });

    console.error(error, info);
};
