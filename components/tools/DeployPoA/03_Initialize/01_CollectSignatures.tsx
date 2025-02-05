import NextPrev from "../../common/ui/NextPrev"
import { useDeployPoAWizardStore } from "../config/store"

export default function CollectSignatures() {
    const { goToNextStep, goToPreviousStep } = useDeployPoAWizardStore()

    return (
        <div>
            <h1>Collect Signatures</h1>
            <NextPrev
                nextDisabled={false}
                prevHidden={false}
                onNext={goToNextStep}
                onPrev={goToPreviousStep}
            />
        </div>
    )
}
