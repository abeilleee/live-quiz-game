export const reject = <S>(state: S, errorText: string) => ({
  state,
  result: { success: false as const, data: {}, errorText },
});
