import ExpoModulesCore
import AVFoundation
import Vision

class ExpoPoseCameraView: ExpoView {
  private let onPoseDetected = EventDispatcher()

  private let captureSession = AVCaptureSession()
  private var previewLayer: AVCaptureVideoPreviewLayer?
  private let videoOutput = AVCaptureVideoDataOutput()
  private let processingQueue = DispatchQueue(label: "pose.processing", qos: .userInitiated)

  private var isActive = false
  private var isSessionConfigured = false
  private var frameCounter = 0
  // Throttle: process every 3rd frame at 60 FPS ≈ 20 FPS pose detection
  private let frameSkip = 3

  private var currentPosition: AVCaptureDevice.Position = .back

  // MARK: - Joint Mapping

  private static let jointMapping: [(VNHumanBodyPoseObservation.JointName, String)] = [
    (.nose, "nose"),
    (.leftEye, "leftEye"),
    (.rightEye, "rightEye"),
    (.leftEar, "leftEar"),
    (.rightEar, "rightEar"),
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

  // MARK: - Init

  required init(appContext: AppContext? = nil) {
    super.init(appContext: appContext)
    clipsToBounds = true
    setupPreviewLayer()
  }

  // MARK: - Layout

  override func layoutSubviews() {
    super.layoutSubviews()
    previewLayer?.frame = bounds
  }

  // MARK: - Public API

  func setActive(_ active: Bool) {
    isActive = active
    if active {
      startSession()
    } else {
      stopSession()
    }
  }

  func setCameraPosition(_ position: String) {
    let newPosition: AVCaptureDevice.Position = position == "front" ? .front : .back
    guard newPosition != currentPosition else { return }
    currentPosition = newPosition

    if isSessionConfigured {
      reconfigureCamera()
    }
  }

  // MARK: - Preview Layer

  private func setupPreviewLayer() {
    let layer = AVCaptureVideoPreviewLayer(session: captureSession)
    layer.videoGravity = .resizeAspectFill
    self.layer.addSublayer(layer)
    previewLayer = layer
  }

  // MARK: - Session Configuration

  private func configureSession() {
    guard !isSessionConfigured else { return }

    captureSession.beginConfiguration()
    captureSession.sessionPreset = .high

    // Camera input
    guard let camera = AVCaptureDevice.default(.builtInWideAngleCamera, for: .video, position: currentPosition),
          let input = try? AVCaptureDeviceInput(device: camera),
          captureSession.canAddInput(input) else {
      captureSession.commitConfiguration()
      return
    }
    captureSession.addInput(input)

    // Video output
    videoOutput.alwaysDiscardsLateVideoFrames = true
    videoOutput.setSampleBufferDelegate(self, queue: processingQueue)
    if captureSession.canAddOutput(videoOutput) {
      captureSession.addOutput(videoOutput)
    }

    // Lock to portrait orientation
    setVideoOrientationPortrait(videoOutput.connection(with: .video))

    captureSession.commitConfiguration()
    isSessionConfigured = true
  }

  private func reconfigureCamera() {
    captureSession.beginConfiguration()

    // Remove existing inputs
    for input in captureSession.inputs {
      captureSession.removeInput(input)
    }

    // Add new camera
    guard let camera = AVCaptureDevice.default(.builtInWideAngleCamera, for: .video, position: currentPosition),
          let input = try? AVCaptureDeviceInput(device: camera),
          captureSession.canAddInput(input) else {
      captureSession.commitConfiguration()
      return
    }
    captureSession.addInput(input)

    setVideoOrientationPortrait(videoOutput.connection(with: .video))

    captureSession.commitConfiguration()
  }

  private func setVideoOrientationPortrait(_ connection: AVCaptureConnection?) {
    guard let connection else { return }
    if #available(iOS 17.0, *) {
      connection.videoRotationAngle = 90
    } else {
      connection.videoOrientation = .portrait
    }
  }

  // MARK: - Session Lifecycle

  private func startSession() {
    processingQueue.async { [weak self] in
      guard let self else { return }
      configureSession()
      if !captureSession.isRunning {
        captureSession.startRunning()
      }
    }
  }

  private func stopSession() {
    processingQueue.async { [weak self] in
      guard let self else { return }
      if captureSession.isRunning {
        captureSession.stopRunning()
      }
    }
  }

  // MARK: - Pose Extraction

  private func extractLandmarks(from observation: VNHumanBodyPoseObservation) -> [[String: Any]] {
    var landmarks: [[String: Any]] = []
    let isFront = currentPosition == .front

    for (visionJoint, jointName) in Self.jointMapping {
      guard let point = try? observation.recognizedPoint(visionJoint),
            point.confidence > 0.3 else {
        continue
      }

      // Vision uses bottom-left origin — flip Y
      // Mirror X for front camera so skeleton matches the preview
      let x = isFront ? Double(1.0 - point.location.x) : Double(point.location.x)
      landmarks.append([
        "joint": jointName,
        "x": x,
        "y": Double(1.0 - point.location.y),
        "confidence": Double(point.confidence),
      ])
    }

    return landmarks
  }
}

// MARK: - AVCaptureVideoDataOutputSampleBufferDelegate

extension ExpoPoseCameraView: AVCaptureVideoDataOutputSampleBufferDelegate {
  func captureOutput(
    _ output: AVCaptureOutput,
    didOutput sampleBuffer: CMSampleBuffer,
    from connection: AVCaptureConnection
  ) {
    // Throttle to ~20 FPS
    frameCounter += 1
    guard frameCounter % frameSkip == 0 else { return }

    guard let pixelBuffer = CMSampleBufferGetImageBuffer(sampleBuffer) else { return }

    let request = VNDetectHumanBodyPoseRequest()
    let handler = VNImageRequestHandler(cvPixelBuffer: pixelBuffer, options: [:])

    do {
      try handler.perform([request])
    } catch {
      return
    }

    guard let observations = request.results, !observations.isEmpty else {
      // No body detected — send empty array
      DispatchQueue.main.async { [weak self] in
        self?.onPoseDetected(["landmarks": []])
      }
      return
    }

    // Pick highest-confidence body
    let bestObservation: VNHumanBodyPoseObservation
    if observations.count == 1 {
      bestObservation = observations[0]
    } else {
      bestObservation = observations.max(by: { a, b in
        let aSum = (try? a.recognizedPoints(.all))?.values.reduce(0.0) { $0 + Float($1.confidence) } ?? 0
        let bSum = (try? b.recognizedPoints(.all))?.values.reduce(0.0) { $0 + Float($1.confidence) } ?? 0
        return aSum < bSum
      }) ?? observations[0]
    }

    let landmarks = extractLandmarks(from: bestObservation)

    DispatchQueue.main.async { [weak self] in
      self?.onPoseDetected(["landmarks": landmarks])
    }
  }
}
