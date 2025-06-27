import { VOTING_COUNCIL_PROPOSAL_ID } from 'constants/governance';
import { SpaceKey, StatusEnum } from 'enums/governance';
import useVotingPowerQuery from 'queries/governance/useVotingPowerQuery';
import React from 'react';
import { Trans, useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import { getIsMobile } from 'redux/modules/app';
import { FlexDivRow } from 'styles/common';
import { formatCurrencyWithKey } from 'thales-utils';
import { Proposal } from 'types/governance';
import { getOvertimeDapProposalUrl } from 'utils/governance';
import { useAccount } from 'wagmi';
import ProposalHeader from './ProposalHeader';
import WeightedVoting from './Voting/WeightedVoting';
import { Container, Description, DetailsTitle, Divider, VoteHeader, VotingPowerTitle } from './styled-components';

type ProposalDetailsProps = {
    proposal: Proposal;
};

const ProposalDetails: React.FC<ProposalDetailsProps> = ({ proposal }) => {
    const { t } = useTranslation();
    const isMobile = useSelector(getIsMobile);

    const { address, isConnected } = useAccount();
    const walletAddress = address || '';

    const votingPowerQuery = useVotingPowerQuery(proposal, walletAddress, {
        enabled: isConnected,
    });
    const votingPower: number = votingPowerQuery.isSuccess && votingPowerQuery.data ? votingPowerQuery.data : 0;

    return (
        <>
            <ProposalHeader proposal={proposal} />
            <Container topMargin={isMobile ? 30 : 10}>
                <DetailsTitle>{proposal.title}</DetailsTitle>
                <Description>
                    <Trans
                        i18nKey="governance.proposal.description"
                        components={{
                            a: (
                                <a
                                    href={getOvertimeDapProposalUrl(SpaceKey.COUNCIL, VOTING_COUNCIL_PROPOSAL_ID)}
                                    target="_blank"
                                    rel="noreferrer"
                                />
                            ),
                        }}
                    />
                </Description>
                {proposal.state === StatusEnum.Active && (
                    <>
                        <VoteHeader>
                            <FlexDivRow>
                                <DetailsTitle>{t(`governance.proposal.vote-label`)}</DetailsTitle>
                            </FlexDivRow>
                            <VotingPowerTitle>{`${t(`governance.proposal.voting-power-label`)}: ${
                                isConnected && !votingPowerQuery.isLoading
                                    ? formatCurrencyWithKey(proposal.space.symbol, votingPower)
                                    : '-'
                            }`}</VotingPowerTitle>
                        </VoteHeader>
                        <Divider />
                    </>
                )}
                {proposal.state === StatusEnum.Active && (
                    <WeightedVoting proposal={proposal} hasVotingRights={votingPower > 0} />
                )}
            </Container>
        </>
    );
};

export default ProposalDetails;
