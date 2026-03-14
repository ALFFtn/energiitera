interface WeatherData {
    temperature: number;
    humidity: number;
    windSpeed: number;
    weatherCode: number;
    weatherDescription: string;
    weatherIcon: string;
    city: string;
    timestamp: string;
}
export declare function getCurrentWeather(): Promise<WeatherData>;
export {};
//# sourceMappingURL=weatherService.d.ts.map