package expo.modules.shazamkit

import android.Manifest
import android.content.pm.PackageManager
import android.media.*
import android.os.Build
import android.util.Log
import androidx.annotation.RequiresApi
import androidx.annotation.RequiresPermission
import androidx.core.app.ActivityCompat
import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition
import expo.modules.kotlin.Promise
import com.shazam.shazamkit.*
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch
import java.util.Arrays

class ShazamKitModule : Module() {

    companion object {
        private const val TAG = "ShazamKitModule"
        private const val CHANNEL_CONFIG = AudioFormat.CHANNEL_IN_MONO
        private const val AUDIO_FORMAT = AudioFormat.ENCODING_PCM_16BIT
        private const val MIN_RECORDING_DURATION_MS = 10000L // 10 seconds minimum
    }

    private var audioRecord: AudioRecord? = null
    private var isRecording = false
    private var recordingThread: Thread? = null
    private var currentSession: StreamingSession? = null
    private var catalog: Catalog? = null
    private val coroutineScope: CoroutineScope = CoroutineScope(Dispatchers.Main)
    private var matchPromise: Promise? = null
    private var recordingStartTime: Long = 0L
    private var hasFoundResult = false
    private var isShazamKitAvailable = false


    // Each module class must implement the definition function. The definition consists of components
    // that describes the module's functionality and behavior.
    // See https://docs.expo.dev/modules/module-api for more details about available components.
    override fun definition() = ModuleDefinition {
        // Sets the name of the module that JavaScript code will use to refer to the module. Takes a string as an argument.
        // Can be inferred from module's class name, but it's recommended to set it explicitly for clarity.
        // The module will be accessible from `requireNativeModule('ShazamKitModule')` in JavaScript.
        Name("ExpoShazamKit")

        // Defines event names that the module can send to JavaScript.
        Events("onMatchFound", "onNoMatch", "onError", "onChange")

        // Defines a JavaScript synchronous function that runs the native code on the JavaScript thread.
        Function("hello") {
            "Hello from Android ExpoShazamKit module! 🎵"
        }

        // Function that accepts a name parameter and returns a personalized greeting
        Function("helloWithName") { name: String ->
            "Hello $name from Android ExpoShazamKit module! 🎵"
        }

        Function("isAvailable") {
            Log.d(TAG, "isAvailable() function called from JavaScript")
            Log.d(TAG, "isShazamKitAvailable after reflection: $isShazamKitAvailable")
            true
        }


        // Main function to start audio recognition
        AsyncFunction("startListening") { developerToken: String, promise: Promise ->
            initializeShazamKit(developerToken) // Initialize session with token

            matchPromise = promise
            recordingStartTime = System.currentTimeMillis() // Track when recording started
            hasFoundResult = false // Reset result flag

            try {
                val audioSource = MediaRecorder.AudioSource.MIC
                val audioFormat = AudioFormat.Builder().setChannelMask(AudioFormat.CHANNEL_IN_MONO)
                    .setEncoding(AudioFormat.ENCODING_PCM_16BIT).setSampleRate(44100).build()

                if (ActivityCompat.checkSelfPermission(
                        appContext.reactContext ?: return@AsyncFunction,
                        Manifest.permission.RECORD_AUDIO
                    ) != PackageManager.PERMISSION_GRANTED
                ) {
                    promise.reject("PERMISSION_DENIED", "Audio recording permission not granted", null)
                    return@AsyncFunction
                }

                audioRecord =
                    AudioRecord.Builder().setAudioSource(audioSource).setAudioFormat(audioFormat)
                        .build()
                val bufferSize = AudioRecord.getMinBufferSize(
                    44100,
                    AudioFormat.CHANNEL_IN_MONO,
                    AudioFormat.ENCODING_PCM_16BIT
                )
                audioRecord?.startRecording()
                isRecording = true

                // Schedule a fallback timer to ensure recording stops after minimum duration
                scheduleFallbackStop(promise)

                recordingThread = Thread({
                    val readBuffer = ByteArray(bufferSize)
                    Log.d(TAG, "Starting audio recording for minimum ${MIN_RECORDING_DURATION_MS}ms")
                    while (isRecording) {
                        val actualRead = audioRecord!!.read(readBuffer, 0, bufferSize)
                        currentSession?.matchStream(readBuffer, actualRead, System.currentTimeMillis())
                    }
                }, "AudioRecorder Thread")
                recordingThread!!.start()
            } catch (e: Exception) {
                e.message?.let {
                    onError(it)
                    promise.reject("HANDLE_ERROR", it, e)
                }
            }
        }

        // Function to stop audio recognition
        AsyncFunction("stopListening") { promise: Promise ->
            if (!isRecording) {
                promise.resolve(null)
                return@AsyncFunction
            }
            try {
                isRecording = false
                audioRecord?.apply {
                    stop()
                    release()
                }
                audioRecord = null
                recordingThread?.join()
                recordingThread = null
                promise.resolve(null)
            } catch (e: Exception) {
                promise.reject("STOP_ERROR", "Error stopping recording: ${e.message}", e)
            }
        }

        // Legacy function for compatibility
        AsyncFunction("setValueAsync") { value: String ->
            sendEvent("onChange", mapOf("value" to value))
        }
    }

