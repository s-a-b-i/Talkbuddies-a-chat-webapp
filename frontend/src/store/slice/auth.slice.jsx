export const createAuthSlice = (set) => ({
  userInfo: {},
  isLoading: true,
  setUserInfo: (userInfo) => set({ userInfo, isLoading: false }),
  setLoading: (isLoading) => set({ isLoading }),
});