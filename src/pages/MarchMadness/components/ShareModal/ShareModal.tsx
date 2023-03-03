import twitterIcon from 'assets/images/march-madness/twitter-icon.svg';
import background from 'assets/images/march-madness/flexcard-background.png';
import styled from 'styled-components';
import React, { CSSProperties, useState } from 'react';
import ReactModal from 'react-modal';
import Button from 'components/Button';
import { useTranslation } from 'react-i18next';
import Match from '../Match';
import { MatchProps } from '../Match/Match';
import { getOnImageError, getTeamImageSource } from 'utils/images';
import { NCAA_BASKETBALL_LEAGU_TAG, teamsData } from 'constants/marchMadness';

type ShareModalProps = {
    final4Matches: MatchProps[];
    handleClose: () => void;
};

const ShareModal: React.FC<ShareModalProps> = ({ final4Matches, handleClose }) => {
    const { t } = useTranslation();

    const semiFinalFirst = final4Matches[0];
    const semiFinalSecond = final4Matches[1];
    const finalMatch = final4Matches[2];

    const winnerTeamId = finalMatch.matchData.isHomeTeamSelected
        ? finalMatch.matchData.homeTeamId
        : finalMatch.matchData.awayTeamId;
    const winnerTeamName = teamsData.find((team) => team?.id === winnerTeamId)?.name;
    const winnerTeamDisplayName = teamsData.find((team) => team?.id === winnerTeamId)?.displayName;

    const [winnerLogoSrc, setWinnerLogoSrc] = useState(
        getTeamImageSource(winnerTeamName || '', NCAA_BASKETBALL_LEAGU_TAG)
    );

    const onTwitterShareClickHandler = () => {
        //TODO: implement
    };

    return (
        <ReactModal isOpen shouldCloseOnOverlayClick={true} onRequestClose={handleClose} style={customStyle}>
            <Container>
                <CloseIcon className={`icon icon--close`} onClick={handleClose} />
                <ContentWrapper>
                    <Text margin="13px 0 17px 0">{t('march-madness.brackets.modal-share.header')}</Text>
                    <MatchRow>
                        <Match
                            matchData={semiFinalFirst.matchData}
                            winnerTeamId={semiFinalFirst.winnerTeamId}
                            isBracketsLocked={semiFinalFirst.isBracketsLocked}
                            isTeamLostInPreviousRounds={semiFinalFirst.isTeamLostInPreviousRounds}
                            updateBrackets={() => {}}
                            height={semiFinalFirst.height}
                            isReadOnly={true}
                            margin="0 8px 0 0"
                        />
                        <Match
                            matchData={semiFinalSecond.matchData}
                            winnerTeamId={semiFinalSecond.winnerTeamId}
                            isBracketsLocked={semiFinalSecond.isBracketsLocked}
                            isTeamLostInPreviousRounds={semiFinalSecond.isTeamLostInPreviousRounds}
                            updateBrackets={() => {}}
                            height={semiFinalSecond.height}
                            isReadOnly={true}
                            margin="0 0 0 8px"
                        />
                    </MatchRow>
                    <MatchRow>
                        <Match
                            matchData={finalMatch.matchData}
                            winnerTeamId={finalMatch.winnerTeamId}
                            isBracketsLocked={finalMatch.isBracketsLocked}
                            isTeamLostInPreviousRounds={finalMatch.isTeamLostInPreviousRounds}
                            updateBrackets={() => {}}
                            height={finalMatch.height}
                            isReadOnly={true}
                            margin="7px 0 0 0"
                        />
                    </MatchRow>
                    <Logo>
                        <TeamLogo
                            alt="Winner team logo"
                            src={winnerLogoSrc}
                            onError={getOnImageError(setWinnerLogoSrc, NCAA_BASKETBALL_LEAGU_TAG, true)}
                        />
                    </Logo>
                    <Text margin="16px 0 0 0">
                        {t('march-madness.brackets.modal-share.user-selection', { team: winnerTeamDisplayName })}
                    </Text>
                </ContentWrapper>
                <Button style={buttonStyle} onClick={onTwitterShareClickHandler}>
                    {t('march-madness.brackets.modal-share.share')}
                    <TwitterIcon alt="Twitter icon" src={twitterIcon} />
                </Button>
            </Container>
        </ReactModal>
    );
};

const customStyle = {
    content: {
        top: '50%',
        left: '50%',
        right: 'auto',
        bottom: 'auto',
        marginRight: '-50%',
        transform: 'translate(-50%, -50%)',
        padding: '0px',
        background: 'transparent',
        border: 'none',
        borderRadius: '20px',
        boxShadow: '0px 0px 59px 11px rgba(100, 217, 254, 0.89)',
        overflow: 'visibile',
    },
    overlay: {
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        backdropFilter: 'blur(10px)',
        zIndex: '1501',
    },
};

const buttonStyle: CSSProperties = {
    position: 'absolute',
    bottom: '-50px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontFamily: "'NCAA' !important",
    fontSize: '22px',
    color: '#021631',
    textTransform: 'uppercase',
    background: '#FFFFFF',
    border: '1px solid #000000',
    borderRadius: '0',
    width: '186px',
    height: '38px',
    marginTop: '11px',
};

const Container = styled.div`
    display: flex;
    justify-content: center;
    width: 383px;
    height: 510px;
    background: url('${background}');
    border-radius: 10px;
`;

const CloseIcon = styled.i`
    position: absolute;
    top: -20px;
    right: -20px;
    font-size: 20px;
    cursor: pointer;
    color: #ffffff;
`;

const ContentWrapper = styled.div`
    display: flex;
    flex-direction: column;
    width: 323px;
    height: 325px;
    margin-top: 99px;
    background: #ffffff1a;
    border-radius: 6px;
`;

const Text = styled.span<{ margin?: string }>`
    font-family: 'NCAA' !important;
    font-style: normal;
    font-weight: 400;
    font-size: 18px;
    line-height: 21px;
    text-align: center;
    text-transform: uppercase;
    color: #ffffff;
    opacity: 1;
    ${(props) => (props.margin ? `margin: ${props.margin};` : '')}
`;

const MatchRow = styled.div`
    display: flex;
    flex-direction: row;
    justify-content: center;
`;

const Logo = styled.div`
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-top: 11px;
`;

const TeamLogo = styled.img`
    width: 80px;
`;

const TwitterIcon = styled.img`
    margin-left: 5px;
`;

export default React.memo(ShareModal);
