import { useState } from 'react';
import localStore from 'utils/localStore';

export function useLocalStorage(key: string, initialValue: any) {
    const [storedValue, setStoredValue] = useState(() => {
        const item = localStore.get(key);
        return item != null ? item : initialValue;
    });

    const setValue = (value: any) => {
        const valueToStore = value instanceof Function ? value(storedValue) : value;
        setStoredValue(valueToStore);
        localStore.set(key, valueToStore);
    };

    return [storedValue, setValue] as const;
}

export default useLocalStorage;
