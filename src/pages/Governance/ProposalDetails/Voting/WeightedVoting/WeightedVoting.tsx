import { Web3Provider } from '@ethersproject/providers';
import snapshot from '@snapshot-labs/snapshot.js';
import { ProposalType } from '@snapshot-labs/snapshot.js/dist/src/sign/types';
import { getErrorToastOptions, getSuccessToastOptions } from 'config/toast';
import { ProposalTypeEnum } from 'enums/governance';
import { ScreenSizeBreakpoint } from 'enums/ui';
import { VoteConfirmation, VoteContainer } from 'pages/Governance/styled-components';
import useProposalQuery from 'queries/governance/useProposalQuery';
import React, { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import { getIsBiconomy } from 'redux/modules/wallet';
import styled from 'styled-components';
import {
    FlexDiv,
    FlexDivCentered,
    FlexDivColumnCentered,
    FlexDivRowCentered,
    FlexDivSpaceBetween,
} from 'styles/common';
import { Proposal } from 'types/governance';
import { refetchProposal } from 'utils/queryConnector';
import useBiconomy from 'utils/smartAccount/hooks/useBiconomy';
import voting from 'utils/voting';
import { percentageOfTotal } from 'utils/voting/weighted';
import { useAccount } from 'wagmi';

type WeightedVotingProps = {
    proposal: Proposal;
    hasVotingRights: boolean;
};

const WeightedVoting: React.FC<WeightedVotingProps> = ({ proposal, hasVotingRights }) => {
    const { t } = useTranslation();
    const isBiconomy = useSelector(getIsBiconomy);

    const { address } = useAccount();
    const { smartAddress } = useBiconomy();
    const walletAddress = (isBiconomy ? smartAddress : address) || '';

    const [selectedChoices, setSelectedChoices] = useState<number[]>(new Array(proposal.choices.length + 1).fill(0));
    const [isVoting, setIsVoting] = useState<boolean>(false);
    // const [modalInfo, setModalInfo] = useState({ isOpen: false, author: '', content: '' });

    const proposalResultsQuery = useProposalQuery(proposal.space.id, proposal.id, walletAddress);
    const proposalResults =
        proposalResultsQuery.isSuccess && proposalResultsQuery.data ? proposalResultsQuery.data : undefined;

    const myVote = useMemo(() => proposalResults?.votes.find((vote: any) => vote.voter === walletAddress), [
        proposalResults,
        walletAddress,
    ]);

    useEffect(() => {
        if (myVote) {
            setSelectedChoices([0, ...Object.values(myVote.choice as Record<number, number>)]);
        } else {
            setSelectedChoices(new Array(proposal.choices.length + 1).fill(0));
        }
    }, [myVote, proposal.choices.length]);

    useEffect(() => {
        setSelectedChoices(new Array(proposal.choices.length + 1).fill(0));
    }, [walletAddress, proposal.choices.length]);

    function addVote(i: number, selectedChoices: number[]) {
        selectedChoices[i] = selectedChoices[i] ? (selectedChoices[i] += 1) : 1;
    }

    function removeVote(i: number, selectedChoices: number[]) {
        if (selectedChoices[i]) selectedChoices[i] = selectedChoices[i] < 1 ? 0 : (selectedChoices[i] -= 1);
    }

    function percentage(i: number, selectedChoices: number[]) {
        const newSelectedChoices = selectedChoices.map((choice) => {
            if (choice) {
                return choice;
            }
            return 0;
        });

        return Math.round(percentageOfTotal(i + 1, newSelectedChoices, Object.values(newSelectedChoices)) * 10) / 10;
    }

    const handleVote = async () => {
        const id = toast.loading(t('common.progress'));
        setIsVoting(true);
        try {
            const formattedChoices = { ...selectedChoices };
            delete formattedChoices[0];

            const hub = 'https://hub.snapshot.org';
            const client = new snapshot.Client712(hub);

            // if (smartAccountConnector && smartAccountConnector.biconomyAccount) {
            //     const test = await smartAccountConnector.biconomyAccount.signMessage(
            //         JSON.stringify({
            //             space: proposal.space.id,
            //             proposal: proposal.id,
            //             type: proposal.type as ProposalType,
            //             choice: formattedChoices,
            //             reason: '',
            //             app: 'thales',
            //         })
            //     );
            //     console.log('Biconomy Account Sign Message:', test);
            // }

            // using Web3Provider instead of wagmi provider due to an error _signTypedData is not a function
            await client.vote(new Web3Provider(window.ethereum as any, 'any'), walletAddress, {
                space: proposal.space.id,
                proposal: proposal.id,
                type: proposal.type as ProposalType,
                choice: formattedChoices,
                reason: '',
                app: 'thales',
            });

            refetchProposal(proposal.space.id, proposal.id, walletAddress);
            toast.update(id, getSuccessToastOptions(t('governance.proposal.vote-confirmation-message')));
            setIsVoting(false);
        } catch (e) {
            console.log(e);
            toast.update(id, getErrorToastOptions(t('common.errors.unknown-error-try-again')));
            setIsVoting(false);
        }
    };

    const isOptionSelected = selectedChoices.find((choice) => choice > 0);
    const formattedChoiceString = new voting[ProposalTypeEnum.Weighted](
        proposal,
        [],
        [],
        selectedChoices
    ).getChoiceString();

    return (
        <>
            <VoteContainer>
                {proposal.choices.map((choice: any, i: number) => {
                    const selectedChoiceValue = selectedChoices[i + 1] ?? 0;
                    const selected = selectedChoiceValue > 0;

                    return (
                        <VotingWrapper key={choice}>
                            <Weighted key={choice} className={selected ? 'selected' : ''} isDisabled={!hasVotingRights}>
                                <Option>{choice}</Option>
                                <Selection>
                                    <PlusMinus
                                        isDisabled={!hasVotingRights}
                                        onClick={() => {
                                            if (hasVotingRights) {
                                                const newSelectedChoices = [...selectedChoices];
                                                removeVote(i + 1, newSelectedChoices);
                                                setSelectedChoices(newSelectedChoices);
                                            }
                                        }}
                                    >
                                        -
                                    </PlusMinus>
                                    <Input
                                        type="number"
                                        min="0"
                                        step="1"
                                        value={selectedChoiceValue}
                                        disabled={!hasVotingRights}
                                        onChange={(e) => {
                                            const { value } = e.target;
                                            const parsedInt = parseInt(value);
                                            const newSelectedChoices = [...selectedChoices];
                                            if (isNaN(parsedInt)) {
                                                newSelectedChoices[i + 1] = 0;
                                            } else {
                                                newSelectedChoices[i + 1] = parsedInt;
                                            }
                                            setSelectedChoices(newSelectedChoices);
                                        }}
                                        onFocus={(e) => e.target.select()}
                                    />
                                    <PlusMinus
                                        isDisabled={!hasVotingRights}
                                        onClick={() => {
                                            if (hasVotingRights) {
                                                const newSelectedChoices = [...selectedChoices];
                                                addVote(i + 1, newSelectedChoices);
                                                setSelectedChoices(newSelectedChoices);
                                            }
                                        }}
                                    >
                                        +
                                    </PlusMinus>
                                    <Percentage>{percentage(i, selectedChoices)}%</Percentage>
                                </Selection>
                            </Weighted>
                        </VotingWrapper>
                    );
                })}
                {isOptionSelected && hasVotingRights && (
                    <VoteConfirmation>
                        {t(`governance.proposal.vote-confirmation`) + ' ' + formattedChoiceString + '?'}
                    </VoteConfirmation>
                )}
            </VoteContainer>
            <FlexDivCentered>
                <Button
                    disabled={!isOptionSelected || isVoting || !hasVotingRights}
                    onClick={handleVote}
                    margin="20px 0"
                >
                    {!isVoting
                        ? t(`governance.proposal.submit-vote-label`)
                        : t(`governance.proposal.vote-progress-label`)}
                </Button>
            </FlexDivCentered>
        </>
    );
};

const Weighted = styled(FlexDivSpaceBetween)<{ isDisabled?: boolean }>`
    flex: 1;
    box-sizing: content-box;
    height: 30px;
    border: 1px solid ${(props) => props.theme.borderColor.primary};
    border-radius: 5px;
    margin-bottom: 20px;
    font-weight: 700;
    font-size: 18px;
    line-height: 30px;
    color: ${(props) => props.theme.textColor.primary};
    -webkit-user-select: none;
    -moz-user-select: none;
    -ms-user-select: none;
    user-select: none;
    opacity: ${(props) => (props.isDisabled ? '0.5' : '1')};
    &.selected {
        margin: -1px;
        margin-bottom: 19px;
        border: 2px solid ${(props) => props.theme.borderColor.quaternary};
    }
    &:hover {
        ${(props) => (props.isDisabled ? '' : 'margin: -1px;')}
        ${(props) => (props.isDisabled ? '' : 'margin-bottom: 19px;')}
        ${(props) => (props.isDisabled ? '' : `border: 2px solid ${props.theme.borderColor.quaternary};`)}
    }
    @media (max-width: ${ScreenSizeBreakpoint.SMALL}px) {
        height: 46px;
        font-size: 16px;
        line-height: 46px;
    }
`;

const Option = styled(FlexDivRowCentered)`
    padding-left: 20px;
    padding-right: 5px;
    white-space: break-spaces;
    line-height: 22px;
    @media (max-width: ${ScreenSizeBreakpoint.SMALL}px) {
        padding-left: 10px;
    }
`;

const Selection = styled(FlexDiv)`
    width: 230px;
    @media (max-width: ${ScreenSizeBreakpoint.SMALL}px) {
        width: 165px;
    }
`;

const PlusMinus = styled(FlexDivColumnCentered)<{ isDisabled?: boolean }>`
    text-align: center;
    max-width: 45px;
    min-width: 45px;
    border-left: 2px solid ${(props) => props.theme.borderColor.primary};
    border-right: 2px solid ${(props) => props.theme.borderColor.primary};
    &:hover {
        ${(props) => (props.isDisabled ? '' : `border-left: 2px solid ${props.theme.borderColor.quaternary};`)}
        ${(props) => (props.isDisabled ? '' : `border-right: 2px solid ${props.theme.borderColor.quaternary};`)}
        ${(props) => (props.isDisabled ? '' : 'cursor: pointer;')}
    }
    @media (max-width: ${ScreenSizeBreakpoint.SMALL}px) {
        max-width: 35px;
        min-width: 35px;
    }
`;

const Percentage = styled(FlexDivColumnCentered)`
    text-align: center;
    max-width: 80px;
    min-width: 80px;
    @media (max-width: ${ScreenSizeBreakpoint.SMALL}px) {
        max-width: 55px;
        min-width: 55px;
    }
`;

const Input = styled.input`
    background: transparent;
    border: none;
    display: block;
    padding: 0 10px;
    outline: none !important;
    max-width: 60px;
    min-width: 60px;
    font-weight: 700;
    font-size: 18px;
    color: ${(props) => props.theme.textColor.primary};
    text-align: center;
    overfloe: hidden;
    text-overflow: ellipsis;
    @media (max-width: ${ScreenSizeBreakpoint.SMALL}px) {
        font-size: 16px;
        max-width: 40px;
        min-width: 40px;
    }
`;

const VotingWrapper = styled(FlexDiv)`
    @media (max-width: ${ScreenSizeBreakpoint.SMALL}px) {
        flex-direction: column;
    }
`;

const Button = styled.button<{ margin?: string; padding?: string; disabled?: boolean; width?: string }>`
    cursor: pointer;
    color: ${(props) => props.theme.button.textColor.primary};
    padding: ${(props) => props.padding || '5px 20px'};
    margin: ${(props) => props.margin || '0'};
    border-radius: 5px;
    border: 0;
    background: ${(props) => props.theme.button.background.primary};
    text-align: center;
    font-size: 14px;
    font-weight: 600;
    text-transform: uppercase;
    width: ${(props) => props.width || 'auto'};
    &:disabled {
        opacity: 0.5;
        cursor: default;
    }
`;

export default WeightedVoting;
