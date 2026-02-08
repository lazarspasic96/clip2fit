import { Pressable, Text, ActivityIndicator } from 'react-native'
import { GoogleLogo } from './google-logo'

interface GoogleSignInButtonProps {
  onPress: () => void
  loading?: boolean
}

export const GoogleSignInButton = ({ onPress, loading }: GoogleSignInButtonProps) => {
  return (
    <Pressable
      onPress={onPress}
      disabled={loading}
      className={`flex-row items-center justify-center gap-3 rounded-md py-3.5 border border-border-primary bg-background-secondary ${
        loading ? 'opacity-50' : ''
      }`}
    >
      {loading ? (
        <ActivityIndicator color="#fafafa" />
      ) : (
        <>
          <GoogleLogo size={20} />
          <Text className="text-base font-inter-semibold text-content-primary">Continue with Google</Text>
        </>
      )}
    </Pressable>
  )
}
