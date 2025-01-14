import { generalConfig } from 'config/general';
import { ErrorInfo } from 'react';
import { isMobile } from 'utils/device';

export const logErrorToDiscord = (error: Error, info: ErrorInfo) => {
    const content = `IsMobile: ${isMobile()}\nError:\n${error.stack || error.message}\nErrorInfo:${
        info.componentStack
    }`;

    fetch(`${generalConfig.API_URL}/discord/log-error`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content }),
    });

    console.error(error, info);
};
