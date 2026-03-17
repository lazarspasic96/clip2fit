import { TrophyPodiumScreen } from './design-a-trophy-podium/trophy-podium-screen'
import { usePrScreenData } from './shared/use-pr-screen-data'

export const PrCelebrationScreen = () => {
  const data = usePrScreenData()

  if (data === null) return null

  return <TrophyPodiumScreen data={data} />
}
