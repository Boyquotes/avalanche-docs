import { create } from 'zustand'
import { StateCreator } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import { stepList } from './stepList';
import { StepWizardState } from '@/components/tools/common/ui/types';
import { Chain } from 'viem';
interface DeployPoAWizardState extends StepWizardState {
   rpcURL: string;
   setRpcURL: (rpcURL: string) => void;
   chainName: string;
   setChainName: (name: string) => void;
   ticker: string;
   setTicker: (ticker: string) => void;
   evmChainIdHex: string;
   fillEVMChainIDFromRPC: () => Promise<string>
   getViemL1Chain: () => Chain

   validatorMessagesAddress: string | null;
   setValidatorMessagesAddress: (address: string) => void;

   poaValidatorManagerAddress: string | null;
   setPoaValidatorManagerAddress: (address: string) => void;
}

import { createStepWizardStore } from '../../common/ui/StepWizardStoreCreator';

const DeployPoAWizardStoreFunc: StateCreator<DeployPoAWizardState> = (set, get) => ({
    ...createStepWizardStore({set, get, stepList}),

    rpcURL: "",
    setRpcURL: (rpcURL: string) => set({ rpcURL, evmChainIdHex: "" }),

    chainName: "Custom Chain",
    setChainName: (chainName: string) => set({ chainName }),

    ticker: "COIN",
    setTicker: (ticker: string) => set({ ticker }),

    evmChainIdHex: "",
    
    fillEVMChainIDFromRPC: async () => {
        const state = get();
        const response = await fetch(state.rpcURL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                jsonrpc: '2.0',
                method: 'eth_chainId',
                params: [],
                id: 1
            }),
        });

        const data = await response.json();
        if (data.error) {
            throw new Error(data.error.message);
        }
        const evmChainIdHex = data.result;
        set({ evmChainIdHex });
        return parseInt(evmChainIdHex, 16).toString();
    },

    getViemL1Chain: () => {
        const state = get();
        return {
            id: parseInt(state.evmChainIdHex, 16),
            name: state.chainName,
            nativeCurrency: {
                decimals: 18,
                name: state.ticker + ' Native Token',
                symbol: state.ticker,
            },
            rpcUrls: {
                default: { http: [state.rpcURL] },
                public: { http: [state.rpcURL] },
            },
        } as const;
    },

    validatorMessagesAddress: null,
    setValidatorMessagesAddress: (address: string) => set({ validatorMessagesAddress: address }),

    poaValidatorManagerAddress: null,
    setPoaValidatorManagerAddress: (address: string) => set({ poaValidatorManagerAddress: address }),
})

const shouldPersist = true

const storageKey = 'deploy-poa-wizard-storage'

export const useDeployPoAWizardStore = shouldPersist
    ? create<DeployPoAWizardState>()(
        persist(
            DeployPoAWizardStoreFunc,
            {
                name: storageKey,
                storage: createJSONStorage(() => localStorage),
            }
        )
    )
    : create<DeployPoAWizardState>()(DeployPoAWizardStoreFunc);

export const resetDeployPoAWizardStore = () => {
    if (confirm('Are you sure you want to start over?')) {
        localStorage.removeItem(storageKey);
        window.location.reload();
    }
};
