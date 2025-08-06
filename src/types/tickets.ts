import { TicketErrorCode } from 'enums/markets';
import { Coins } from 'thales-utils';
import { SystemBetData, TicketMarket } from './markets';
import { ShareSpeedPositionData } from './speedMarkets';

export type ShareTicketData = {
    markets: TicketMarket[];
    multiSingle: boolean;
    paid: number;
    payout: number;
    isTicketLost: boolean;
    collateral: Coins;
    isLive: boolean;
    isSgp: boolean;
    applyPayoutMultiplier: boolean;
    isTicketOpen: boolean;
    systemBetData?: SystemBetData;
};

export type ShareTicketModalProps = {
    data: ShareTicketData | ShareSpeedPositionData;
    onClose: () => void;
};

export type TicketError = {
    code: TicketErrorCode;
    data: string;
};
