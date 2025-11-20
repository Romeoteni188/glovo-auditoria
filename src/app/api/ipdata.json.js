import data from "../../../ipdata_results.json"

export function GET() {
    return new Response(JSON.stringify(data), {
        headers: { "Content-Type": "application/json" },
    })
}
