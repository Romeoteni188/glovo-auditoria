import fs from "fs/promises"
import fetch from "node-fetch"
import dotenv from "dotenv"

dotenv.config()

const API_KEY = process.env.IPDATA_KEY
const DAILY_LIMIT = 1000
const COOLDOWN = 2000 // 2 segundos opcional

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

    // Carga resultados existentes (pero NO se usarán para saltar)
    const existing = await loadJSON("ipdata_results.json", [])
    let results = [...existing]

    // Carga progreso diario
    const progress = await loadJSON("progress_ipdata.json", {
        lastIndex: 0,
        date: new Date().toISOString().slice(0, 10),
        requestsToday: 0,
    })

    const today = new Date().toISOString().slice(0, 10)
    if (progress.date !== today) {
        // Nuevo día => reinicio solo los contadores diarios
        progress.lastIndex = progress.lastIndex
        progress.requestsToday = 0
        progress.date = today
        console.log(`🗓 Nuevo día (${today}), reiniciando solo requestsToday.`)
    }

    console.log("📌 Comenzando desde índice:", progress.lastIndex)

    for (let i = progress.lastIndex; i < ips.length; i++) {
        if (progress.requestsToday >= DAILY_LIMIT) {
            console.log(
                `⏹ Límite diario alcanzado: ${DAILY_LIMIT} peticiones.`,
            )
            break
        }

        const ip = ips[i]

        console.log("➡️ Consultando ipdata:", ip)

        const res = await fetch(
            `https://api.ipdata.co/${ip}?api-key=${API_KEY}`,
        )

        if (res.status === 429) {
            console.log("⛔ Límite ipdata alcanzado (429), deteniendo.")
            break
        }

        const json = await res.json()

        // Forzar que la IP quede siempre guardada
        json.ip = ip
        results.push(json)

        console.log("   ✔ Guardado:", ip)

        // Guardar resultados
        await fs.writeFile(
            "ipdata_results.json",
            JSON.stringify(results, null, 2),
        )

        // Actualizar progreso
        progress.lastIndex = i + 1
        progress.requestsToday += 1
        await fs.writeFile(
            "progress_ipdata.json",
            JSON.stringify(progress, null, 2),
        )

        // opcional: cooldown
        await new Promise((r) => setTimeout(r, COOLDOWN))
    }

    console.log(
        "🎉 Finalizado por hoy. Peticiones hechas:",
        progress.requestsToday,
    )
    console.log("📍 Continuará desde IP index:", progress.lastIndex)
}

main()
