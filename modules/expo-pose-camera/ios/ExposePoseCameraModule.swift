import ExpoModulesCore

public class ExposePoseCameraModule: Module {
    public func definition() -> ModuleDefinition {
        Name("ExposePoseCamera")

        View(PoseCameraView.self) {
            Events("onPoseDetected")

            Prop("isActive") { (view: PoseCameraView, isActive: Bool) in
                view.setActive(isActive)
            }
        }
    }
}
