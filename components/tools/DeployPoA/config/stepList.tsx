import { BookOpen, Terminal, Flag, Settings, Server } from 'lucide-react'
import Welcome from "../01_Welcome/Welcome";

import { StepGroupListType, StepListType } from '../../common/ui/types';

export const stepGroups: StepGroupListType = {
    "welcome": {
        title: "Welcome",
        icon: BookOpen
    },
}

export const stepList: StepListType = {
    "welcome": {
        title: "Welcome",
        component: <Welcome />,
        group: "welcome",
    },
}
