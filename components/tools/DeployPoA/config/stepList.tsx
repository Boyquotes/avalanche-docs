import { BookOpen, Terminal, Flag, Settings, Server } from 'lucide-react'
import Welcome from "../01_Welcome/01_Welcome";
import DeployContracts from "../02_Deploy/01_DeployContracts";
import PointProxy from "../02_Deploy/02_PointProxy";
import Initialize from "../03_Initialize/02_Initialize";
import InitializeValidatorSet from "../03_Initialize/03_InitializeValidatorSet";
import { StepGroupListType, StepListType } from '../../common/ui/types';
import EVMChainDetails from '../01_Welcome/02_EVMChainDetails';

export const stepGroups: StepGroupListType = {
    "welcome": {
        title: "Welcome",
        icon: BookOpen
    },
    "deploy": {
        title: "Deploy",
        icon: Server
    },
    "initialize": {
        title: "Initialize",
        icon: Settings
    }
}

export const stepList: StepListType = {
    "welcome": {
        title: "Welcome",
        component: <Welcome />,
        group: "welcome",
    },
    "chainDetails": {
        title: "EVM Chain Details",
        component: <EVMChainDetails />,
        group: "welcome",
    },
    "deploy": {
        title: "Deploy",
        component: <DeployContracts />,
        group: "deploy",
    },
    "pointProxy": {
        title: "Point Proxy",
        component: <PointProxy />,
        group: "deploy",
    },
    "initialize": {
        title: "Initialize",
        component: <Initialize />,
        group: "initialize",
    },
    "initializeValidatorSet": {
        title: "Initialize Validator Set",
        component: <InitializeValidatorSet />,
        group: "initialize",
    }
}
