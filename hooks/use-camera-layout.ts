type LayoutSize = { width: number; height: number }

type CameraLayout = {
  isLandscape: boolean
  direction: 'column' | 'row'
  cameraFlex: number
  dashboardFlex: number
}

export const useCameraLayout = (size: LayoutSize): CameraLayout => {
  const isLandscape = size.width > size.height

  return {
    isLandscape,
    direction: isLandscape ? 'row' : 'column',
    cameraFlex: 3,
    dashboardFlex: 1,
  }
}
