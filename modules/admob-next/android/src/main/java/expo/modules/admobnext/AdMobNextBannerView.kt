package expo.modules.admobnext

import android.content.Context
import com.google.android.libraries.ads.mobile.sdk.banner.AdSize
import com.google.android.libraries.ads.mobile.sdk.banner.AdView
import com.google.android.libraries.ads.mobile.sdk.banner.BannerAd
import com.google.android.libraries.ads.mobile.sdk.banner.BannerAdRequest
import com.google.android.libraries.ads.mobile.sdk.common.AdLoadCallback
import com.google.android.libraries.ads.mobile.sdk.common.LoadAdError
import expo.modules.kotlin.AppContext
import expo.modules.kotlin.viewevent.EventDispatcher
import expo.modules.kotlin.views.ExpoView

/**
 * Hosts a next-gen `AdView` inside the React Native tree. The ad unit arrives as
 * a prop; the request itself waits until Android has given the view a width, so
 * the adaptive size we ask for matches the slot the ad actually renders into.
 */
class AdMobNextBannerView(context: Context, appContext: AppContext) :
  ExpoView(context, appContext) {

  private val onAdLoaded by EventDispatcher()
  private val onAdFailedToLoad by EventDispatcher()

  // The AdView is not a React child, so React never lays it out. Android has to.
  override val shouldUseAndroidLayout = true

  private val adView = AdView(context).also {
    it.layoutParams = LayoutParams(LayoutParams.MATCH_PARENT, LayoutParams.WRAP_CONTENT)
    addView(it)
  }

  private var adUnitId: String? = null
  private var requested = false

  fun setAdUnitId(value: String) {
    if (value == adUnitId) return
    adUnitId = value
    requested = false
    loadIfReady()
  }

  fun destroyAd() {
    adView.destroy()
  }

  override fun onLayout(changed: Boolean, l: Int, t: Int, r: Int, b: Int) {
    super.onLayout(changed, l, t, r, b)
    // First pass through here is the earliest point we know our own width.
    loadIfReady()
  }

  private fun loadIfReady() {
    val unitId = adUnitId ?: return
    if (requested) return

    val widthDp = AdMobNextSizing.widthDp(context, width)
    if (widthDp <= 0) return

    requested = true
    val adSize = AdSize.getLargeAnchoredAdaptiveBannerAdSize(context, widthDp)
    val request = BannerAdRequest.Builder(unitId, adSize).build()

    adView.loadAd(
      request,
      object : AdLoadCallback<BannerAd> {
        override fun onAdLoaded(ad: BannerAd) {
          this@AdMobNextBannerView.onAdLoaded(
            mapOf("width" to adSize.width, "height" to adSize.height)
          )
        }

        override fun onAdFailedToLoad(adError: LoadAdError) {
          // Let a later layout pass (rotation, remount) try again.
          requested = false
          this@AdMobNextBannerView.onAdFailedToLoad(
            mapOf("code" to adError.code.toString(), "message" to adError.message)
          )
        }
      }
    )
  }
}
