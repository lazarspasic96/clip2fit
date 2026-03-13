import { NativeModule, requireNativeModule } from 'expo'

declare class ExpoPoseCameraModule extends NativeModule {
  requestCameraPermission(): Promise<boolean>
  getCameraPermissionStatus(): string
}

export default requireNativeModule<ExpoPoseCameraModule>('ExpoPoseCamera')
