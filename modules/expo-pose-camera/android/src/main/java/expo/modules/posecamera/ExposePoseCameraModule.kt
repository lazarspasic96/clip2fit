package expo.modules.posecamera

import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition

class ExposePoseCameraModule : Module() {
    override fun definition() = ModuleDefinition {
        Name("ExposePoseCamera")

        View(PoseCameraView::class) {
            Events("onPoseDetected")

            Prop("isActive") { view: PoseCameraView, isActive: Boolean ->
                view.setActive(isActive)
            }
        }
    }
}