    private fun initializeShazamKit(developerToken: String) {
        Log.d(TAG, "Initializing ShazamKit")
        try {
            coroutineScope.launch {
                val tokenProvider = object : DeveloperTokenProvider {
                    override fun provideDeveloperToken(): DeveloperToken {
                        return DeveloperToken(developerToken)
                    }
                }
                catalog = ShazamKit.createShazamCatalog(tokenProvider)
                catalog?.let {
                    when (val result = ShazamKit.createStreamingSession(
                        it,
                        AudioSampleRateInHz.SAMPLE_RATE_44100,
                        8192
                    )) {
                        is ShazamKitResult.Success -> {
                            Log.e(TAG, "ShazamKitResult.Success")
                            currentSession = result.data
                            isShazamKitAvailable = true
                            Log.e(TAG, "$currentSession")
                            currentSession?.recognitionResults()?.collect { matchResult ->
                                Log.d(TAG, "matchResult: $matchResult")
                                matchPromise?.let {
                                    handleMatchResult(matchResult, it)
                                } ?: Log.e(TAG, "matchPromise is null")
                            } ?: Log.e(TAG, "currentSession is null")
                        }
                        is ShazamKitResult.Failure -> {
                            Log.e(TAG, "ShazamKitResult.Failure")
                            result.reason.message?.let {
                                onError(it)
                            }
                        }
                    }
                } ?: Log.e(TAG, "Catalog is null")
            }
        } catch (e: Exception) {
            Log.e(TAG, "Error initializing ShazamKit: ${e.message}")
        }
    }

