import AVFoundation
import ExpoModulesCore
import QuartzCore
import UIKit
import Vision

private enum Constants {
    static let confidenceThreshold: Float = 0.3
    static let targetFPS = 20
    static let minFrameInterval = 1.0 / Double(targetFPS)
}

// Track limb joints for drawing plus torso points for posture analysis.
private let allJointNames: [(VNHumanBodyPoseObservation.JointName, String)] = [
    (.neck, "neck"),
    (.leftShoulder, "leftShoulder"),
    (.rightShoulder, "rightShoulder"),
    (.leftElbow, "leftElbow"),
    (.rightElbow, "rightElbow"),
    (.leftWrist, "leftWrist"),
    (.rightWrist, "rightWrist"),
    (.root, "root"),
    (.leftHip, "leftHip"),
    (.rightHip, "rightHip"),
    (.leftKnee, "leftKnee"),
    (.rightKnee, "rightKnee"),
    (.leftAnkle, "leftAnkle"),
    (.rightAnkle, "rightAnkle"),
]

class PoseCameraView: ExpoView {
    private let captureSession = AVCaptureSession()
    private let previewLayer = AVCaptureVideoPreviewLayer()
    private let videoOutput = AVCaptureVideoDataOutput()
    private let processingQueue = DispatchQueue(label: "pose.processing", qos: .userInteractive)
    private let poseRequest = VNDetectHumanBodyPoseRequest()

    private var lastProcessedFrameTime: CFTimeInterval = 0
    private var isSessionConfigured = false

    let onPoseDetected = EventDispatcher()

    // MARK: - Lifecycle

    required init(appContext: AppContext? = nil) {
        super.init(appContext: appContext)
        setupPreviewLayer()
    }

    required init?(coder: NSCoder) {
        fatalError("init(coder:) has not been implemented")
    }

    override func layoutSubviews() {
        super.layoutSubviews()
        previewLayer.frame = bounds
    }

    // MARK: - Public

    func setActive(_ active: Bool) {
        if active {
            startSession()
        } else {
            stopSession()
        }
    }

    // MARK: - Camera Setup

    private func setupPreviewLayer() {
        previewLayer.session = captureSession
        previewLayer.videoGravity = .resizeAspectFill
        layer.addSublayer(previewLayer)
    }

    private func configureSession() {
        guard !isSessionConfigured else { return }

        captureSession.beginConfiguration()
        captureSession.sessionPreset = .high

        guard
            let camera = AVCaptureDevice.default(.builtInWideAngleCamera, for: .video, position: .back),
            let input = try? AVCaptureDeviceInput(device: camera),
            captureSession.canAddInput(input)
        else {
            captureSession.commitConfiguration()
            return
        }

        captureSession.addInput(input)

        videoOutput.alwaysDiscardsLateVideoFrames = true
        videoOutput.setSampleBufferDelegate(self, queue: processingQueue)

        guard captureSession.canAddOutput(videoOutput) else {
            captureSession.commitConfiguration()
            return
        }

        captureSession.addOutput(videoOutput)

        // Lock to portrait
        if let connection = videoOutput.connection(with: .video) {
            if #available(iOS 17.0, *) {
                connection.videoRotationAngle = 90
            } else {
                connection.videoOrientation = .portrait
            }
        }

        captureSession.commitConfiguration()
        isSessionConfigured = true
    }

    private func startSession() {
        configureSession()
        guard isSessionConfigured, !captureSession.isRunning else { return }
        processingQueue.async { [weak self] in
            self?.captureSession.startRunning()
        }
    }

    private func stopSession() {
        guard captureSession.isRunning else { return }
        processingQueue.async { [weak self] in
            self?.captureSession.stopRunning()
        }
    }
}

// MARK: - AVCaptureVideoDataOutputSampleBufferDelegate

extension PoseCameraView: AVCaptureVideoDataOutputSampleBufferDelegate {
    func captureOutput(
        _ output: AVCaptureOutput,
        didOutput sampleBuffer: CMSampleBuffer,
        from connection: AVCaptureConnection
    ) {
        // Throttle to target FPS using elapsed time, independent of camera FPS.
        let now = CACurrentMediaTime()
        guard now - lastProcessedFrameTime >= Constants.minFrameInterval else { return }
        lastProcessedFrameTime = now

        guard let pixelBuffer = CMSampleBufferGetImageBuffer(sampleBuffer) else { return }

        let handler = VNImageRequestHandler(cvPixelBuffer: pixelBuffer, orientation: .up, options: [:])

        do {
            try handler.perform([poseRequest])
        } catch {
            return
        }

        guard let observations = poseRequest.results, !observations.isEmpty else {
            onPoseDetected(["landmarks": []])
            return
        }

        // Pick the body with the highest sum of confidence scores
        let bestObservation = observations.max { lhs, rhs in
            confidenceSum(lhs) < confidenceSum(rhs)
        }

        guard let observation = bestObservation else {
            onPoseDetected(["landmarks": []])
            return
        }

        let landmarks = extractLandmarks(from: observation)
        onPoseDetected(["landmarks": landmarks])
    }

    // MARK: - Pose Processing

    private func confidenceSum(_ observation: VNHumanBodyPoseObservation) -> Float {
        var sum: Float = 0
        for (jointName, _) in allJointNames {
            if let point = try? observation.recognizedPoint(jointName) {
                sum += point.confidence
            }
        }
        return sum
    }

    private func extractLandmarks(from observation: VNHumanBodyPoseObservation) -> [[String: Any]] {
        var landmarks: [[String: Any]] = []

        for (jointName, name) in allJointNames {
            guard let point = try? observation.recognizedPoint(jointName) else { continue }
            guard point.confidence > Constants.confidenceThreshold else { continue }

            // Vision uses bottom-left origin — flip Y for screen coordinates
            landmarks.append([
                "joint": name,
                "x": Double(point.location.x),
                "y": Double(1.0 - point.location.y),
                "confidence": Double(point.confidence),
            ])
        }

        return landmarks
    }
}
