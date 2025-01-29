import { generalConfig } from 'config/general';
import { ErrorInfo } from 'react';
import { isMobile } from 'utils/device';

export const logErrorToDiscord = (error: Error, info: ErrorInfo) => {
    const content = `IsMobile: ${isMobile()}\nError:\n${error.message + '\n' + error.stack || ''}\nErrorInfo:\n${
        info.componentStack
    }`;

    fetch(`${generalConfig.API_URL}/discord/log-error`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content }),
    });

    console.error(error, info);
};

const EXCLUDE_ERRORS = ['User rejected the request'];

export const isErrorExcluded = (error: Error) =>
    EXCLUDE_ERRORS.some((excluded) => (error.stack || error.message).includes(excluded));
