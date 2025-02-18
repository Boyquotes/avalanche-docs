import { useState, useEffect } from 'react';

export default function DeployTeleporter() {
    const [deploymentTransaction, setDeploymentTransaction] = useState<any>(null);
    const [deployerAddress, setDeployerAddress] = useState<any>(null);

    useEffect(() => {
        import("../../../../contracts/icm-contracts-releases/v1.0.0/TeleporterMessenger_Deployer_Address_v1.0.0.txt.json")
            .then((data) => setDeployerAddress(data.default.content));

        import("../../../../contracts/icm-contracts-releases/v1.0.0/TeleporterMessenger_Deployment_Transaction_v1.0.0.txt.json")
            .then((data) => setDeploymentTransaction(data.default.content));
    }, []);

    return (
        <div className="p-4">
            <h2 className="text-xl font-bold mb-4">Teleporter Deployment Info</h2>
            <pre className="bg-gray-100 p-4 rounded">
                {deploymentTransaction ? JSON.stringify(deploymentTransaction, null, 2) : 'Loading...'}
            </pre>
            <pre className="bg-gray-100 p-4 rounded">
                {deployerAddress ? JSON.stringify(deployerAddress, null, 2) : 'Loading...'}
            </pre>
        </div>
    );
}
