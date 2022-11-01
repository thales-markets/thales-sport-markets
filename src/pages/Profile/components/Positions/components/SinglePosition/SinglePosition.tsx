import React from 'react';

import { AccountPositionProfile } from 'queries/markets/useAccountMarketsQuery';

const SinglePosition: React.FC<{ position: AccountPositionProfile }> = ({ position }) => {
    console.log('Position ', position);
    return <></>;
};

export default SinglePosition;
