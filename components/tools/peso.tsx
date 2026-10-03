"use client";

import { UnitConverter } from "./unit-converter";
import { MASS } from "@/lib/tools/calc/units";

export default function PesoTool() {
  return <UnitConverter slug="peso" units={MASS} from="kg" to="lb" />;
}
