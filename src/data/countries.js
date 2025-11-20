import { feature } from "topojson-client"
import countriesTopo from "./countries-110m.json"

export const geoCountries = feature(
    countriesTopo,
    countriesTopo.objects.countries,
).features
