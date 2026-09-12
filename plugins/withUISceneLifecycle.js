const { withDangerousMod, withInfoPlist } = require('expo/config-plugins');
const fs = require('fs');
const path = require('path');

// Xcode 27 (iOS 27 SDK) refuses to launch apps that have not adopted the
// UIScene lifecycle: UIKit traps at startup in
// _UIApplicationEvaluateRuntimeIssueForNoSceneLifecycleAdoption.
//
// Expo SDK 57's prebuild template still generates the old AppDelegate/window
// lifecycle and no UIApplicationSceneManifest (expo/expo#46663, still open),
// so every standalone build crashes on launch. Declaring the manifest alone is
// NOT enough — UIKit wants a real scene delegate — so we add one.
//
// The AppDelegate already builds the React Native window in
// didFinishLaunchingWithOptions, which still runs before scenes connect. The
// delegate below therefore adopts that existing window instead of standing up a
// second React Native root, and forwards the deep-link callbacks that move from
// the app delegate to the scene once scenes are adopted.
//
// Remove this plugin once Expo ships scene support upstream.
const SCENE_DELEGATE = `

// MARK: - UIScene lifecycle (added by plugins/withUISceneLifecycle.js)

class SceneDelegate: UIResponder, UIWindowSceneDelegate {
  var window: UIWindow?

  func scene(
    _ scene: UIScene,
    willConnectTo session: UISceneSession,
    options connectionOptions: UIScene.ConnectionOptions
  ) {
    guard let windowScene = scene as? UIWindowScene,
          let appDelegate = UIApplication.shared.delegate as? AppDelegate,
          let existingWindow = appDelegate.window else {
      return
    }
    existingWindow.windowScene = windowScene
    window = existingWindow
    existingWindow.makeKeyAndVisible()
  }

  func scene(_ scene: UIScene, openURLContexts URLContexts: Set<UIOpenURLContext>) {
    guard let url = URLContexts.first?.url else { return }
    RCTLinkingManager.application(UIApplication.shared, open: url, options: [:])
  }

  func scene(_ scene: UIScene, continue userActivity: NSUserActivity) {
    RCTLinkingManager.application(
      UIApplication.shared,
      continue: userActivity,
      restorationHandler: { _ in }
    )
  }
}
`;

module.exports = function withUISceneLifecycle(config) {
  config = withInfoPlist(config, (cfg) => {
    cfg.modResults.UIApplicationSceneManifest = {
      UIApplicationSupportsMultipleScenes: false,
      UISceneConfigurations: {
        UIWindowSceneSessionRoleApplication: [
          {
            UISceneConfigurationName: 'Default Configuration',
            UISceneDelegateClassName: '$(PRODUCT_MODULE_NAME).SceneDelegate',
          },
        ],
      },
    };
    return cfg;
  });

  config = withDangerousMod(config, [
    'ios',
    (cfg) => {
      const file = path.join(
        cfg.modRequest.platformProjectRoot,
        cfg.modRequest.projectName,
        'AppDelegate.swift'
      );
      const src = fs.readFileSync(file, 'utf8');
      if (!src.includes('class SceneDelegate')) {
        fs.writeFileSync(file, src + SCENE_DELEGATE);
      }
      return cfg;
    },
  ]);

  return config;
};
