import { useState } from "react";
import NextPrev from "../../common/ui/NextPrev";
import { useDeployPoAWizardStore } from "../config/store";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ArrowRight, Download } from "lucide-react";
import { useL1LauncherWizardStore } from "../../L1Launcher/config/store";

export default function ChainDetails() {
    const [error, setError] = useState<string>("");
    const {
        rpcURL, setRpcURL,
        chainName, setChainName,
        ticker, setTicker,
        fillEVMChainIDFromRPC,
        goToNextStep, goToPreviousStep,
        evmChainIdHex
    } = useDeployPoAWizardStore()

    const l1Store = useL1LauncherWizardStore()

    const importFromL1 = () => {
        setChainName(l1Store.l1Name)
        setTicker(l1Store.tokenSymbol)
        setRpcURL(l1Store.getL1RpcEndpoint())
    }

    const handleRPCCheck = async () => {
        try {
            setError("");
            const chainId = await fillEVMChainIDFromRPC();
        } catch (err) {
            setError(err instanceof Error ? err.message : "An unknown error occurred");
        }
    };

    return <div>
        <div className="space-y-4 mb-4">
            {l1Store.l1Name && l1Store.tokenSymbol && l1Store.getL1RpcEndpoint() && (
                <div >
                    <Button 
                        variant="outline" 
                    size="sm"
                    onClick={importFromL1}
                >
                    <Download className="mr-2 h-4 w-4" />
                    Import from L1 Launcher
                </Button>
            </div>
            )}

            <div>
                <label className="block text-sm font-medium mb-1">Chain Name</label>
                <Input
                    value={chainName}
                    onChange={(e) => setChainName(e.target.value)}
                    placeholder="Enter Chain Name"
                />
            </div>
            
            <div>
                <label className="block text-sm font-medium mb-1">Ticker Symbol</label>
                <Input
                    value={ticker}
                    onChange={(e) => setTicker(e.target.value)}
                    placeholder="Enter Ticker Symbol"
                />
            </div>

            <div>
                <label className="block text-sm font-medium mb-1">RPC URL</label>
                <div className="flex gap-2">
                    <Input
                        value={rpcURL}
                        onChange={(e) => setRpcURL(e.target.value)}
                        placeholder="Enter RPC URL"
                    />
                    <Button onClick={handleRPCCheck}>
                        Check
                    </Button>
                </div>
                {error && (
                    <div className="mt-2 text-sm text-red-600">
                        {error}
                    </div>
                )}
                {evmChainIdHex && !error && (
                    <div className="mt-2 text-sm text-green-600">
                        Chain ID: {parseInt(evmChainIdHex, 16)}
                    </div>
                )}
            </div>
        </div>
        
        <NextPrev
            nextDisabled={!evmChainIdHex}
            prevHidden={false}
            onNext={goToNextStep}
            onPrev={goToPreviousStep}
        />
    </div>
}
