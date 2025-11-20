import { useMemo, useState, useEffect } from "react"
import {
    ScatterChart,
    Scatter,
    CartesianGrid,
    Tooltip,
    BarChart,
    Bar,
    XAxis,
    YAxis,
    PieChart,
    Pie,
    Cell,
    ZAxis,
} from "recharts"

// Paleta de colores más amplia
const COLORS = [
    "#3b82f6",
    "#f97316",
    "#ef4444",
    "#10b981",
    "#6366f1",
    "#facc15",
    "#8b5cf6",
    "#ec4899",
    "#14b8a6",
    "#f43f5e",
    "#60a5fa",
    "#a78bfa",
    "#f472b6",
    "#22c55e",
    "#f59e0b",
]

export default function Dashboard({ data }) {
    const [currentDate, setCurrentDate] = useState("")

    useEffect(() => {
        setCurrentDate(new Date().toLocaleDateString())
    }, [])

    // Conteo por país usando country_name
    const countryData = useMemo(() => {
        const map = {}
        for (const item of data) {
            const c = item.country_name || "Unknown"
            map[c] = (map[c] || 0) + 1
        }
        return Object.entries(map).map(([country, count]) => ({
            country,
            count,
        }))
    }, [data])

    const totalIPs = data.length
    const uniqueCountries = countryData.length

    const points = data
        .filter((d) => d.latitude && d.longitude)
        .map((d) => ({
            latitude: d.latitude,
            longitude: d.longitude,
            country: d.country_name || "Unknown",
            count: 1, // cada IP vale 1
        }))

    // Tooltip personalizado
    const CustomTooltip = ({ active, payload }) => {
        if (active && payload && payload.length) {
            const p = payload[0].payload
            return (
                <div className="bg-gray-900 text-white p-2 rounded shadow-lg">
                    <p className="font-bold">{p.country}</p>
                    <p>IPs: {p.count}</p>
                    <p>
                        Lat: {p.latitude.toFixed(2)}, Lon:{" "}
                        {p.longitude.toFixed(2)}
                    </p>
                </div>
            )
        }
        return null
    }

    return (
        <div className="space-y-10 p-3 flex flex-col">
            {/* KPIs */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                <div className="p-4 bg-gray-900 text-white rounded-xl shadow-lg">
                    <h3 className="text-sm">IPs totales</h3>
                    <p className="text-3xl font-bold">{totalIPs}</p>
                </div>

                <div className="p-4 bg-gray-900 text-white rounded-xl shadow-lg">
                    <h3 className="text-sm">Países distintos</h3>
                    <p className="text-3xl font-bold">{uniqueCountries}</p>
                </div>

                <div className="p-4 bg-gray-900 text-white rounded-xl shadow-lg">
                    <h3 className="text-sm">Fecha última actualización</h3>
                    <p className="text-sm">{currentDate}</p>
                </div>

                <div className="p-4 bg-gray-900 text-white rounded-xl shadow-lg">
                    <h3 className="text-sm">Gravedad promedio</h3>
                    <p className="text-3xl font-bold">
                        {(
                            data.reduce(
                                (a, b) => a + (b.abuseConfidenceScore || 0),
                                0,
                            ) / totalIPs
                        ).toFixed(1)}
                    </p>
                </div>
            </div>

            <div className="flex flex-wrap gap-6 justify-center items-center">
                {/* BARCHART */}
                <div className="bg-gray-900 p-6 rounded-xl shadow-lg">
                    <h2 className="text-xl mb-4 font-bold">Ataques por País</h2>
                    <div className="w-full overflow-x-auto">
                        <BarChart width={800} height={300} data={countryData}>
                            <XAxis dataKey="country" />
                            <YAxis />
                            <Tooltip
                                contentStyle={{
                                    backgroundColor: "#1f2937",
                                    border: "none",
                                }}
                                labelStyle={{ color: "#ffffff" }}
                                itemStyle={{ color: "#ffffff" }}
                            />
                            <Bar dataKey="count">
                                {countryData.map((entry, index) => (
                                    <Cell
                                        key={`cell-${index}`}
                                        fill={COLORS[index % COLORS.length]}
                                    />
                                ))}
                            </Bar>
                        </BarChart>
                    </div>
                </div>

                {/* PIE CHART */}
                <div className="bg-gray-900 p-6 rounded-xl shadow-lg">
                    <h2 className="text-xl mb-4 font-bold">
                        Top 5 países más agresivos
                    </h2>
                    <div className="w-full overflow-x-auto">
                        <PieChart width={800} height={300}>
                            <Pie
                                data={countryData
                                    .sort((a, b) => b.count - a.count)
                                    .slice(0, 5)}
                                dataKey="count"
                                nameKey="country"
                                outerRadius={120}>
                                {[...Array(5)].map((_, i) => (
                                    <Cell
                                        key={`slice-${i}`}
                                        fill={COLORS[i % COLORS.length]}
                                    />
                                ))}
                            </Pie>
                            <Tooltip />
                        </PieChart>
                    </div>
                </div>

                {/* SCATTER MAP LAT/LON */}
                <div className="bg-gray-900 p-6 rounded-xl shadow-lg">
                    <h2 className="text-xl mb-4 font-bold text-white">
                        Distribución geográfica de IPs
                    </h2>
                    <ScatterChart
                        width={800}
                        height={400}
                        margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                        <CartesianGrid stroke="#555" strokeDasharray="3 3" />
                        <XAxis
                            type="number"
                            dataKey="longitude"
                            name="Longitude"
                            domain={[-180, 180]}
                            tick={{ fill: "#fff" }}
                            label={{
                                value: "Longitude",
                                fill: "#fff",
                                position: "insideBottomRight",
                            }}
                        />
                        <YAxis
                            type="number"
                            dataKey="latitude"
                            name="Latitude"
                            domain={[-90, 90]}
                            tick={{ fill: "#fff" }}
                            label={{
                                value: "Latitude",
                                fill: "#fff",
                                angle: -90,
                                position: "insideLeft",
                            }}
                        />
                        <ZAxis
                            type="number"
                            dataKey="count"
                            range={[50, 400]}
                        />
                        <Tooltip
                            content={<CustomTooltip />}
                            cursor={{ strokeDasharray: "3 3" }}
                        />
                        <Scatter name="IPs" data={points} fill="#ef4444" />
                    </ScatterChart>
                </div>
            </div>
        </div>
    )
}
