import { ChevronRight } from 'lucide-react-native'
import { Pressable, Text, View } from 'react-native'

import { Colors } from '@/constants/colors'

import type { ProfileActionItem, ProfileScreenModel } from './profile-data'

interface ProfileDashboardProps {
  model: ProfileScreenModel
  onPressAction: (item: ProfileActionItem) => void
}

const toneColor = (tone: ProfileActionItem['tone']): string => {
  if (tone === 'accent') return Colors.brand.accent
  if (tone === 'danger') return '#f87171'
  return Colors.content.secondary
}

const SectionTitle = ({ eyebrow, title }: { eyebrow: string; title: string }) => (
  <View className="gap-1">
    <Text className="text-[11px] font-inter-semibold uppercase tracking-[2px] text-content-tertiary">{eyebrow}</Text>
    <Text className="text-xl font-inter-bold text-content-primary">{title}</Text>
  </View>
)

const ActionRow = ({
  item,
  onPress,
  compact = false,
}: {
  item: ProfileActionItem
  onPress: () => void
  compact?: boolean
}) => {
  const Icon = item.icon
  const color = toneColor(item.tone)

  return (
    <Pressable
      onPress={onPress}
      className={`rounded-[24px] border border-border-primary bg-background-secondary ${
        compact ? 'px-4 py-4' : 'px-4 py-4.5'
      }`}
      style={{ borderCurve: 'continuous' }}
    >
      <View className="flex-row items-start justify-between gap-3">
        <View className="flex-1 flex-row gap-3">
          <View
            className="h-10 w-10 items-center justify-center rounded-2xl"
            style={{
              backgroundColor: item.tone === 'accent' ? 'rgba(132,204,22,0.12)' : 'rgba(39,39,42,0.92)',
              borderCurve: 'continuous',
            }}
          >
            <Icon color={color} size={18} />
          </View>

          <View className="flex-1 gap-1">
            <Text className={`text-sm font-inter-medium ${item.tone === 'danger' ? 'text-red-300' : 'text-content-secondary'}`}>
              {item.label}
            </Text>
            <Text className={`text-base font-inter-semibold ${item.tone === 'danger' ? 'text-red-200' : 'text-content-primary'}`}>
              {item.value}
            </Text>
            <Text className="text-xs font-inter text-content-tertiary leading-4">{item.description}</Text>
          </View>
        </View>

        <ChevronRight color={color} size={18} style={{ marginTop: 2 }} />
      </View>
    </Pressable>
  )
}

export const ProfileDashboard = ({ model, onPressAction }: ProfileDashboardProps) => (
  <View className="gap-4">
    <ProfileHeroCard model={model} />

    {model.sections.map((section) => (
      <View
        key={section.key}
        className="gap-3 rounded-[30px] border border-border-primary bg-background-secondary p-4"
        style={{ borderCurve: 'continuous' }}
      >
        <SectionTitle eyebrow={section.eyebrow} title={section.title} />
        <View className="gap-3">
          {section.items.map((item) => (
            <ActionRow key={item.key} item={item} onPress={() => onPressAction(item)} compact />
          ))}
        </View>
      </View>
    ))}

    <View
      className="gap-3 rounded-[30px] border border-red-500/20 bg-background-secondary p-4"
      style={{ borderCurve: 'continuous' }}
    >
      <SectionTitle eyebrow="Account" title="Session and privacy controls" />
      <View className="gap-3">
        {model.accountActions.map((item) => (
          <ActionRow key={item.key} item={item} onPress={() => onPressAction(item)} compact />
        ))}
      </View>
    </View>
  </View>
)

const ProfileHeroCard = ({
  model,
}: {
  model: ProfileScreenModel
}) => {
  const footerLine =
    model.scheduleValue !== 'Not set' || model.locationValue !== 'Not set'
      ? `${model.scheduleValue} · ${model.locationValue}`
      : 'Complete your profile to personalize training plans and stats.'

  return (
    <View
      className="rounded-[30px] border border-border-primary bg-background-secondary p-5"
      style={{ borderCurve: 'continuous' }}
    >
      <View className="gap-5">
        <View className="flex-row items-center gap-4">
          <View className="h-14 w-14 items-center justify-center rounded-[20px] bg-background-primary">
            <Text className="text-xl font-inter-bold text-content-primary">{model.initials}</Text>
          </View>

          <View className="flex-1 gap-1">
            <Text className="text-xl font-inter-bold text-content-primary">{model.displayName}</Text>
            <Text className="text-sm font-inter text-content-secondary" numberOfLines={1}>
              {model.email}
            </Text>
          </View>
        </View>

        <View className="h-px bg-border-primary" />

        <Text className="text-sm font-inter text-content-secondary leading-5">
          {footerLine}
        </Text>
      </View>
    </View>
  )
}
