import { create } from 'zustand'
import { StateCreator } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import { stepList } from './stepList';
import { StepWizardState } from '@/components/tools/common/ui/types';

interface DeployPoAWizardState extends StepWizardState {
   
}


import { createStepWizardStore } from '../../common/ui/StepWizardStoreCreator';

const DeployPoAWizardStoreFunc: StateCreator<DeployPoAWizardState> = (set, get) => ({
    ...createStepWizardStore({set, get, stepList}),
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
