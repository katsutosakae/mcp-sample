import type { ToolDef } from "../types.js";

const NWS_API_BASE = "https://api.weather.gov";
const USER_AGENT = "weather-app/1.0";

interface ForecastPeriod {
  name?: string;
  temperature?: number;
  temperatureUnit?: string;
  windSpeed?: string;
  windDirection?: string;
  shortForecast?: string;
}

export const getWeather: ToolDef = {
  name: "get_weather",
  description: "Get weather forecast for US coordinates using NWS API.",
  inputSchema: {
    type: "object",
    properties: {
      latitude: { type: "number" },
      longitude: { type: "number" },
    },
    required: ["latitude", "longitude"],
  },
  handler: async ({ latitude, longitude }: { latitude: number; longitude: number }) => {
    const lat = Number(latitude);
    const lon = Number(longitude);
    if (!Number.isFinite(lat) || !Number.isFinite(lon)) {
      throw new Error("latitude/longitude must be valid numbers");
    }

    const headers = {
      "User-Agent": USER_AGENT,
      Accept: "application/geo+json",
    };
    const pointsUrl = `${NWS_API_BASE}/points/${lat.toFixed(4)},${lon.toFixed(4)}`;

    try {
      const pointsResponse = await fetch(pointsUrl, { headers });
      const pointsData = await pointsResponse.json();
      if (!pointsResponse.ok) {
        const parameterErrors = pointsData?.parameterErrors
        if (parameterErrors) {
          const errorText = parameterErrors.map((error : any) => `${error?.parameter}: ${error?.message}`).join("\n");
          return {
            content: [{ type: "text", text: errorText }],
          };
        }
        return {
          content: [{ type: "text", text: "Failed to fetch Weather API." }],
        };
      }

      const forecastUrl = pointsData.properties?.forecast;
      if (!forecastUrl) {
        return {
          content: [{ type: "text", text: "Failed to get forecast URL from grid point data" }],
        };
      }

      const forecastResponse = await fetch(forecastUrl, { headers });
      if (!forecastResponse.ok) {
        return {
          content: [{ type: "text", text: "Failed to fetch Weather API." }],
        };
      }

      const forecastData = await forecastResponse.json();
      if (!forecastData) {
        return {
          content: [{ type: "text", text: "Failed to retrieve forecast data" }],
        };
      }

      const periods = forecastData.properties?.periods || [];
      if (periods.length === 0) {
        return {
          content: [{ type: "text", text: "No forecast periods available" }],
        };
      }

      const formattedForecast = periods.map((period: ForecastPeriod) =>
        [
          `${period.name || "Unknown"}:`,
          `Temperature: ${period.temperature || "Unknown"}°${period.temperatureUnit || "F"}`,
          `Wind: ${period.windSpeed || "Unknown"} ${period.windDirection || ""}`,
          `${period.shortForecast || "No forecast available"}`,
          "---",
        ].join("\n")
      );

      return {
        content: [
          {
            type: "text",
            text: `Forecast for ${latitude}, ${longitude}:\n\n${formattedForecast.join("\n")}`,
          },
        ],
      };
    } catch (error) {
      console.error(error instanceof Error ? error.message : error);
      return {
        content: [{ type: "text", text: "Error making NWS request" }],
      };
    }
  },
};
