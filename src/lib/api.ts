import axios from "axios";
import type {
  PatientInput,
  SinglePredictionResponse,
  BatchPredictionResponse,
  ModelInfo
} from "./types";

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL || "http://127.0.0.1:8000", // fallback for dev
  headers: {
    "Content-Type": "application/json",
  },
});

// Health check
export async function health() {
  try {
    const { data } = await api.get<{ status: string; model_loaded?: boolean }>("/health");
    return data;
  } catch (error) {
    console.error("Health check failed:", error);
    throw error;
  }
}

// Model info
export async function modelInfo() {
  try {
    const { data } = await api.get<ModelInfo>("/model-info");
    return data;
  } catch (error) {
    console.error("Failed to fetch model info:", error);
    throw error;
  }
}

// Predict single patient
export async function predictOne(payload: PatientInput) {
  try {
    const { data } = await api.post<SinglePredictionResponse>("/predict", payload);
    return data;
  } catch (error) {
    console.error("Prediction (single) failed:", error);
    throw error;
  }
}

// Predict batch patients
export async function predictBatch(patients: PatientInput[]) {
  try {
    const { data } = await api.post<BatchPredictionResponse>("/predict-batch", {
      patients,
    });
    return data;
  } catch (error) {
    console.error("Prediction (batch) failed:", error);
    throw error;
  }
}
