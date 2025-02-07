"use client"

import { Component1, Component2 } from "isolation-experiment";

export default function Page() {
    return (
        <div>
            <Component1 initialCount={10} />
            <Component2 />
        </div>
    )
}
