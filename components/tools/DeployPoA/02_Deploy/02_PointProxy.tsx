import { http } from "viem";
import { useEffect } from "react";
import { useState } from "react";
import NextPrev from "../../common/ui/NextPrev"
import { useDeployPoAWizardStore } from "../config/store"
import { PROXY_ADMIN_ADDRESS, PROXY_ADDRESS, UNITIALIZED_PROXY_ADDRESS } from "../../common/utils/genGenesis";
import ProxyAdmin from "../../common/openzeppelin-contracts-4.9/compiled/ProxyAdmin.json";
import { createPublicClient, createWalletClient, custom } from "viem";
import RequireWalletConnection from "../../common/ui/RequireWalletConnectionV2";

export default function PointProxy() {
    const { goToNextStep, goToPreviousStep,getViemL1Chain } = useDeployPoAWizardStore()
    const [upgradeComplete, setUpgradeComplete] = useState(false);

    return (
        <div>
            <div className="mb-4">
                <RequireWalletConnection chain={getViemL1Chain()} skipUI={true}>
                    <UpgradeProxyForm onUpgradeComplete={setUpgradeComplete} />
                </RequireWalletConnection>
            </div>
            <NextPrev
                nextDisabled={!upgradeComplete}
                prevHidden={false}
                onNext={goToNextStep}
                onPrev={goToPreviousStep}
            />
        </div>
    )
}

export function UpgradeProxyForm({ onUpgradeComplete }: { onUpgradeComplete?: (success: boolean) => void }) {
    const { poaValidatorManagerAddress, getViemL1Chain } = useDeployPoAWizardStore();
    const [isUpgrading, setIsUpgrading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);
    const [currentImplementation, setCurrentImplementation] = useState<string | null>(null);

    useEffect(() => {
        async function checkCurrentImplementation() {
            try {
                const chain = getViemL1Chain();
                const client = createPublicClient({
                    chain,
                    transport: http(),
                });

                const implementation = await client.readContract({
                    address: PROXY_ADMIN_ADDRESS,
                    abi: ProxyAdmin.abi,
                    functionName: 'getProxyImplementation',
                    args: [PROXY_ADDRESS],
                });

                setCurrentImplementation(implementation as string);
                if (implementation && poaValidatorManagerAddress &&
                    (implementation as string).toLowerCase() === poaValidatorManagerAddress.toLowerCase()) {
                    onUpgradeComplete?.(true);
                } else {
                    onUpgradeComplete?.(false);
                }
            } catch (err) {
                console.error('Error checking implementation:', err);
                setError(err instanceof Error ? err.message : 'Unknown error occurred');
                onUpgradeComplete?.(false);
            }
        }

        checkCurrentImplementation();
    }, [getViemL1Chain, poaValidatorManagerAddress, onUpgradeComplete]);

    const handleUpgrade = async () => {
        try {
            if (!poaValidatorManagerAddress) {
                throw new Error('PoA Validator Manager address not set');
            }

            if (!window.avalanche) {
                throw new Error('No ethereum provider found');
            }

            setIsUpgrading(true);
            setError(null);
            setSuccessMessage(null);

            const walletClient = createWalletClient({
                chain: getViemL1Chain(),
                transport: custom(window.avalanche)
            });

            const [address] = await walletClient.requestAddresses();

            const hash = await walletClient.writeContract({
                address: PROXY_ADMIN_ADDRESS,
                abi: ProxyAdmin.abi,
                functionName: 'upgrade',
                args: [PROXY_ADDRESS, poaValidatorManagerAddress as `0x${string}`],
                account: address,
            });

            const publicClient = createPublicClient({
                chain: getViemL1Chain(),
                transport: http(),
            });

            await publicClient.waitForTransactionReceipt({ hash });
            setSuccessMessage('Proxy implementation upgraded successfully!');
            setCurrentImplementation(poaValidatorManagerAddress);
            onUpgradeComplete?.(true);
        } catch (err) {
            console.error('Error upgrading proxy:', err);
            setError(err instanceof Error ? err.message : 'Unknown error occurred');
            onUpgradeComplete?.(false);
        } finally {
            setIsUpgrading(false);
        }
    };

    let status = null;
    if (currentImplementation === UNITIALIZED_PROXY_ADDRESS) {
        status = <div className="mb-4">Proxy is not initialized yet</div>;
    } else if (currentImplementation?.toLowerCase() === poaValidatorManagerAddress?.toLowerCase()) {
        status = <div className=" mb-4">Proxy is already pointing to the correct implementation</div>;
    } else if (currentImplementation === null) {
        status = <div className="text-red-600 dark:text-red-400 mb-4">loading...</div>;
    }

    return (
        <div className="mt-6 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
            <h2 className="text-xl font-medium mb-4 dark:text-gray-200">Upgrade Proxy Implementation</h2>

            <div className="space-y-4">
                {status}

                {successMessage && (
                    <div className=" mb-2">
                        {successMessage}
                    </div>
                )}

                {error && (
                    <div className="text-red-600 dark:text-red-400 mb-4">
                        Error: {error}
                    </div>
                )}

                <button
                    onClick={handleUpgrade}
                    disabled={
                        isUpgrading ||
                        !poaValidatorManagerAddress ||
                        (currentImplementation?.toLowerCase() ===
                            poaValidatorManagerAddress?.toLowerCase())
                    }
                    className={`w-full p-2 rounded ${isUpgrading ||
                        !poaValidatorManagerAddress ||
                        (currentImplementation?.toLowerCase() ===
                            poaValidatorManagerAddress?.toLowerCase())
                        ? 'bg-gray-100 dark:bg-gray-800 text-gray-400 dark:text-gray-600 cursor-not-allowed'
                        : 'bg-blue-500 text-white hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700'
                        }`}
                >
                    {isUpgrading ? 'Upgrading...' : 'Upgrade to PoA Validator Manager'}
                </button>
            </div>
        </div>
    );
}
