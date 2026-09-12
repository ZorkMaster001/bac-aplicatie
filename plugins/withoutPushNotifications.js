const { withEntitlementsPlist } = require('expo/config-plugins');

// expo-notifications adaugă necondiționat entitlement-ul `aps-environment`
// (Push Notifications), chiar dacă aplicația nu cere niciodată un token de push.
// BacPro programează doar notificări LOCALE (DAILY + DATE), care nu au nevoie
// de el.
//
// Conturile Apple personale (gratuite) nu pot semna aplicații cu capabilitatea
// Push Notifications, așa că entitlement-ul implicit face build-ul imposibil de
// semnat. Îl scoatem după ce rulează plugin-ul de notificări: nu pierdem nimic
// din ce folosim, iar remindere locale merg în continuare.
module.exports = function withoutPushNotifications(config) {
  return withEntitlementsPlist(config, (cfg) => {
    delete cfg.modResults['aps-environment'];
    return cfg;
  });
};
