import React, { useState } from 'react';
import LiquidityPoolSingle from './LiquidityPoolSingle/LiquidityPoolSingle';
import Toggle from 'components/Toggle/Toggle';
import LiquidityPoolParlay from './LiquidityPoolParlay/LiquidityPoolParlay';

const LiquidityPool: React.FC = () => {
    const [isParlayLP, setIsParlayLP] = useState<boolean>(false);
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
                handleClick={() => setIsParlayLP(!isParlayLP)}
            />
            {!isParlayLP && <LiquidityPoolSingle />}
            {isParlayLP && <LiquidityPoolParlay />}
        </>
    );
};

export default LiquidityPool;
