package expo.modules.posecamera

import android.Manifest
import android.content.pm.PackageManager
import androidx.core.content.ContextCompat
import expo.modules.kotlin.Promise
import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition

class ExpoPoseCameraModule : Module() {
  override fun definition() = ModuleDefinition {
    Name("ExpoPoseCamera")

    AsyncFunction("requestCameraPermission") { promise: Promise ->
      val context = appContext.reactContext ?: run {
        promise.resolve(false)
        return@AsyncFunction
      }
      val status = ContextCompat.checkSelfPermission(context, Manifest.permission.CAMERA)
      if (status == PackageManager.PERMISSION_GRANTED) {
        promise.resolve(true)
      } else {
        // Permission must be requested through Expo's permission system or the OS dialog
        promise.resolve(false)
      }
    }

    Function("getCameraPermissionStatus") {
      val context = appContext.reactContext ?: return@Function "not_determined"
      val status = ContextCompat.checkSelfPermission(context, Manifest.permission.CAMERA)
      if (status == PackageManager.PERMISSION_GRANTED) "granted" else "denied"
    }

    View(ExpoPoseCameraView::class) {
      Prop("isActive") { view: ExpoPoseCameraView, isActive: Boolean ->
        view.setActive(isActive)
      }

      Prop("cameraPosition") { view: ExpoPoseCameraView, position: String ->
        view.setCameraPosition(position)
      }

      Events("onPoseDetected")
    }
  }
}
