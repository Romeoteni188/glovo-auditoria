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
            <footer className="mt-12 text-center text-gray-500 text-sm border-t border-gray-700 pt-4">
                Sistema de Auditoría © {new Date().getFullYear()}
                <br />
                Desarrollado y administrado por{" "}
                <span className="font-semibold">Romeoteni188</span>.
            </footer>
        </div>
    )
}
