package expo.modules.posecamera

import android.annotation.SuppressLint
import android.content.Context
import android.util.Size
import androidx.camera.core.CameraSelector
import androidx.camera.core.ImageAnalysis
import androidx.camera.core.Preview
import androidx.camera.lifecycle.ProcessCameraProvider
import androidx.camera.view.PreviewView
import androidx.core.content.ContextCompat
import androidx.lifecycle.LifecycleOwner
import com.google.mlkit.vision.common.InputImage
import com.google.mlkit.vision.pose.PoseDetection
import com.google.mlkit.vision.pose.PoseDetector
import com.google.mlkit.vision.pose.PoseLandmark
import com.google.mlkit.vision.pose.accurate.AccuratePoseDetectorOptions
import expo.modules.kotlin.AppContext
import expo.modules.kotlin.viewevent.EventDispatcher
import expo.modules.kotlin.views.ExpoView

class ExpoPoseCameraView(context: Context, appContext: AppContext) : ExpoView(context, appContext) {

  private val onPoseDetected by EventDispatcher()

  private val previewView = PreviewView(context).apply {
    layoutParams = LayoutParams(LayoutParams.MATCH_PARENT, LayoutParams.MATCH_PARENT)
    implementationMode = PreviewView.ImplementationMode.PERFORMANCE
  }

  private var cameraProvider: ProcessCameraProvider? = null
  private var isActive = false
  private var isBound = false
  private var cameraPosition = CameraSelector.DEFAULT_BACK_CAMERA
  private var frameCounter = 0
  private val frameSkip = 3

  private val poseDetector: PoseDetector by lazy {
    val options = AccuratePoseDetectorOptions.Builder()
      .setDetectorMode(AccuratePoseDetectorOptions.STREAM_MODE)
      .build()
    PoseDetection.getClient(options)
  }

  // Map ML Kit landmark types to unified joint names
  private val landmarkMapping = mapOf(
    PoseLandmark.NOSE to "nose",
    PoseLandmark.LEFT_EYE to "leftEye",
    PoseLandmark.RIGHT_EYE to "rightEye",
    PoseLandmark.LEFT_EAR to "leftEar",
    PoseLandmark.RIGHT_EAR to "rightEar",
    PoseLandmark.LEFT_SHOULDER to "leftShoulder",
    PoseLandmark.RIGHT_SHOULDER to "rightShoulder",
    PoseLandmark.LEFT_ELBOW to "leftElbow",
    PoseLandmark.RIGHT_ELBOW to "rightElbow",
    PoseLandmark.LEFT_WRIST to "leftWrist",
    PoseLandmark.RIGHT_WRIST to "rightWrist",
    PoseLandmark.LEFT_HIP to "leftHip",
    PoseLandmark.RIGHT_HIP to "rightHip",
    PoseLandmark.LEFT_KNEE to "leftKnee",
    PoseLandmark.RIGHT_KNEE to "rightKnee",
    PoseLandmark.LEFT_ANKLE to "leftAnkle",
    PoseLandmark.RIGHT_ANKLE to "rightAnkle",
  )

  init {
    addView(previewView)
  }

  fun setActive(active: Boolean) {
    isActive = active
    if (active) {
      startCamera()
    } else {
      stopCamera()
    }
  }

  fun setCameraPosition(position: String) {
    cameraPosition = if (position == "front") {
      CameraSelector.DEFAULT_FRONT_CAMERA
    } else {
      CameraSelector.DEFAULT_BACK_CAMERA
    }
    if (isBound) {
      rebindCamera()
    }
  }

  private fun startCamera() {
    val cameraProviderFuture = ProcessCameraProvider.getInstance(context)
    cameraProviderFuture.addListener({
      cameraProvider = cameraProviderFuture.get()
      bindCameraUseCases()
    }, ContextCompat.getMainExecutor(context))
  }

  private fun stopCamera() {
    cameraProvider?.unbindAll()
    isBound = false
  }

  private fun rebindCamera() {
    cameraProvider?.unbindAll()
    isBound = false
    bindCameraUseCases()
  }

