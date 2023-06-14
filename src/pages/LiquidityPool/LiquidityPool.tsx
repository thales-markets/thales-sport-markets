import React, { useEffect, useState } from 'react';
import LiquidityPoolSingle from './LiquidityPoolSingle/LiquidityPoolSingle';
import Toggle from 'components/Toggle/Toggle';
import LiquidityPoolParlay from './LiquidityPoolParlay/LiquidityPoolParlay';
import { history } from 'utils/routes';

const LiquidityPool: React.FC = () => {
    const [isParlayLP, setIsParlayLP] = useState<boolean>(false);

    const searchQuery = new URLSearchParams(location.search);

    useEffect(() => {
        if (searchQuery.get('pool-type') == 'parlay') {
            setIsParlayLP(true);
        } else if (searchQuery.get('pool-type') == 'single') {
            setIsParlayLP(false);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return (
        <>
            <Toggle
                label={{
                    firstLabel: 'Single LP',
                    secondLabel: 'Parlay LP',
                }}
                active={isParlayLP}
                dotSize="18px"
                dotBackground="#303656"
                dotBorder="3px solid #3FD1FF"
                handleClick={() => {
                    searchQuery.set('pool-type', !isParlayLP ? 'parlay' : 'single');
                    history.push({ search: searchQuery.toString() });
                    setIsParlayLP(!isParlayLP);
                }}
            />
            {!isParlayLP && <LiquidityPoolSingle />}
            {isParlayLP && <LiquidityPoolParlay />}
        </>
    );
};

export default LiquidityPool;
