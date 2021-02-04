export interface Measurement {
  metric: string;
  at: number;
  value: number;
  unit: string;
}

export interface MetricDataSet {
  metric: string;
  measurements: Measurement[];
}

export interface FormattedMeasurement {
  at: number;
  metric: string;
  oilTemp?: number;
  flareTemp?: number;
  casingPressure?: number;
  injValveOpen?: number;
  waterTemp?: number;
  tubingPressure?: number;
  oilTempUnit?: string;
  flareTempUnit?: string;
  casingPressureUnit?: string;
  injValveOpenUnit?: string;
  waterTempUnit?: string;
  tubingPressureUnit?: string;
}
