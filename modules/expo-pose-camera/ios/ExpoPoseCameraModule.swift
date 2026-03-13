import ExpoModulesCore
import AVFoundation

public class ExpoPoseCameraModule: Module {
  public func definition() -> ModuleDefinition {
    Name("ExpoPoseCamera")

    AsyncFunction("requestCameraPermission") { () -> Bool in
      await withCheckedContinuation { continuation in
        AVCaptureDevice.requestAccess(for: .video) { granted in
          continuation.resume(returning: granted)
        }
      }
    }

    Function("getCameraPermissionStatus") { () -> String in
      switch AVCaptureDevice.authorizationStatus(for: .video) {
      case .authorized:
        return "granted"
      case .denied, .restricted:
        return "denied"
      case .notDetermined:
        return "not_determined"
      @unknown default:
        return "not_determined"
      }
    }

    View(ExpoPoseCameraView.self) {
      Prop("isActive") { (view: ExpoPoseCameraView, isActive: Bool) in
        view.setActive(isActive)
      }

      Prop("cameraPosition") { (view: ExpoPoseCameraView, position: String) in
        view.setCameraPosition(position)
      }

      Events("onPoseDetected")
    }
  }
}
