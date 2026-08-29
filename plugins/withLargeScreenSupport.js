const { withAndroidManifest, AndroidConfig } = require('expo/config-plugins');

// Google's ML Kit code-scanner AAR declares this activity locked to portrait.
// It is merged into our manifest from a transitive dependency, so we cannot
// edit it at the source — but the manifest merger honours `tools:remove` on a
// matching node in the app manifest, which strips the attribute from the
// merged result. Play Console flags it under "resizability and orientation
// restrictions" even though the activity is never launched by this app.
const CODE_SCANNER_ACTIVITY =
  'com.google.mlkit.vision.codescanner.internal.GmsBarcodeScanningDelegateActivity';

const TOOLS_NS = 'http://schemas.android.com/tools';

module.exports = function withLargeScreenSupport(config) {
  return withAndroidManifest(config, (cfg) => {
    const manifest = cfg.modResults.manifest;

    // `tools:` attributes are inert unless the namespace is declared.
    manifest.$ = manifest.$ || {};
    manifest.$['xmlns:tools'] = TOOLS_NS;

    const app = AndroidConfig.Manifest.getMainApplicationOrThrow(cfg.modResults);
    app.activity = app.activity || [];

    let node = app.activity.find(
      (a) => a.$ && a.$['android:name'] === CODE_SCANNER_ACTIVITY
    );
    if (!node) {
      node = { $: { 'android:name': CODE_SCANNER_ACTIVITY } };
      app.activity.push(node);
    }
    node.$['tools:remove'] = 'android:screenOrientation';

    // `orientation: "default"` makes Expo emit screenOrientation="unspecified".
    // That is already the Android default and not a restriction, but dropping
    // the attribute outright leaves nothing for Play's scanner to match on.
    for (const activity of app.activity) {
      if (activity.$ && activity.$['android:screenOrientation'] === 'unspecified') {
        delete activity.$['android:screenOrientation'];
      }
    }

    return cfg;
  });
};
