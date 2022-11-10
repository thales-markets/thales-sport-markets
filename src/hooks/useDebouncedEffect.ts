import { useState, useEffect, useCallback, DependencyList, EffectCallback } from 'react';
import debounce from 'lodash/debounce';
import { DEFAULT_SEARCH_DEBOUNCE_MS } from 'constants/defaults';

// source: https://simbathesailor.dev/debounced-useEffect-itself/

export function useDebouncedEffect(
    callback: EffectCallback,
    dependency: DependencyList | undefined,
    timeout = DEFAULT_SEARCH_DEBOUNCE_MS,
    options = { trailing: true, leading: false }
) {
    const { leading, trailing } = options;
    const [_dependency, _setdependency] = useState(dependency);

    // eslint-disable-next-line react-hooks/exhaustive-deps
    const makeChangeTodependency = useCallback(
        debounce(
            (dependency) => {
                _setdependency(dependency);
            },
            timeout,
            { trailing, leading }
        ),
        [trailing, leading, timeout]
    );

    useEffect(() => {
        if (dependency) {
            makeChangeTodependency(dependency);
        }

        return () => {
            makeChangeTodependency.cancel();
        };
    }, [dependency, makeChangeTodependency]);

    // eslint-disable-next-line react-hooks/exhaustive-deps
    useEffect(callback, _dependency);
}

export default useDebouncedEffect;
