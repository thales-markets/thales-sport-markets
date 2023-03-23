import React, { useEffect, useMemo, useState } from 'react';

import PositionSymbol from 'components/PositionSymbol';
import { getErrorToastOptions, getSuccessToastOptions } from 'config/toast';
import { USD_SIGN } from 'constants/currency';
import { ENETPULSE_SPORTS, SPORTS_TAGS_MAP, SPORT_PERIODS_MAP } from 'constants/tags';
import { GAME_STATUS, STATUS_COLOR } from 'constants/ui';
import { ethers } from 'ethers';
import i18n from 'i18n';
import { ShareTicketModalProps } from 'pages/Markets/Home/Parlay/components/ShareTicketModal/ShareTicketModal';
import { AccountPositionProfile } from 'queries/markets/useAccountMarketsQuery';
import useEnetpulseAdditionalDataQuery from 'queries/markets/useEnetpulseAdditionalDataQuery';
import useMarketTransactionsQuery from 'queries/markets/useMarketTransactionsQuery';
import useSportMarketLiveResultQuery from 'queries/markets/useSportMarketLiveResultQuery';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import { getIsAppReady, getIsMobile } from 'redux/modules/app';
import { getIsWalletConnected, getNetworkId, getWalletAddress } from 'redux/modules/wallet';
import { RootState } from 'redux/rootReducer';
import { FlexDivCentered, FlexDivRow } from 'styles/common';
import { ParlaysMarket, SportMarketLiveResult } from 'types/markets';
import sportsMarketContract from 'utils/contracts/sportsMarketContract';
import { formatDateWithTime } from 'utils/formatters/date';
import { formatCurrencyWithSign } from 'utils/formatters/number';
import { getOnImageError, getTeamImageSource } from 'utils/images';
import {
    convertPositionNameToPosition,
    convertPositionNameToPositionType,
    getCanceledGameClaimAmount,
    getOddTooltipText,
    getParentMarketAddress,
    getSpreadTotalText,
    getSymbolText,
} from 'utils/markets';
import { getMaxGasLimitForNetwork } from 'utils/network';
import networkConnector from 'utils/networkConnector';
import { refetchAfterClaim } from 'utils/queryConnector';
import { buildMarketLink } from 'utils/routes';
import { getOrdinalNumberLabel } from 'utils/ui';
import {
    ClaimButton,
    ClaimContainer,
    ClaimLabel,
    ClaimValue,
    ClubLogo,
    ClubName,
    ExternalLink,
    ExternalLinkArrow,
    ExternalLinkContainer,
    Label,
    MatchInfo,
    MatchLabel,
    MatchLogo,
    StatusContainer,
} from '../../styled-components';
import {
    BoldValue,
    ColumnDirectionInfo,
    MatchPeriodContainer,
    MatchPeriodLabel,
    PositionContainer,
    ResultContainer,
    ScoreContainer,
    Status,
    TeamScoreLabel,
    Wrapper,
} from './styled-components';

type SinglePositionProps = {
    position: AccountPositionProfile;
    setShareTicketModalData?: (shareTicketData: ShareTicketModalProps) => void;
    setShowShareTicketModal?: (show: boolean) => void;
};

