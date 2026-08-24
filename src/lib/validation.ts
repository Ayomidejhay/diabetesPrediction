import { z } from "zod";

export const patientSchema = z.object({
  pregnancies: z.number().int().min(0).max(20).refine(val => val !== undefined, { message: "Required" }),
  glucose: z.number().int().min(0).max(300).refine(val => val !== undefined, { message: "Required" }),
  blood_pressure: z.number().int().min(0).max(200).refine(val => val !== undefined, { message: "Required" }),
  skin_thickness: z.number().int().min(0).max(100).refine(val => val !== undefined, { message: "Required" }),
  insulin: z.number().int().min(0).max(1000).refine(val => val !== undefined, { message: "Required" }),
  bmi: z.number().min(0).max(100).refine(val => val !== undefined, { message: "Required" }),
  diabetes_pedigree_function: z.number().min(0).max(3).refine(val => val !== undefined, { message: "Required" }),
  age: z.number().int().min(0).max(120).refine(val => val !== undefined, { message: "Required" }),



//   pregnancies: z.number({ required_error: "Required" }).int().min(0).max(20),
//   glucose: z.number({ required_error: "Required" }).int().min(0).max(300),
//   blood_pressure: z.number({ required_error: "Required" }).int().min(0).max(200),
//   skin_thickness: z.number({ required_error: "Required" }).int().min(0).max(100),
//   insulin: z.number({ required_error: "Required" }).int().min(0).max(1000),
//   bmi: z.number({ required_error: "Required" }).min(0).max(100),
//   diabetes_pedigree_function: z.number({ required_error: "Required" }).min(0).max(3),
//   age: z.number({ required_error: "Required" }).int().min(0).max(120),
});

export type PatientSchema = z.infer<typeof patientSchema>;
