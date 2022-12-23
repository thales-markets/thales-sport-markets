import { TypeOptions, UpdateOptions } from 'react-toastify';

export const defaultToastOptions = {
    isLoading: false,
    autoClose: 4000,
    hideProgressBar: false,
    pauseOnHover: true,
    draggable: true,
    closeOnClick: true,
    pauseOnFocusLoss: true,
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

export const oddToastOptions = {
    ...defaultToastOptions,
    autoClose: 3000,
    closeButton: false,
    bodyClassName: 'odd-toast-body',
    className: 'odd-toast',
};
