import React, { useCallback, useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from 'redux/rootReducer';
import { getNetworkId, getWalletAddress } from 'redux/modules/wallet';
import useFavoriteTeamDataQuery from 'queries/favoriteTeam/useFavoriteTeamDataQuery';
import { ReactComponent as SymbolsBackground } from 'assets/images/favorite-team/symbols-background.svg';
import { setTheme } from 'redux/modules/ui';
import { Theme } from 'constants/ui';
import Loader from 'components/Loader';
import { Container, SymbolsContainer } from './styled-components';
import Eligible from './components/Eligible';
import NotEligible from './components/NotEligible';
import ChooseNFT from './components/ChooseNFT';

const MintWorldCupNFT: React.FC = () => {
    const networkId = useSelector((state: RootState) => getNetworkId(state));
    const walletAddress = useSelector((state: RootState) => getWalletAddress(state)) || '';
    const dispatch = useDispatch();

    const favoriteTeamDataQuery = useFavoriteTeamDataQuery(walletAddress, networkId);

    const favoriteTeamData =
        favoriteTeamDataQuery.isSuccess && favoriteTeamDataQuery.data ? favoriteTeamDataQuery.data : null;

    const [isChooseNFTOpen, setIsChooseNFTOpen] = useState<boolean>(!!favoriteTeamData?.favoriteTeam);

    const handleChooseNFT = useCallback(() => {
        setIsChooseNFTOpen(true);
    }, [setIsChooseNFTOpen]);

    useEffect(() => {
        dispatch(setTheme(Theme.WORLDCUP));
    }, []);

    return (
        <>
            {favoriteTeamDataQuery.isLoading ? (
                <Loader />
            ) : (
                <Container>
                    {!favoriteTeamData?.isEligible && <NotEligible />}
                    {favoriteTeamData?.isEligible && !isChooseNFTOpen && <Eligible onChooseNft={handleChooseNFT} />}
                    {isChooseNFTOpen && <ChooseNFT />}
                    <SymbolsContainer>
                        <SymbolsBackground />
                    </SymbolsContainer>
                </Container>
            )}
        </>
    );
};

export default MintWorldCupNFT;