  @SuppressLint("UnsafeOptInUsageError")
  private fun bindCameraUseCases() {
    val provider = cameraProvider ?: return
    val lifecycleOwner = findLifecycleOwner() ?: return

    val preview = Preview.Builder()
      .build()
      .also { it.surfaceProvider = previewView.surfaceProvider }

    val imageAnalysis = ImageAnalysis.Builder()
      .setTargetResolution(Size(640, 480))
      .setBackpressureStrategy(ImageAnalysis.STRATEGY_KEEP_ONLY_LATEST)
      .build()

    imageAnalysis.setAnalyzer(ContextCompat.getMainExecutor(context)) { imageProxy ->
      frameCounter++
      if (frameCounter % frameSkip != 0) {
        imageProxy.close()
        return@setAnalyzer
      }

      val mediaImage = imageProxy.image
      if (mediaImage == null) {
        imageProxy.close()
        return@setAnalyzer
      }

      val inputImage = InputImage.fromMediaImage(mediaImage, imageProxy.imageInfo.rotationDegrees)
      val imageWidth = inputImage.width.toFloat()
      val imageHeight = inputImage.height.toFloat()

      poseDetector.process(inputImage)
        .addOnSuccessListener { pose ->
          val allLandmarks = pose.allPoseLandmarks
          if (allLandmarks.isEmpty()) {
            onPoseDetected(mapOf("landmarks" to emptyList<Map<String, Any>>()))
            imageProxy.close()
            return@addOnSuccessListener
          }

          val landmarks = mutableListOf<Map<String, Any>>()
          val landmarkByType = mutableMapOf<Int, PoseLandmark>()
          val isFront = cameraPosition == CameraSelector.DEFAULT_FRONT_CAMERA

          for (landmark in allLandmarks) {
            landmarkByType[landmark.landmarkType] = landmark
            val jointName = landmarkMapping[landmark.landmarkType] ?: continue
            if (landmark.inFrameLikelihood <= 0.3f) continue

            // Mirror X for front camera so skeleton matches the preview
            val normalizedX = (landmark.position.x / imageWidth).toDouble()
            val x = if (isFront) 1.0 - normalizedX else normalizedX
            landmarks.add(mapOf(
              "joint" to jointName,
              "x" to x,
              "y" to (landmark.position.y / imageHeight).toDouble(),
              "confidence" to landmark.inFrameLikelihood.toDouble(),
            ))
          }

          // Synthesize "neck" (midpoint of shoulders) and "root" (midpoint of hips)
          // since ML Kit doesn't provide these directly
          synthesizeMidpoint(
            landmarkByType[PoseLandmark.LEFT_SHOULDER],
            landmarkByType[PoseLandmark.RIGHT_SHOULDER],
            "neck", imageWidth, imageHeight, isFront, landmarks
          )
          synthesizeMidpoint(
            landmarkByType[PoseLandmark.LEFT_HIP],
            landmarkByType[PoseLandmark.RIGHT_HIP],
            "root", imageWidth, imageHeight, isFront, landmarks
          )

          onPoseDetected(mapOf("landmarks" to landmarks))
          imageProxy.close()
        }
        .addOnFailureListener {
          imageProxy.close()
        }
    }

    try {
      provider.unbindAll()
      provider.bindToLifecycle(lifecycleOwner, cameraPosition, preview, imageAnalysis)
      isBound = true
    } catch (_: Exception) {
      // Camera binding can fail if lifecycle is not ready
    }
  }

  private fun synthesizeMidpoint(
    a: PoseLandmark?,
    b: PoseLandmark?,
    jointName: String,
    imageWidth: Float,
    imageHeight: Float,
    isFront: Boolean,
    landmarks: MutableList<Map<String, Any>>
  ) {
    if (a == null || b == null) return
    val confidence = minOf(a.inFrameLikelihood, b.inFrameLikelihood)
    if (confidence <= 0.3f) return
    val normalizedX = (((a.position.x + b.position.x) / 2f) / imageWidth).toDouble()
    val x = if (isFront) 1.0 - normalizedX else normalizedX
    landmarks.add(mapOf(
      "joint" to jointName,
      "x" to x,
      "y" to (((a.position.y + b.position.y) / 2f) / imageHeight).toDouble(),
      "confidence" to confidence.toDouble(),
    ))
  }

  private fun findLifecycleOwner(): LifecycleOwner? {
    var ctx = context
    while (ctx is android.content.ContextWrapper) {
      if (ctx is LifecycleOwner) return ctx
      ctx = ctx.baseContext
    }
    return null
  }
}
