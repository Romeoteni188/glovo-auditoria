"use client"

import React from "react"
import Dashboard from "../components/Dashboard.jsx"
import WorldMap from "../components/WorldMap.jsx"
import data from "../../ipdata_results.json"

export default function Home() {
    return (
        <div className="p-6 space-y-10">
            <Dashboard data={data} />
            <WorldMap data={data} />
        </div>
    )
}
