import fs from "fs"

const data = JSON.parse(fs.readFileSync("ipdata_results.json", "utf8"))

const ips = data.map((d) => d.ip)
const unique = new Set(ips)

console.log("Total guardadas:", ips.length)
console.log("Únicas:", unique.size)

if (ips.length !== unique.size) {
    console.log("⚠️ HAY IPs DUPLICADAS")
} else {
    console.log("✔ No hay IPs duplicadas")
}
