import ShareModal from 'components/ShareModal';
import { intervalToDuration } from 'date-fns';
import React, { useState } from 'react';
import styled from 'styled-components';
import { UserPosition } from 'types/speedMarkets';
import { getCollateralByAddress } from 'utils/collaterals';
import { formattedDurationFullV2 } from 'utils/formatters/date';
import { isUserWinner } from 'utils/speedMarkets';
import { useChainId } from 'wagmi';

const ShareSpeedPosition: React.FC<{
    position: UserPosition;
}> = ({ position }) => {
    const networkId = useChainId();

    const [openTwitterShareModal, setOpenTwitterShareModal] = useState(false);

    const status = isUserWinner(position.side, position.strikePrice, position.finalPrice);

    return (
        <>
            <TwitterIcon onClick={() => setOpenTwitterShareModal(true)} className="icon-homepage icon--x" />
            {openTwitterShareModal && (
                <ShareModal
                    data={{
                        type: status === undefined ? 'speed-potential' : status ? 'speed-won' : 'speed-loss',
                        position: position.side,
                        asset: position.asset,
                        strikePrice: position.strikePrice,
                        paid: position.paid,
                        payout: position.payout,
                        collateral: getCollateralByAddress(position.collateralAddress, networkId),
                        marketDuration: formattedDurationFullV2(
                            intervalToDuration({ start: position.createdAt, end: position.maturityDate })
                        ),
                    }}
                    onClose={() => setOpenTwitterShareModal(false)}
                />
            )}
        </>
    );
};

const TwitterIcon = styled.i`
    font-size: 14px;
    color: ${(props) => props.theme.textColor.septenary};
    cursor: pointer;
`;

export default ShareSpeedPosition;
