import { TypeOptions, UpdateOptions } from 'react-toastify';

const TOAST_FONT_SIZE = '14px';

export const defaultToastOptions = {
    isLoading: false,
    autoClose: 4000,
    hideProgressBar: false,
    pauseOnHover: true,
    draggable: true,
    closeOnClick: true,
    pauseOnFocusLoss: true,
    style: {
        fontSize: TOAST_FONT_SIZE,
    },
};

export const getSuccessToastOptions = (message: string | React.ReactNode, options?: UpdateOptions) => {
    return {
        ...{ ...defaultToastOptions, ...options },
        render: message,
        type: 'success' as TypeOptions,
    };
};

export const getErrorToastOptions = (message: string | React.ReactNode, options?: UpdateOptions) => {
    return {
        ...{ ...defaultToastOptions, ...options },
        render: message,
        type: 'error' as TypeOptions,
    };
};

export const getInfoToastOptions = (message: string | React.ReactNode, options?: UpdateOptions) => {
    return {
        ...{ ...defaultToastOptions, ...options },
        render: message,
        type: 'info' as TypeOptions,
    };
};

export const getLoadingToastOptions = (message: string | React.ReactNode, options?: UpdateOptions) => {
    return {
        ...options,
        isLoading: true,
        render: message,
        type: 'default' as TypeOptions,
        style: {
            fontSize: TOAST_FONT_SIZE,
        },
    };
};

export const oddToastOptions = {
    ...defaultToastOptions,
    autoClose: 3000,
    closeButton: false,
    bodyClassName: 'odd-toast-body',
    className: 'odd-toast',
};
