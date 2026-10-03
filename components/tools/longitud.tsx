"use client";

import { UnitConverter } from "./unit-converter";
import { LENGTH } from "@/lib/tools/calc/units";

export default function LongitudTool() {
  return <UnitConverter slug="longitud" units={LENGTH} from="mi" to="km" />;
}