    private fun handleMatchResult(result: MatchResult, promise: Promise) {
        Log.d(TAG, "handleMatchResult: $result")

        val currentTime = System.currentTimeMillis()
        val recordingDuration = currentTime - recordingStartTime

        Log.d(TAG, "Recording duration: ${recordingDuration}ms, Min duration: ${MIN_RECORDING_DURATION_MS}ms")

        try {
            when (result) {
                is MatchResult.Match -> {
                    val matchData = result.toString()
                    Log.d(TAG, "Match found: $matchData")

                    // Send event to JavaScript
                    sendEvent("onMatchFound", mapOf(
                        "match" to matchData,
                        "timestamp" to currentTime
                    ))

                    hasFoundResult = true

                    // Check if minimum recording time has passed
                    if (recordingDuration >= MIN_RECORDING_DURATION_MS) {
                        Log.d(TAG, "Minimum recording time reached, resolving promise")
                        promise.resolve(matchData)
                        stopRecognitionInternal()
                    } else {
                        Log.d(TAG, "Match found but continuing recording for minimum duration")
                        // Schedule stopping after minimum duration
                        scheduleStopAfterMinimumDuration(promise, matchData)
                    }
                }
                is MatchResult.NoMatch -> {
                    Log.d(TAG, "No match found")

                    // Send event to JavaScript
                    sendEvent("onNoMatch", mapOf(
                        "message" to "No match found",
                        "timestamp" to currentTime
                    ))

                    // Only reject if minimum recording time has passed
                    if (recordingDuration >= MIN_RECORDING_DURATION_MS) {
                        Log.d(TAG, "Minimum recording time reached, no match found")
                        promise.reject("NO_MATCH", "No match found", null)
                        stopRecognitionInternal()
                    } else {
                        Log.d(TAG, "No match yet, continuing recording for minimum duration")
                        // Continue recording, don't reject yet
                    }
                }
                is MatchResult.Error -> {
                    val errorMessage = result.exception.message ?: "Unknown error"
                    Log.e(TAG, "ShazamKit Error: $errorMessage")

                    // Handle specific ShazamKit errors with more user-friendly messages
                    val userFriendlyMessage = when {
                        errorMessage.contains("MATCH_ATTEMPT_FAILED") -> {
                            "Unable to identify the audio. Please ensure you're playing clear music and try again."
                        }
                        errorMessage.contains("NETWORK") -> {
                            "Network error occurred. Please check your internet connection and try again."
                        }
                        errorMessage.contains("TIMEOUT") -> {
                            "Recognition timed out. Please try again with clearer audio."
                        }
                        errorMessage.contains("INVALID_TOKEN") -> {
                            "Invalid developer token. Please check your ShazamKit credentials."
                        }
                        else -> "Recognition failed: $errorMessage"
                    }

                    Log.e(TAG, "User-friendly error: $userFriendlyMessage")

                    // Send event to JavaScript
                    sendEvent("onError", mapOf(
                        "error" to userFriendlyMessage,
                        "originalError" to errorMessage,
                        "timestamp" to currentTime
                    ))

                    // For errors, stop immediately regardless of duration
                    promise.reject("MATCH_ERROR", userFriendlyMessage, result.exception)
                    stopRecognitionInternal()
                }
            }
        } catch (e: Exception) {
            val errorMessage = e.message ?: "Unexpected error occurred"
            Log.e(TAG, "Exception in handleMatchResult: $errorMessage", e)
            onError(errorMessage)
            promise.reject("HANDLE_ERROR", errorMessage, e)
            stopRecognitionInternal()
        }
    }

    private fun scheduleStopAfterMinimumDuration(promise: Promise, matchData: String) {
        val remainingTime = MIN_RECORDING_DURATION_MS - (System.currentTimeMillis() - recordingStartTime)

        coroutineScope.launch {
            kotlinx.coroutines.delay(remainingTime)
            if (isRecording && hasFoundResult) {
                Log.d(TAG, "Minimum duration completed, stopping recording with match result")
                promise.resolve(matchData)
                stopRecognitionInternal()
            }
        }
    }

    private fun scheduleFallbackStop(promise: Promise) {
        coroutineScope.launch {
            kotlinx.coroutines.delay(MIN_RECORDING_DURATION_MS)
            if (isRecording) {
                Log.d(TAG, "Fallback timer triggered - stopping recording after minimum duration")
                if (hasFoundResult) {
                    // If we found a match during the recording, resolve with success
                    Log.d(TAG, "Had result during recording, resolving with success")
                    promise.resolve("Recording completed with previous match")
                } else {
                    // No match found during the entire minimum duration
                    Log.d(TAG, "No match found during minimum recording duration")
                    promise.reject("NO_MATCH", "No match found after ${MIN_RECORDING_DURATION_MS / 1000} seconds of recording", null)
                }
                stopRecognitionInternal()
            }
        }
    }

    private fun stopRecognitionInternal() {
        try {
            isRecording = false
            audioRecord?.apply {
                stop()
                release()
            }
            audioRecord = null
            recordingThread?.join()
            recordingThread = null
        } catch (e: Exception) {
            Log.e(TAG, "Error stopping recognition internally: ${e.message}")
        }
    }

    private fun onError(message: String) {
        Log.e(TAG, "onError: $message")

        // Send error event to JavaScript
        sendEvent("onError", mapOf(
            "error" to message,
            "timestamp" to System.currentTimeMillis()
        ))
    }
}
