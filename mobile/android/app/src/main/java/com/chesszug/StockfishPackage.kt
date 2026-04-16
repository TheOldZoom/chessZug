package com.chesszug

import com.facebook.react.BaseReactPackage
import com.facebook.react.bridge.NativeModule
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.module.model.ReactModuleInfo
import com.facebook.react.module.model.ReactModuleInfoProvider

class StockfishPackage : BaseReactPackage() {

  override fun getModule(name: String, reactContext: ReactApplicationContext): NativeModule? {
    return if (name == StockfishModule.NAME) {
      StockfishModule(reactContext)
    } else {
      null
    }
  }

  override fun getReactModuleInfoProvider(): ReactModuleInfoProvider = ReactModuleInfoProvider {
    mapOf(
      StockfishModule.NAME to
        ReactModuleInfo(
          StockfishModule.NAME,
          StockfishModule::class.java.name,
          false,
          false,
          false,
          false,
        )
    )
  }
}
