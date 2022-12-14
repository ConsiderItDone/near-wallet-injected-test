import { useCallback, useEffect, useState } from 'react';
import {
  InjectedAPIAccount,
  InjectedAPIConnectParams,
  InjectedAPINetwork,
  InjectedAPISignInParams,
  InjectedAPISignOutParams,
  InjectedAPISignTransactionParams,
  InjectedAPISignTransactionsParams,
} from '../types/injectedWallet.types';
import { SignedTransaction } from 'near-api-js/lib/transaction';
import { transactions } from 'near-api-js';

const INJECTED_API_INITIALIZED_EVENT_NAME = 'daoWallet#event-initialized';

export const useDaoNearWallet = () => {
  const [hasInjectedWalletInitialized, setHasInjectedWalletInitialized] =
    useState<boolean>(false);

  const [connectedAccounts, setConnectedAccounts] = useState<
    InjectedAPIAccount[] | null
  >(null);

  const [network, setNetwork] = useState<InjectedAPINetwork | null>(null);

  useEffect(() => {
    const initialize = () => {
      setHasInjectedWalletInitialized(true);
    };

    window.addEventListener(INJECTED_API_INITIALIZED_EVENT_NAME, initialize);
    if (window?.near?.daoWallet?.initialized) {
      initialize();
      window.removeEventListener(
        INJECTED_API_INITIALIZED_EVENT_NAME,
        initialize,
      );
    }

    return () => {
      window.removeEventListener(
        INJECTED_API_INITIALIZED_EVENT_NAME,
        initialize,
      );
    };
  }, []);

  useEffect(() => {
    if (hasInjectedWalletInitialized) {
      window.near.daoWallet.on('accountsChanged', ({ accounts }) => {
        console.info('Changing accounts event:', { accounts });
        setConnectedAccounts(accounts);
      });
      window.near.daoWallet.on('networkChanged', ({ network }) => {
        console.info('Changing network event:', { network });
        setNetwork(network);
      });

      setConnectedAccounts(window.near.daoWallet.accounts);
      setNetwork(window.near.daoWallet.network);
    }
  }, [hasInjectedWalletInitialized]);

  const connect = useCallback((params?: InjectedAPIConnectParams) => {
    return window.near.daoWallet.connect(params);
  }, []);

  const disconnect = useCallback(() => {
    return window.near.daoWallet.disconnect();
  }, []);

  const signTransaction = useCallback(
    (params: InjectedAPISignTransactionParams): Promise<SignedTransaction> => {
      return window.near.daoWallet.signTransaction(params);
    },
    [],
  );

  const signTransactions = useCallback(
    (
      params: InjectedAPISignTransactionsParams,
    ): Promise<Array<transactions.SignedTransaction>> => {
      return window.near.daoWallet.signTransactions(params);
    },
    [],
  );

  const signIn = useCallback(
    (params: InjectedAPISignInParams): Promise<void> => {
      return window.near.daoWallet.signIn(params);
    },
    [],
  );

  const signOut = useCallback(
    (params: InjectedAPISignOutParams): Promise<void> => {
      return window.near.daoWallet.signOut(params);
    },
    [],
  );

  return {
    initialized: hasInjectedWalletInitialized,
    connectedAccounts,
    network,
    connect,
    get connected() {
      return window?.near?.daoWallet?.connected || false;
    },
    disconnect,
    signTransaction,
    signTransactions,
    signIn,
    signOut,
  };
};