const SinglePosition: React.FC<SinglePositionProps> = ({
    position,
    setShareTicketModalData,
    setShowShareTicketModal,
}) => {
    const language = i18n.language;
    const { t } = useTranslation();
    const isAppReady = useSelector((state: RootState) => getIsAppReady(state));
    const networkId = useSelector((state: RootState) => getNetworkId(state));
    const isMobile = useSelector((state: RootState) => getIsMobile(state));
    const walletAddress = useSelector((state: RootState) => getWalletAddress(state)) || '';
    const isWalletConnect = useSelector((state: RootState) => getIsWalletConnected(state));

    const [homeLogoSrc, setHomeLogoSrc] = useState(
        getTeamImageSource(position.market.homeTeam, position.market.tags[0])
    );
    const [awayLogoSrc, setAwayLogoSrc] = useState(
        getTeamImageSource(position.market.awayTeam, position.market.tags[0])
    );

    const marketTransactionsQuery = useMarketTransactionsQuery(position.market.address, networkId, position.account, {
        enabled: isWalletConnect,
    });

    const sumOfTransactionPaidAmount = useMemo(() => {
        let sum = 0;

        if (marketTransactionsQuery.data) {
            marketTransactionsQuery.data.forEach((transaction) => {
                if (transaction.position == position.market.finalResult - 1) {
                    if (transaction.type == 'sell') sum -= transaction.paid;
                    if (transaction.type == 'buy') sum += transaction.paid;
                }
            });
        }

        return sum;
    }, [marketTransactionsQuery.data, position.market.finalResult]);

    useEffect(() => {
        setHomeLogoSrc(getTeamImageSource(position.market.homeTeam, position.market.tags[0]));
        setAwayLogoSrc(getTeamImageSource(position.market.awayTeam, position.market.tags[0]));
    }, [position.market.homeTeam, position.market.awayTeam, position.market.tags]);

    const isClaimable = position.claimable;
    const isCanceled = position.market.isCanceled;
    const positionEnum = convertPositionNameToPositionType(position ? position.side : '');

    const isGameStarted = position.market.maturityDate < new Date();
    const isGameResolved = position.market.isResolved || position.market.isCanceled;
    const isPendingResolution = isGameStarted && !isGameResolved;
    const isEnetpulseSport = ENETPULSE_SPORTS.includes(Number(position.market.tags[0]));
    // const gameIdString = Web3.utils.hexToAscii(position.market.id);

    const gameDate = new Date(position.market.maturityDate).toISOString().split('T')[0];
    const [liveResultInfo, setLiveResultInfo] = useState<SportMarketLiveResult | undefined>(undefined);

    const useLiveResultQuery = useSportMarketLiveResultQuery(position.market.id, {
        enabled: isAppReady && isPendingResolution && !isEnetpulseSport && !isMobile,
    });

    const useEnetpulseLiveResultQuery = useEnetpulseAdditionalDataQuery(
        position.market.id,
        gameDate,
        position.market.tags[0],
        {
            enabled: isAppReady && isEnetpulseSport && !isMobile,
        }
    );

    useEffect(() => {
        if (isEnetpulseSport) {
            if (useEnetpulseLiveResultQuery.isSuccess && useEnetpulseLiveResultQuery.data) {
                setLiveResultInfo(useEnetpulseLiveResultQuery.data);
            }
        } else {
            if (useLiveResultQuery.isSuccess && useLiveResultQuery.data) {
                setLiveResultInfo(useLiveResultQuery.data);
            }
        }
    }, [
        useLiveResultQuery,
        useLiveResultQuery.data,
        useEnetpulseLiveResultQuery,
        useEnetpulseLiveResultQuery.data,
        isEnetpulseSport,
    ]);

    const displayClockTime = liveResultInfo?.displayClock.replaceAll("'", '');

    const claimCanceledGame = isClaimable && isCanceled;

    const claimAmountForCanceledGame = claimCanceledGame ? getCanceledGameClaimAmount(position) : 0;

    const claimAmount = claimCanceledGame ? claimAmountForCanceledGame : position.amount;

    const claimReward = async () => {
        const { signer } = networkConnector;
        if (signer) {
            const contract = new ethers.Contract(position.market.address, sportsMarketContract.abi, signer);
            contract.connect(signer);
            const id = toast.loading(t('market.toast-message.transaction-pending'));
            try {
                const tx = await contract.exerciseOptions({
                    gasLimit: getMaxGasLimitForNetwork(networkId),
                });
                const txResult = await tx.wait();

                if (txResult && txResult.transactionHash) {
                    toast.update(id, getSuccessToastOptions(t('market.toast-message.claim-winnings-success')));
                    if (setShareTicketModalData && setShowShareTicketModal && !isCanceled) {
                        setShareTicketModalData(shareTicketData);
                        setShowShareTicketModal(true);
                    }
                }
            } catch (e) {
                toast.update(id, getErrorToastOptions(t('common.errors.unknown-error-try-again')));
                console.log(e);
            }
        }
    };

    const shareTicketData: ShareTicketModalProps = {
        markets: [
            {
                ...position.market,
                homeOdds: sumOfTransactionPaidAmount / position.amount,
                awayOdds: sumOfTransactionPaidAmount / position.amount,
                drawOdds: sumOfTransactionPaidAmount / position.amount,
                winning: position.claimable,
                position: convertPositionNameToPosition(position?.side ? position?.side : ''),
            } as ParlaysMarket,
        ],
        multiSingle: false,
        totalQuote: sumOfTransactionPaidAmount / position.amount,
        paid: sumOfTransactionPaidAmount,
        payout: position.amount,
        onClose: () => {
            refetchAfterClaim(walletAddress, networkId);
            setShowShareTicketModal ? setShowShareTicketModal(false) : null;
        },
    };

    const symbolText = getSymbolText(positionEnum, position.market);
    const spreadTotalText = getSpreadTotalText(position.market, positionEnum);

    return (
        <Wrapper>
            <MatchInfo>
                <MatchLogo>
                    <ClubLogo
                        alt={position.market.homeTeam}
                        src={homeLogoSrc}
                        isFlag={position.market.tags[0] == 9018}
                        losingTeam={false}
                        onError={getOnImageError(setHomeLogoSrc, position.market.tags[0])}
                        customMobileSize={'30px'}
                    />
                    <ClubLogo
                        awayTeam={true}
                        alt={position.market.awayTeam}
                        src={awayLogoSrc}
                        isFlag={position.market.tags[0] == 9018}
                        losingTeam={false}
                        onError={getOnImageError(setAwayLogoSrc, position.market.tags[0])}
                        customMobileSize={'30px'}
                    />
                </MatchLogo>
                <MatchLabel>
                    <ClubName>{position.market.homeTeam}</ClubName>
                    <ClubName>{position.market.awayTeam}</ClubName>
                </MatchLabel>
            </MatchInfo>
            <StatusContainer>
                {isPendingResolution && !isMobile ? (
                    isEnetpulseSport ? (
                        <Status color={STATUS_COLOR.STARTED}>{t('markets.market-card.pending')}</Status>
                    ) : (
                        <FlexDivRow>
                            {liveResultInfo?.status != GAME_STATUS.FINAL &&
                                liveResultInfo?.status != GAME_STATUS.FULL_TIME &&
                                !isEnetpulseSport && (
                                    <MatchPeriodContainer>
                                        <MatchPeriodLabel>{`${getOrdinalNumberLabel(
                                            Number(liveResultInfo?.period)
                                        )} ${t(
                                            `markets.market-card.${SPORT_PERIODS_MAP[Number(liveResultInfo?.sportId)]}`
                                        )}`}</MatchPeriodLabel>
                                        <FlexDivCentered>
                                            <MatchPeriodLabel className="red">
                                                {displayClockTime}
                                                <MatchPeriodLabel className="blink">&prime;</MatchPeriodLabel>
                                            </MatchPeriodLabel>
                                        </FlexDivCentered>
                                    </MatchPeriodContainer>
                                )}

                            <ScoreContainer>
                                <TeamScoreLabel>{liveResultInfo?.homeScore}</TeamScoreLabel>
                                <TeamScoreLabel>{liveResultInfo?.awayScore}</TeamScoreLabel>
                            </ScoreContainer>
                            {SPORTS_TAGS_MAP['Soccer'].includes(Number(liveResultInfo?.sportId))
                                ? liveResultInfo?.period == 2 && (
                                      <ScoreContainer>
                                          <TeamScoreLabel className="period">
                                              {liveResultInfo?.scoreHomeByPeriod[0]}
                                          </TeamScoreLabel>
                                          <TeamScoreLabel className="period">
                                              {liveResultInfo?.scoreAwayByPeriod[0]}
                                          </TeamScoreLabel>
                                      </ScoreContainer>
                                  )
                                : liveResultInfo?.scoreHomeByPeriod.map((homePeriodResult, index) => {
                                      return (
                                          <ScoreContainer key={index}>
                                              <TeamScoreLabel className="period">{homePeriodResult}</TeamScoreLabel>
                                              <TeamScoreLabel className="period">
                                                  {liveResultInfo.scoreAwayByPeriod[index]}
                                              </TeamScoreLabel>
                                          </ScoreContainer>
                                      );
                                  })}
                        </FlexDivRow>
                    )
                ) : (
                    <></>
                )}
                <PositionContainer>
                    <PositionSymbol
                        symbolText={symbolText}
                        symbolUpperText={
                            spreadTotalText
                                ? {
                                      text: spreadTotalText,
                                      textStyle: {
                                          top: '-9px',
                                      },
                                  }
                                : undefined
                        }
                        tooltip={<>{getOddTooltipText(positionEnum, position.market)}</>}
                    />
                </PositionContainer>
                {isClaimable && (
                    <>
                        {isCanceled ? (
                            <ResultContainer>
                                <Label canceled={true}>{t('profile.card.canceled')}</Label>
                            </ResultContainer>
                        ) : (
                            <ColumnDirectionInfo>
                                <Label>{t('profile.card.result')}:</Label>
                                <BoldValue>{`${position.market.homeScore} : ${position.market.awayScore}`}</BoldValue>
                            </ColumnDirectionInfo>
                        )}
                        {isMobile ? (
                            <ClaimContainer>
                                <ClaimValue>{formatCurrencyWithSign(USD_SIGN, claimAmount, 2)}</ClaimValue>
                                <ClaimButton
                                    claimable={true}
                                    onClick={(e: any) => {
                                        e.preventDefault();
                                        e.stopPropagation();
                                        claimReward();
                                    }}
                                >
                                    {t('profile.card.claim')}
                                </ClaimButton>
                            </ClaimContainer>
                        ) : (
                            <>
                                <ColumnDirectionInfo>
                                    <ClaimLabel>{t('profile.card.to-claim')}:</ClaimLabel>
                                    <ClaimValue>{formatCurrencyWithSign(USD_SIGN, claimAmount, 2)}</ClaimValue>
                                </ColumnDirectionInfo>
                                <ClaimButton
                                    claimable={true}
                                    onClick={(e: any) => {
                                        e.preventDefault();
                                        e.stopPropagation();
                                        claimReward();
                                    }}
                                >
                                    {t('profile.card.claim')}
                                </ClaimButton>
                            </>
                        )}
                    </>
                )}
                {!isClaimable && (
                    <>
                        <ColumnDirectionInfo>
                            <Label>{t('profile.card.position-size')}:</Label>
                            <BoldValue>{formatCurrencyWithSign(USD_SIGN, position.amount)}</BoldValue>
                        </ColumnDirectionInfo>
                        <ColumnDirectionInfo>
                            <Label>{t('profile.card.starts')}:</Label>
                            <BoldValue>{formatDateWithTime(position.market.maturityDate)}</BoldValue>
                        </ColumnDirectionInfo>
                        <ExternalLink
                            href={buildMarketLink(
                                getParentMarketAddress(position.market.parentMarket, position.market.address),
                                language
                            )}
                            target={'_blank'}
                        >
                            <ExternalLinkContainer>
                                <ExternalLinkArrow />
                            </ExternalLinkContainer>
                        </ExternalLink>
                    </>
                )}
            </StatusContainer>
        </Wrapper>
    );
};

export default SinglePosition;
