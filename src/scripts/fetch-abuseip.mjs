import fs from "fs/promises"
import fetch from "node-fetch"
import dotenv from "dotenv"

dotenv.config()

const API_KEY = process.env.IPDATA_KEY // ahora usas la clave de ipdata
const DAILY_LIMIT = 1000 //400,500 peticiones que quieres hacer hoy
const COOLDOWN = 1 * 2000 // si quieres, un pequeño delay entre peticiones

async function loadJSON(path, fallback) {
    try {
        const raw = await fs.readFile(path, "utf8")
        return JSON.parse(raw)
    } catch {
        return fallback
    }
}

async function main() {
    const ips = (await fs.readFile("banned_ips.txt", "utf8"))
        .split("\n")
        .filter(Boolean)

    console.log("🔍 Total IPs en lista:", ips.length)

    const existing = await loadJSON("ipdata_results.json", [])
    const processedIPs = new Set(existing.map((r) => r.ip))

    console.log("📁 Ya procesadas:", processedIPs.size)

    // Progreso diario
    const progress = await loadJSON("progress_ipdata.json", {
        lastIndex: 0,
        date: new Date().toISOString().slice(0, 10),
        requestsToday: 0,
    })

    const today = new Date().toISOString().slice(0, 10)
    if (progress.date !== today) {
        progress.lastIndex = 0
        progress.requestsToday = 0
        progress.date = today
        console.log(`🗓 Nuevo día (${today}), reiniciando progreso.`)
    }

    let results = [...existing]

    for (let i = progress.lastIndex; i < ips.length; i++) {
        if (progress.requestsToday >= DAILY_LIMIT) {
            console.log(
                `⏹ Límite diario alcanzado: ${DAILY_LIMIT} peticiones.`,
            )
            break
        }

        const ip = ips[i]
        if (processedIPs.has(ip)) {
            console.log("⏩ Saltando (ya existe):", ip)
        } else {
            console.log("➡️ Consultando ipdata:", ip)
            const res = await fetch(
                `https://api.ipdata.co/${ip}?api-key=${API_KEY}`,
            )
            if (res.status === 429) {
                console.log("⛔ Límite ipdata alcanzado (429), deteniendo.")
                break // terminar si ipdata te bloquea
            }

            const json = await res.json()
            results.push(json)
            processedIPs.add(ip)
            console.log("   ✔ Guardado:", ip)

            // guardar resultados progresivos
            await fs.writeFile(
                "ipdata_results.json",
                JSON.stringify(results, null, 2),
            )
        }

        // actualizar progreso
        progress.lastIndex = i + 1
        progress.requestsToday += 1
        await fs.writeFile(
            "progress_ipdata.json",
            JSON.stringify(progress, null, 2),
        )

        // opcional cooldown entre peticiones
        await new Promise((r) => setTimeout(r, COOLDOWN))
    }

    console.log(
        "🎉 Finalizado por hoy. Peticiones hechas:",
        progress.requestsToday,
    )
    console.log("📍 Continuará desde IP index:", progress.lastIndex)
}

main()
