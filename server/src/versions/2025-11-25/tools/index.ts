import type { ToolDef } from "../types.js";
import { getWeather } from "./weather.js";

export const tools: Record<string, ToolDef> = {
  get_weather: getWeather,
};
