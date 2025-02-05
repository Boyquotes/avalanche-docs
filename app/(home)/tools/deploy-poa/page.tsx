'use client'
import DeployPoA from "@/components/tools/DeployPoA";
import dynamic from 'next/dynamic';


const DeployPoANoSSR = dynamic(() => Promise.resolve(DeployPoA), {
    ssr: false,
});


export default function L1LauncherPage() {
    return (
        <div className="">
            <DeployPoANoSSR />
        </div>
    );
}
