import NextPrev from "../../common/ui/NextPrev"
import { useDeployPoAWizardStore } from "../config/store"
import RequireWalletConnection from "../../common/ui/RequireWalletConnectionV2"

export default function DeployContracts() {
    const { goToNextStep, goToPreviousStep, getViemL1Chain } = useDeployPoAWizardStore()

    return (
        <div>
            <RequireWalletConnection chain={getViemL1Chain()} skipUI={true}>
                <h1>Deploy Contracts</h1>
            </RequireWalletConnection>
            
            <NextPrev
                nextDisabled={false}
                prevHidden={false}
                onNext={goToNextStep}
                onPrev={goToPreviousStep}
            />
        </div>
    )
}
