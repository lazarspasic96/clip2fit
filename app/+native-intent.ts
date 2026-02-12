import { getShareExtensionKey } from 'expo-share-intent'

export const redirectSystemPath = ({
  path,
}: {
  path: string
  initial: string
}) => {
  try {
    if (path.includes(`dataUrl=${getShareExtensionKey()}`)) {
      return '/(protected)/process-url'
    }
    return path
  } catch {
    return '/'
  }
}
