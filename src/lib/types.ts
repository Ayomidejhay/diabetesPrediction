export type PatientInput = {
  pregnancies: number;
  glucose: number;
  blood_pressure: number;
  skin_thickness: number;
  insulin: number;
  bmi: number;
  diabetes_pedigree_function: number;
  age: number;
};

export type SinglePredictionResponse = {
  prediction: number;
  probability: number;
  prediction_text: string;
};

export type BatchPredictionResponse = {
  predictions: SinglePredictionResponse[];
};

export type ModelInfo = {
  model_type: string;
  features: string[];
  accuracy?: number;
  [k: string]: any;
};
