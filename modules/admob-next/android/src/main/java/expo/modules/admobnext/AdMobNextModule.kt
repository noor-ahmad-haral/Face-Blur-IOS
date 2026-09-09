package expo.modules.admobnext

import com.google.android.libraries.ads.mobile.sdk.MobileAds
import com.google.android.libraries.ads.mobile.sdk.banner.AdSize
import com.google.android.libraries.ads.mobile.sdk.initialization.InitializationConfig
import expo.modules.kotlin.exception.Exceptions
import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition

class AdMobNextModule : Module() {
  override fun definition() = ModuleDefinition {
    Name("AdMobNext")

    // AsyncFunction bodies run off the JS thread, which is what the next-gen SDK
    // requires: initializing on the main thread risks an ANR.
    AsyncFunction("initialize") { appId: String ->
      if (MobileAds.isInitialized) {
        return@AsyncFunction true
      }
      val context = appContext.reactContext ?: throw Exceptions.ReactContextLost()
      MobileAds.initialize(context, InitializationConfig.Builder(appId).build())
      true
    }

    // Lets JS reserve the right amount of space before the ad resolves, so the
    // banner does not shove the layout around when it finally fills.
    Function("getAdaptiveBannerHeight") { widthDp: Int ->
      val context = appContext.reactContext ?: throw Exceptions.ReactContextLost()
      val width = if (widthDp > 0) widthDp else AdMobNextSizing.widthDp(context, 0)
      AdSize.getLargeAnchoredAdaptiveBannerAdSize(context, width).height
    }

    View(AdMobNextBannerView::class) {
      Events("onAdLoaded", "onAdFailedToLoad")

      Prop("adUnitId") { view: AdMobNextBannerView, adUnitId: String ->
        view.setAdUnitId(adUnitId)
      }

      OnViewDestroys { view: AdMobNextBannerView ->
        view.destroyAd()
      }
    }
  }
}
