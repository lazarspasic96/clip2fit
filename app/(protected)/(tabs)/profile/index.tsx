import { useRouter } from 'expo-router'
import { ActivityIndicator, Platform, Pressable, RefreshControl, Text, View } from 'react-native'
import { useRef } from 'react'
import Animated, { useAnimatedScrollHandler, useSharedValue } from 'react-native-reanimated'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

import { ProfileDashboard } from '@/components/profile/profile-dashboard'
import { buildProfileScreenModel, type ProfileActionItem } from '@/components/profile/profile-data'
import { ScreenBlurTarget } from '@/components/ui/screen-blur-target'
import { BlurredScreenHeader, getBlurredScreenHeaderHeight } from '@/components/ui/blurred-screen-header'
import { Colors } from '@/constants/colors'
import { useAuth } from '@/contexts/auth-context'
import { useProfileQuery } from '@/hooks/use-profile-query'
import { useStatsSummary } from '@/hooks/use-stats'

const ProfileScreen = () => {
  const { user, signOut } = useAuth()
  const router = useRouter()
  const insets = useSafeAreaInsets()
  const { profile, isLoading, isRefetching, error, refetch } = useProfileQuery()
  const {
    summary,
    isLoading: isStatsLoading,
    isRefetching: isStatsRefetching,
    error: statsError,
    refetch: refetchStats,
  } = useStatsSummary('all')

  const model = buildProfileScreenModel({ profile, email: user?.email })
  const blurTargetRef = useRef<View>(null)
  const headerHeight = getBlurredScreenHeaderHeight(insets.top)
  const scrollY = useSharedValue(0)
  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (event) => {
      scrollY.value = event.contentOffset.y
    },
  })

  const handlePressAction = (item: ProfileActionItem) => {
    if (item.key === 'sign-out') {
      void signOut()
      return
    }

    if (item.route !== undefined) router.push(item.route as never)
  }

  if (isLoading || isStatsLoading) {
    return (
      <View
        className="flex-1 bg-background-primary items-center justify-center"
        style={{ paddingTop: insets.top }}
        collapsable={false}
      >
        <ActivityIndicator size="large" color={Colors.content.secondary} />
      </View>
    )
  }

  return (
    <View className="flex-1 bg-background-primary" collapsable={false}>
      <ScreenBlurTarget targetRef={blurTargetRef} className="flex-1">
        <Animated.ScrollView
          className="flex-1 bg-background-primary"
          contentInsetAdjustmentBehavior="never"
          contentContainerStyle={{
            paddingTop: Platform.OS === 'android' ? insets.top + 74 : insets.top + 24,
            paddingHorizontal: 20,
            paddingBottom: Platform.OS === 'android' ? insets.bottom + 64 : insets.bottom,
            gap: 16,
          }}
          scrollIndicatorInsets={{
            top: headerHeight,
          }}
          onScroll={scrollHandler}
          scrollEventThrottle={16}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={isRefetching || isStatsRefetching}
              onRefresh={() => {
                void refetch()
                void refetchStats()
              }}
              progressViewOffset={headerHeight}
              tintColor={Colors.content.secondary}
            />
          }
        >
          {error !== null ? (
            <View
              className="rounded-[30px] border border-red-500/20 bg-background-secondary px-5 py-6"
              style={{ borderCurve: 'continuous' }}
            >
              <Text className="text-lg font-inter-bold text-content-primary">Couldn&apos;t load profile</Text>
              <Text className="mt-2 text-sm font-inter text-content-secondary">{error}</Text>
              <Pressable
                onPress={() => {
                  void refetch()
                }}
                className="mt-4 rounded-2xl bg-background-tertiary px-4 py-3"
                style={{ borderCurve: 'continuous', alignSelf: 'flex-start' }}
              >
                <Text className="text-sm font-inter-semibold text-brand-accent">Retry</Text>
              </Pressable>
            </View>
          ) : (
            <ProfileDashboard
              model={model}
              statsSummary={statsError === null ? summary : null}
              statsLoading={isStatsLoading}
              onPressAction={handlePressAction}
            />
          )}
        </Animated.ScrollView>
      </ScreenBlurTarget>

      <BlurredScreenHeader blurTarget={blurTargetRef} title="My Profile" scrollY={scrollY} />
    </View>
  )
}

export default ProfileScreen
