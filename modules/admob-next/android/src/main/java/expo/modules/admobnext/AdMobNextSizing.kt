package expo.modules.admobnext

import android.content.Context

/** Shared px -> dp width resolution so the view and the JS height hint agree. */
internal object AdMobNextSizing {
  fun widthDp(context: Context, measuredWidthPx: Int): Int {
    val metrics = context.resources.displayMetrics
    // Before the first layout pass a view has no width; the full screen is the
    // best available guess and matches how the banner is used (edge to edge).
    val px = if (measuredWidthPx > 0) measuredWidthPx else metrics.widthPixels
    return (px / metrics.density).toInt()
  }
}
