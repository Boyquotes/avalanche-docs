'use client'
import Steps from "@/components/tools/common/ui/Steps";
import { useDeployPoAWizardStore, resetDeployPoAWizardStore } from "./config/store";
import { stepList, stepGroups } from "./config/stepList";
import { StepListType } from "../common/ui/types";
import ToolHeader from "../common/ui/ToolHeader";


export default function DeployPoAWizard() {
    const { currentStep, maxAdvancedStep, advanceTo,  } = useDeployPoAWizardStore()

    return (
        <>
            <div className="container mx-auto max-w-6xl p-8 ">
                <ToolHeader
                    title="Deploy PoA"
                    duration="30 min"
                    description="Deploy a Proof of Authority validator manager contract"
                    githubDir="DeployPoA"
                />
                <div className="flex flex-col lg:flex-row">
                    <div className="w-full lg:w-80 mb-8">
                        <Steps stepGroups={stepGroups} stepList={stepList} currentStep={currentStep as keyof StepListType} maxAdvancedStep={maxAdvancedStep as keyof StepListType} advanceTo={advanceTo} onReset={resetDeployPoAWizardStore} />
                    </div>
                    <div className="flex-1 min-w-0">
                        <div className="h-full">
                            {stepList[currentStep]?.component}
                        </div>
                    </div>
                </div>

            </div>
        </>
    );
}

