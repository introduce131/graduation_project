import { create } from "zustand";

// location : 위치 값 (state)
// setLocation() : 위치(state) 설정 함수
const useLocationStore = create((set) => ({
  location: null,
  setLocation: (coords) => set({ location: coords }),
}));

export default useLocationStore;
