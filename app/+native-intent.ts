export const redirectSystemPath = ({ path, initial }: { path: string; initial: boolean }): string => {
  if (path.includes('expo-sharing')) {
    return initial ? '/' : '/(protected)/process-url'
  }
  return path
}
