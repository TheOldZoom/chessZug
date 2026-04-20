package com.chesszug

import android.system.Os
import android.system.OsConstants
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import java.io.BufferedReader
import java.io.BufferedWriter
import java.io.File
import java.io.FileOutputStream
import java.io.InputStreamReader
import java.io.OutputStreamWriter
import java.util.concurrent.Executors

class StockfishModule(reactContext: ReactApplicationContext) :
    ReactContextBaseJavaModule(reactContext) {

  companion object {
    const val NAME: String = "Stockfish"
  }

  private val executor = Executors.newSingleThreadExecutor()
  private val ioLock = Any()
  private var process: Process? = null
  private var writer: BufferedWriter? = null
  private var reader: BufferedReader? = null

  override fun getName(): String = NAME

  override fun invalidate() {
    executor.execute {
      synchronized(ioLock) { quitLocked() }
    }
    executor.shutdown()
  }

  @ReactMethod
  fun prepare(promise: Promise) {
    executor.execute {
      try {
        synchronized(ioLock) {
          quitLocked()
          val path = engineExecutablePath(reactApplicationContext)
          val pb = ProcessBuilder(path)
          pb.redirectErrorStream(true)
          val p = pb.start()
          process = p
          writer = BufferedWriter(OutputStreamWriter(p.outputStream, Charsets.UTF_8))
          reader = BufferedReader(InputStreamReader(p.inputStream, Charsets.UTF_8))
          sendRaw("uci\n")
          readUntilLine { it == "uciok" }
          sendRaw("isready\n")
          readUntilLine { it == "readyok" }
        }
        promise.resolve(null)
      } catch (e: Exception) {
        promise.reject("STOCKFISH_PREPARE", e.message, e)
      }
    }
  }

  @ReactMethod
  fun quit(promise: Promise) {
    executor.execute {
      try {
        synchronized(ioLock) { quitLocked() }
        promise.resolve(null)
      } catch (e: Exception) {
        promise.reject("STOCKFISH_QUIT", e.message, e)
      }
    }
  }

  @ReactMethod
  fun setElo(elo: Int, promise: Promise) {
    executor.execute {
      try {
        synchronized(ioLock) {
          requireEngine()
          val mapped =
              1320 + ((elo - 100) * (3190 - 1320)) / (3000 - 100)
          val clamped = mapped.coerceIn(1320, 3190)
          sendRaw("setoption name UCI_LimitStrength value true\n")
          sendRaw("setoption name UCI_Elo value $clamped\n")
          sendRaw("isready\n")
          readUntilLine { it == "readyok" }
        }
        promise.resolve(null)
      } catch (e: Exception) {
        promise.reject("STOCKFISH_ELO", e.message, e)
      }
    }
  }

  @ReactMethod
  fun setPosition(fen: String, promise: Promise) {
    executor.execute {
      try {
        synchronized(ioLock) {
          requireEngine()
          sendRaw("position fen $fen\n")
          writer?.flush()
        }
        promise.resolve(null)
      } catch (e: Exception) {
        promise.reject("STOCKFISH_POSITION", e.message, e)
      }
    }
  }

  @ReactMethod
  fun goMovetime(movetimeMs: Int, promise: Promise) {
    executor.execute {
      try {
        val best: String
        synchronized(ioLock) {
          requireEngine()
          sendRaw("go movetime $movetimeMs\n")
          best = readBestMoveLocked()
        }
        promise.resolve(best)
      } catch (e: Exception) {
        promise.reject("STOCKFISH_GO", e.message, e)
      }
    }
  }

  @ReactMethod
  fun goDepth(depth: Int, promise: Promise) {
    executor.execute {
      try {
        val best: String
        synchronized(ioLock) {
          requireEngine()
          sendRaw("go depth $depth\n")
          best = readBestMoveLocked()
        }
        promise.resolve(best)
      } catch (e: Exception) {
        promise.reject("STOCKFISH_GO", e.message, e)
      }
    }
  }

  @ReactMethod
  fun stop(promise: Promise) {
    executor.execute {
      try {
        synchronized(ioLock) {
          requireEngine()
          sendRaw("stop\n")
          readBestMoveLocked()
        }
        promise.resolve(null)
      } catch (e: Exception) {
        promise.reject("STOCKFISH_STOP", e.message, e)
      }
    }
  }

  private fun requireEngine() {
    if (process == null || writer == null || reader == null) {
      throw IllegalStateException("Stockfish not prepared")
    }
  }

  private fun sendRaw(s: String) {
    writer!!.write(s)
    writer!!.flush()
  }

  private fun readUntilLine(predicate: (String) -> Boolean) {
    while (true) {
      val line = reader!!.readLine() ?: throw java.io.IOException("EOF")
      if (predicate(line)) return
    }
  }

  private fun readBestMoveLocked(): String {
    while (true) {
      val line = reader!!.readLine() ?: throw java.io.IOException("EOF")
      if (line.startsWith("bestmove")) {
        val parts = line.trim().split("\\s+".toRegex())
        if (parts.size >= 2) {
          val m = parts[1]
          if (m == "(none)") return ""
          return m
        }
        return ""
      }
    }
  }

  private fun quitLocked() {
    try {
      writer?.write("quit\n")
      writer?.flush()
    } catch (_: Exception) {}
    try {
      reader?.close()
    } catch (_: Exception) {}
    try {
      writer?.close()
    } catch (_: Exception) {}
    try {
      process?.destroyForcibly()
    } catch (_: Exception) {}
    reader = null
    writer = null
    process = null
  }

  private fun engineExecutablePath(context: android.content.Context): String {
    val fromApk = File(context.applicationInfo.nativeLibraryDir, "libstockfish.so")
    if (fromApk.isFile && fromApk.length() > 0L) {
      return fromApk.absolutePath
    }
    return copyBinaryFromAssets(context)
  }

  private fun copyBinaryFromAssets(context: android.content.Context): String {
    val abi = pickAbiFolder()
    val assetPath = "stockfish/$abi/stockfish"
    val outFile = File(context.filesDir, "stockfish-$abi")
    if (outFile.exists() && !outFile.delete()) {
      throw IllegalStateException("Could not remove old stockfish in filesDir")
    }
    context.assets.open(assetPath).use { input ->
      FileOutputStream(outFile).use { output -> input.copyTo(output) }
    }
    val path = outFile.absolutePath
    try {
      Os.chmod(
        path,
        OsConstants.S_IRUSR or OsConstants.S_IXUSR,
      )
    } catch (e: Exception) {
      if (!outFile.setWritable(false, false) ||
          !outFile.setReadable(true, true) ||
          !outFile.setExecutable(true, true)
      ) {
        throw IllegalStateException("Could not chmod stockfish in filesDir", e)
      }
    }
    try {
      ProcessBuilder("/system/bin/chmod", "0500", path)
          .redirectErrorStream(true)
          .start()
          .waitFor()
    } catch (_: Exception) {}
    return path
  }

  private fun pickAbiFolder(): String = "arm64-v8a"
}
