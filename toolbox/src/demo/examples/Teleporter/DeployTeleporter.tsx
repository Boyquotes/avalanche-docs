import { useState, useEffect } from 'react';

export default function DeployTeleporter() {
    const [contractsData, setContractsData] = useState<any>(null);

    useEffect(() => {
        import("../../../../contracts/icm-contracts-releases/releases/v1.0.0.json")
            .then((data) => setContractsData(data.default));
    }, []);

    return (
        <div className="p-4">
            <h2 className="text-xl font-bold mb-4">Teleporter Deployment Info</h2>
            <pre className="bg-gray-100 p-4 rounded">
                {contractsData ? JSON.stringify(contractsData, null, 2) : 'Loading...'}
            </pre>
        </div>
    );
}
