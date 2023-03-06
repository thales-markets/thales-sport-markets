import React, { useCallback, useEffect, useState } from 'react';
import axios from 'axios';
import Modal from 'components/Modal';
import styled from 'styled-components';
import { FlexDivColumnCentered, FlexDivRowCentered, FlexDivCentered } from 'styles/common';
import { useSelector } from 'react-redux';
import { RootState } from 'redux/rootReducer';
import { getWalletAddress } from 'redux/modules/wallet';
import { toast } from 'react-toastify';

type RefferalModalProps = {
    onClose: () => void;
};

export const RefferalModal: React.FC<RefferalModalProps> = ({ onClose }) => {
    const [reffererID, setReffererID] = useState('');
    const [savedReffererID, setSavedReffererID] = useState('');
    const walletAddress = useSelector((state: RootState) => getWalletAddress(state));

    useEffect(() => {
        const fetchData = async () => {
            const response = await axios.get(`http://localho.st:3002/get-address-refferer-id/${walletAddress}`);
            if (response.data) {
                setReffererID(response.data);
                setSavedReffererID(response.data);
            }
        };
        fetchData();
    }, [walletAddress]);

    const onSubmit = useCallback(async () => {
        // ${generalConfig.API_URL}
        const response = await axios.post(`http://localho.st:3002/update-refferer-id`, {
            walletAddress,
            reffererID,
        });
        if (response.data.error) {
            toast('Refferal ID already exists', { type: 'error' });
        } else {
            setSavedReffererID(reffererID);
            toast('Successfully set refferal ID', { type: 'success' });
        }
    }, [walletAddress, reffererID]);

    return (
        <Modal title="Refferal ID" onClose={onClose}>
            <Container>
                <Description>Choose your Refferal ID</Description>
                <FlexDivRowCentered>
                    <StyledInput value={reffererID} onChange={(e) => setReffererID(e.target.value)} />
                    <SubmitButton disabled={!reffererID || savedReffererID === reffererID} onClick={onSubmit}>
                        Submit
                    </SubmitButton>
                </FlexDivRowCentered>
                <FlexDivCentered style={{ marginTop: '30px' }}>
                    <CopyToClipboardButton
                        onClick={() => console.log('aaaa')}
                        disabled={!savedReffererID}
                        customDisabled={!savedReffererID}
                    >
                        Copy Refferal link
                    </CopyToClipboardButton>
                </FlexDivCentered>
            </Container>
        </Modal>
    );
};

const Container = styled(FlexDivColumnCentered)`
    width: 400px;
    margin-top: 30px;
    @media (max-width: 575px) {
        width: auto;
    }
`;

const Description = styled.div`
    font-style: normal;
    font-weight: 400;
    font-size: 18px;
    line-height: 20px;
    margin-bottom: 15px;
    color: ${(props) => props.theme.textColor.primary};
    p {
        margin-bottom: 10px;
    }
    a {
        cursor: pointer;
        color: #91bced;
        &:hover {
            color: #00f9ff;
        }
    }
`;

const StyledInput = styled.input`
    background: #ffffff;
    border-radius: 5px;
    border: 2px solid #1a1c2b;
    color: #1a1c2b;
    width: 300px;
    height: 34px;
    padding-left: 10px;
    padding-right: 60px;
    font-size: 18px;
    outline: none;
`;

const SubmitButton = styled.button`
    background: linear-gradient(88.84deg, #2fc9dd 19.98%, #1ca6b9 117.56%);
    border-radius: 8px;
    margin: 0 20px;
    font-size: 20px;
    font-weight: 700;
    line-height: 23px;
    color: #1a1c2b;
    width: 252px;
    border: none;
    padding: 7px;
    cursor: pointer;
    text-transform: uppercase;
    &:disabled {
        opacity: 0.4;
        cursor: default;
    }
`;

const CopyToClipboardButton = styled.button<{ customDisabled?: boolean }>`
    background: ${(props) => props.theme.button.background.tertiary};
    border: 2px solid ${(props) => props.theme.button.borderColor.secondary};
    color: ${(props) => props.theme.button.textColor.quaternary};
    border-radius: 5px;
    padding: 1px 20px 0px 20px;
    font-style: normal;
    font-weight: 400;
    font-size: 12.5px;
    text-align: center;
    outline: none;
    text-transform: none;
    cursor: pointer;
    min-height: 28px;
    width: fit-content;
    white-space: nowrap;
    opacity: ${(props) => (props.customDisabled ? '0.4' : '1')};
    &:hover {
        cursor: ${(props) => (props.customDisabled ? 'default' : 'pointer')};
        opacity: ${(props) => (props.customDisabled ? '0.4' : '0.8')};
    }
`;

export default RefferalModal;
