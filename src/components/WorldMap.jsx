"use client"

import React, { useState } from "react"
import {
    ComposableMap,
    Geographies,
    Geography,
    Marker,
    Graticule,
} from "react-simple-maps"
import { Tooltip as ReactTooltip } from "react-tooltip"
import "react-tooltip/dist/react-tooltip.css"

// Función para colorear países según cantidad de ataques
const getColor = (count, max) => {
    if (count === 0) return "#444" // países sin ataques
    const opacity = Math.min(count / max, 1)
    return `rgba(255,0,0,${opacity})`
}

export default function WorldMap({ data }) {
    const [tooltipContent, setTooltipContent] = useState("")

    // Contar ataques por país
    const counts = {}
    data.forEach((ip) => {
        const code = ip.country_code || "??"
        counts[code] = (counts[code] || 0) + 1
    })
    const maxAttacks = Math.max(...Object.values(counts), 1)

    // Puntos de IP
    const points = data.filter((d) => d.latitude && d.longitude)

    return (
        <div className="bg-gray-900 text-white p-6 rounded-xl shadow-lg w-full">
            <h2 className="text-xl mb-4 font-bold">Mapa mundial de ataques</h2>

            <div className="w-full h-auto">
                <ComposableMap
                    projection="geoNaturalEarth1"
                    projectionConfig={{ scale: 150 }}
                    width={1000}
                    height={500}
                    style={{ width: "100%", height: "auto" }}>
                    <Graticule stroke="#888" strokeWidth={0.3} />

                    <Geographies geography="https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json">
                        {({ geographies }) =>
                            geographies.map((geo) => {
                                const code = geo.properties.ISO_A2
                                const attacks = counts[code] || 0

                                return (
                                    <Geography
                                        key={geo.rsmKey}
                                        geography={geo}
                                        data-tooltip-id="tooltip"
                                        data-tooltip-content={`${geo.properties.NAME} - Ataques: ${attacks}`}
                                        style={{
                                            default: {
                                                fill: getColor(
                                                    attacks,
                                                    maxAttacks,
                                                ),
                                                stroke: "#555",
                                                strokeWidth: 0.5,
                                                outline: "none",
                                            },
                                            hover: {
                                                fill: "#ff9900",
                                                outline: "none",
                                            },
                                            pressed: {
                                                fill: "#ff5500",
                                                outline: "none",
                                            },
                                        }}
                                    />
                                )
                            })
                        }
                    </Geographies>

                    {/* Marcadores */}
                    {points.map((d, i) => (
                        <Marker
                            key={i}
                            coordinates={[d.longitude, d.latitude]}
                            data-tooltip-id="tooltip"
                            data-tooltip-content={`${d.country_name || "Unknown"} - IPs: ${d.count || 1}`}>
                            <circle
                                r={3}
                                fill="#00ffff"
                                stroke="#fff"
                                strokeWidth={0.5}
                            />
                        </Marker>
                    ))}
                </ComposableMap>
            </div>

            {/* Tooltip */}
            <ReactTooltip id="tooltip" place="top" effect="solid" />
        </div>
    )
}
