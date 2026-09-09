// AdMob identifiers for this app. The app ID is also mirrored into the native
// manifest (modules/admob-next/android/src/main/AndroidManifest.xml) because the
// User Messaging Platform SDK reads it from there.
export const ADMOB_APP_ID = 'ca-app-pub-8681361658268612~1996951796';

const LIVE_BANNER_UNIT_ID = 'ca-app-pub-8681361658268612/2863793409';

// Google's always-fills banner unit. Serving live ads to a build you are
// tapping through yourself is an AdMob policy violation, so debug builds never
// touch the real unit.
const TEST_BANNER_UNIT_ID = 'ca-app-pub-3940256099942544/9214589741';

export const BANNER_AD_UNIT_ID = __DEV__ ? TEST_BANNER_UNIT_ID : LIVE_BANNER_UNIT_ID;
