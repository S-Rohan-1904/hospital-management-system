import { useHospitalsContext } from "@/context/HospitalsContext";

export const useHospitals = () => {
  const { hospitals, loading, error } = useHospitalsContext();

  return { hospitals, loading, error };
};
