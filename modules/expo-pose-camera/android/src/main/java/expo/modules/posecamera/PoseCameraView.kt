package expo.modules.posecamera

import android.os.SystemClock
import android.util.Size
import androidx.annotation.OptIn
import androidx.camera.core.CameraSelector
import androidx.camera.core.ExperimentalGetImage
import androidx.camera.core.ImageAnalysis
import androidx.camera.core.ImageProxy
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
import java.util.concurrent.ExecutorService
import java.util.concurrent.Executors
import kotlin.math.min

private const val CONFIDENCE_THRESHOLD = 0.3f
private const val TARGET_FPS = 20
private const val FRAME_INTERVAL_MS = (1000f / TARGET_FPS).toLong()

class PoseCameraView(context: android.content.Context, appContext: AppContext) :
    ExpoView(context, appContext) {

    private val previewView = PreviewView(context)
    private var cameraProvider: ProcessCameraProvider? = null
    private var isSessionActive = false
    private var lastFrameTimestampMs = 0L
    private val analysisExecutor: ExecutorService = Executors.newSingleThreadExecutor()

    private val onPoseDetected by EventDispatcher()

    private val poseDetector: PoseDetector by lazy {
        val options = AccuratePoseDetectorOptions.Builder()
            .setDetectorMode(AccuratePoseDetectorOptions.STREAM_MODE)
            .build()
        PoseDetection.getClient(options)
    }

    // Track limb joints for drawing.
    private val landmarkTypeToJoint = mapOf(
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

    private fun appendSyntheticMidpointJoint(
        landmarks: MutableList<Map<String, Any>>,
        jointName: String,
        first: PoseLandmark?,
        second: PoseLandmark?,
        imageWidth: Float,
        imageHeight: Float
    ) {
        if (first == null || second == null) {
            return
        }

        val confidence = min(first.inFrameLikelihood, second.inFrameLikelihood)
        if (confidence <= CONFIDENCE_THRESHOLD) {
            return
        }

        val midX = (first.position.x + second.position.x) / 2f
        val midY = (first.position.y + second.position.y) / 2f

        landmarks.add(
            mapOf(
                "joint" to jointName,
                "x" to (midX / imageWidth).toDouble(),
                "y" to (midY / imageHeight).toDouble(),
                "confidence" to confidence.toDouble(),
            )
        )
    }

    init {
        previewView.layoutParams = LayoutParams(
            LayoutParams.MATCH_PARENT,
            LayoutParams.MATCH_PARENT
        )
        previewView.implementationMode = PreviewView.ImplementationMode.PERFORMANCE
        addView(previewView)
    }

    fun setActive(active: Boolean) {
        if (active && !isSessionActive) {
            startCamera()
        } else if (!active && isSessionActive) {
            stopCamera()
        }
    }

    @OptIn(ExperimentalGetImage::class)
    private fun startCamera() {
        val cameraProviderFuture = ProcessCameraProvider.getInstance(context)

        cameraProviderFuture.addListener({
            val provider = cameraProviderFuture.get()
            cameraProvider = provider

            val preview = Preview.Builder().build().also {
                it.surfaceProvider = previewView.surfaceProvider
            }

            val imageAnalysis = ImageAnalysis.Builder()
                .setTargetResolution(Size(720, 1280))
                .setBackpressureStrategy(ImageAnalysis.STRATEGY_KEEP_ONLY_LATEST)
                .build()

            imageAnalysis.setAnalyzer(
                analysisExecutor
            ) { imageProxy ->
                processFrame(imageProxy)
            }

            val cameraSelector = CameraSelector.DEFAULT_BACK_CAMERA

            provider.unbindAll()

            val lifecycleOwner =
                (context as? LifecycleOwner) ?: (appContext.currentActivity as? LifecycleOwner)
            if (lifecycleOwner != null) {
                provider.bindToLifecycle(
                    lifecycleOwner,
                    cameraSelector,
                    preview,
                    imageAnalysis
                )
                isSessionActive = true
            }
        }, ContextCompat.getMainExecutor(context))
    }

    private fun stopCamera() {
        cameraProvider?.unbindAll()
        isSessionActive = false
    }

    @ExperimentalGetImage
    private fun processFrame(imageProxy: ImageProxy) {
        // Throttle to target FPS using elapsed time, independent of camera FPS.
        val now = SystemClock.elapsedRealtime()
        if (now - lastFrameTimestampMs < FRAME_INTERVAL_MS) {
            imageProxy.close()
            return
        }
        lastFrameTimestampMs = now

        val mediaImage = imageProxy.image
        if (mediaImage == null) {
            imageProxy.close()
            return
        }

        val inputImage = InputImage.fromMediaImage(
            mediaImage,
            imageProxy.imageInfo.rotationDegrees
        )

        poseDetector.process(inputImage)
            .addOnSuccessListener { pose ->
                val landmarks = mutableListOf<Map<String, Any>>()
                val imageWidth = inputImage.width.toFloat()
                val imageHeight = inputImage.height.toFloat()

                for ((type, jointName) in landmarkTypeToJoint) {
                    val landmark = pose.getPoseLandmark(type) ?: continue
                    val confidence = landmark.inFrameLikelihood
                    if (confidence <= CONFIDENCE_THRESHOLD) continue

                    landmarks.add(
                        mapOf(
                            "joint" to jointName,
                            "x" to (landmark.position.x / imageWidth).toDouble(),
                            "y" to (landmark.position.y / imageHeight).toDouble(),
                            "confidence" to confidence.toDouble(),
                        )
                    )
                }

                // Analysis-only torso points for posture quality checks.
                appendSyntheticMidpointJoint(
                    landmarks = landmarks,
                    jointName = "neck",
                    first = pose.getPoseLandmark(PoseLandmark.LEFT_SHOULDER),
                    second = pose.getPoseLandmark(PoseLandmark.RIGHT_SHOULDER),
                    imageWidth = imageWidth,
                    imageHeight = imageHeight
                )
                appendSyntheticMidpointJoint(
                    landmarks = landmarks,
                    jointName = "root",
                    first = pose.getPoseLandmark(PoseLandmark.LEFT_HIP),
                    second = pose.getPoseLandmark(PoseLandmark.RIGHT_HIP),
                    imageWidth = imageWidth,
                    imageHeight = imageHeight
                )

                onPoseDetected(mapOf("landmarks" to landmarks))
            }
            .addOnCompleteListener {
                imageProxy.close()
            }
    }

    override fun onDetachedFromWindow() {
        super.onDetachedFromWindow()
        stopCamera()
        analysisExecutor.shutdown()
        poseDetector.close()
    }
}
