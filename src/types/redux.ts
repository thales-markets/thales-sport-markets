import { OddsType, SortType, SportFilter, StatusFilter, TicketErrorCode } from 'enums/markets';
import { MarketType, MarketTypeGroup } from 'enums/marketTypes';
import { Theme } from 'enums/ui';
import { ParlayPayment, Tags, TicketPosition } from './markets';
import { SelectedMarket } from './marketTypes';
import { OverdropUIState } from './overdrop';

export type AppSliceState = {
    isMobile: boolean;
};

export type MarketSliceState = {
    marketSearch: string;
    datePeriodFilter: number;
    statusFilter: StatusFilter;
    sportFilter: SportFilter;
    marketTypeFilter: MarketType | undefined;
    marketTypeGroupFilter: MarketTypeGroup | undefined;
    tagFilter: Tags;
    selectedMarket: SelectedMarket | undefined;
    isThreeWayView: boolean;
    sortType: SortType;
};

export type TicketSliceState = {
    ticket: TicketPosition[];
    payment: ParlayPayment;
    maxTicketSize: number;
    liveBetSlippage: number;
    isFreeBetDisabledByUser: boolean;
    isSystemBet: boolean;
    isSgp: boolean;
    error: { code: TicketErrorCode; data: string };
};

export type UISliceState = {
    theme: Theme;
    oddsType: OddsType;
    stopPulsing: boolean;
    favouriteLeagues: Tags;
    overdropState: OverdropUIState[];
    overdropWelcomeModal: boolean;
    overdropPreventMultipliersModal: boolean;
    stakingModalMuteEnd: number;
};

export type WalletSliceState = {
    isBiconomy?: boolean;
    isParticleReady: boolean;
    connectedViaParticle: boolean;
    walletConnectModal: {
        visibility: boolean;
        origin?: 'sign-up' | 'sign-in' | undefined;
    };
};

export type RootState = {
    app: AppSliceState;
    market: MarketSliceState;
    ticket: TicketSliceState;
    ui: UISliceState;
    wallet: WalletSliceState;
};
