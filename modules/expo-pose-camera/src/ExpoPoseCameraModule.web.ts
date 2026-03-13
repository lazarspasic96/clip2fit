import { registerWebModule, NativeModule } from 'expo'

class ExpoPoseCameraModule extends NativeModule {
  async requestCameraPermission(): Promise<boolean> {
    return false
  }
  getCameraPermissionStatus(): string {
    return 'denied'
  }
}

export default registerWebModule(ExpoPoseCameraModule, 'ExpoPoseCamera')
