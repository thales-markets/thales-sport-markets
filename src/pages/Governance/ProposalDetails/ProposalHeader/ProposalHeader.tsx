import TimeRemaining from 'components/TimeRemaining';
import { StatusEnum } from 'enums/governance';
import { Network } from 'enums/network';
import { InfoStats, InfoText, StyledLink } from 'pages/Governance/styled-components';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import { getIsMobile } from 'redux/modules/app';
import { FlexDiv, FlexDivColumnNative } from 'styles/common';
import {
    formatCurrency,
    formatShortDateWithTime,
    getEtherscanAddressLink,
    getEtherscanBlockLink,
    truncateAddress,
} from 'thales-utils';
import { Proposal } from 'types/governance';
import { getProposalUrl } from 'utils/governance';
import {
    Container,
    FlexDivFullWidthSpaceBetween,
    InfoSection,
    TimeLeftContainer,
    TimeLeftLabel,
    TitleLabel,
    WidgetHeader,
    WidgetWrapper,
} from './styled-components';

type ProposalHeaderProps = {
    proposal: Proposal;
};

const ProposalHeader: React.FC<ProposalHeaderProps> = ({ proposal }) => {
    const { t } = useTranslation();
    const isMobile = useSelector(getIsMobile);

    const closed = proposal.state === StatusEnum.Closed;
    const pending = proposal.state === StatusEnum.Pending;

    return (
        <Container>
            {isMobile ? (
                <WidgetWrapper>
                    <WidgetHeader isTwoSided={true}>
                        <FlexDiv>
                            <TitleLabel>{t(`governance.proposal.details`)}</TitleLabel>
                        </FlexDiv>
                        {!closed && !isMobile && (
                            <TimeLeftContainer>
                                <TimeLeftLabel>
                                    {t(`governance.proposal.${pending ? 'starts-in-label' : 'ends-in-label'}`)}:{' '}
                                </TimeLeftLabel>
                                <TimeRemaining end={proposal.end * 1000} />
                            </TimeLeftContainer>
                        )}
                    </WidgetHeader>

                    <InfoSection side="left">
                        {isMobile && !closed && (
                            <InfoText>
                                {t(`governance.proposal.${pending ? 'starts-in-label' : 'ends-in-label'}`)}
                            </InfoText>
                        )}
                        <InfoText>{t(`governance.proposal.author-label`)}</InfoText>
                        <InfoText>{t(`governance.proposal.proposal-label`)}</InfoText>
                        <InfoText>{t(`governance.proposal.voting-system-label`)}</InfoText>
                        <InfoText>{t(`governance.proposal.start-date-label`)}</InfoText>
                        <InfoText>{t(`governance.proposal.end-date-label`)}</InfoText>
                        <InfoText>{t(`governance.proposal.snapshot-label`)}</InfoText>
                    </InfoSection>
                    <InfoSection side="right">
                        {isMobile && !closed && (
                            <InfoStats>
                                <TimeLeftContainer>
                                    <TimeRemaining end={proposal.end * 1000} fontSize={12} fontWeight={700} />
                                </TimeLeftContainer>
                            </InfoStats>
                        )}

                        <InfoStats>
                            <StyledLink
                                href={getEtherscanAddressLink(Network.Mainnet, proposal.author)}
                                target="_blank"
                                rel="noreferrer"
                            >
                                <InfoStats>{truncateAddress(proposal.author)}</InfoStats>
                            </StyledLink>
                        </InfoStats>
                        <InfoStats>
                            <StyledLink
                                href={getProposalUrl(proposal.space.id, proposal.id)}
                                target="_blank"
                                rel="noreferrer"
                            >
                                <InfoStats>{truncateAddress(proposal.id)}</InfoStats>
                            </StyledLink>
                        </InfoStats>
                        <InfoStats>{t(`governance.proposal.type.${proposal.type}`)}</InfoStats>
                        <InfoStats>{formatShortDateWithTime(proposal.start * 1000)}</InfoStats>
                        <InfoStats>{formatShortDateWithTime(proposal.end * 1000)}</InfoStats>
                        <InfoStats>
                            <StyledLink
                                href={getEtherscanBlockLink(Network.Mainnet, proposal.snapshot)}
                                target="_blank"
                                rel="noreferrer"
                            >
                                <InfoStats>{formatCurrency(proposal.snapshot, 0)}</InfoStats>
                            </StyledLink>
                        </InfoStats>
                    </InfoSection>
                </WidgetWrapper>
            ) : (
                <WidgetWrapper>
                    <WidgetHeader isTwoSided={true}>
                        <FlexDiv>
                            <TitleLabel>{t(`governance.proposal.details`)}</TitleLabel>
                        </FlexDiv>
                        {!closed && (
                            <TimeLeftContainer>
                                <TimeLeftLabel>
                                    {t(`governance.proposal.${pending ? 'starts-in-label' : 'ends-in-label'}`)}:{' '}
                                </TimeLeftLabel>
                                <TimeRemaining end={proposal.end * 1000} fontSize={18} fontWeight={700} />
                            </TimeLeftContainer>
                        )}
                    </WidgetHeader>

                    <InfoSection side="left">
                        <FlexDivFullWidthSpaceBetween>
                            <InfoText>{t(`governance.proposal.author-label`)}</InfoText>
                            <InfoStats>
                                <StyledLink
                                    href={getEtherscanAddressLink(Network.Mainnet, proposal.author)}
                                    target="_blank"
                                    rel="noreferrer"
                                >
                                    <InfoStats>{truncateAddress(proposal.author)}</InfoStats>
                                </StyledLink>
                            </InfoStats>
                        </FlexDivFullWidthSpaceBetween>
                        <FlexDivFullWidthSpaceBetween>
                            <InfoText>{t(`governance.proposal.proposal-label`)}</InfoText>
                            <InfoStats>
                                <StyledLink
                                    href={getProposalUrl(proposal.space.id, proposal.id)}
                                    target="_blank"
                                    rel="noreferrer"
                                >
                                    <InfoStats>{truncateAddress(proposal.id)}</InfoStats>
                                </StyledLink>
                            </InfoStats>
                        </FlexDivFullWidthSpaceBetween>
                        <FlexDivFullWidthSpaceBetween>
                            <InfoText>{t(`governance.proposal.voting-system-label`)}</InfoText>
                            <InfoStats>{t(`governance.proposal.type.${proposal.type}`)}</InfoStats>
                        </FlexDivFullWidthSpaceBetween>
                    </InfoSection>
                    <InfoSection side="right" direction="row" justifyContent="space-between">
                        <FlexDivColumnNative>
                            <InfoText>{t(`governance.proposal.start-date-label`)}</InfoText>
                            <InfoText>{t(`governance.proposal.end-date-label`)}</InfoText>
                            <InfoText>{t(`governance.proposal.snapshot-label`)}</InfoText>
                        </FlexDivColumnNative>
                        <FlexDivColumnNative>
                            <InfoStats>{formatShortDateWithTime(proposal.start * 1000)}</InfoStats>
                            <InfoStats>{formatShortDateWithTime(proposal.end * 1000)}</InfoStats>
                            <InfoStats>
                                <StyledLink
                                    href={getEtherscanBlockLink(Network.Mainnet, proposal.snapshot)}
                                    target="_blank"
                                    rel="noreferrer"
                                >
                                    <InfoStats>{formatCurrency(proposal.snapshot, 0)}</InfoStats>
                                </StyledLink>
                            </InfoStats>
                        </FlexDivColumnNative>
                    </InfoSection>
                </WidgetWrapper>
            )}
        </Container>
    );
};

export default ProposalHeader;
