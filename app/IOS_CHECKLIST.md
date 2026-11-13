# Putting Trail to the Top on the App Store

Updated November 12, 2026.

## What you need

Everything for the app is now in the `app/` folder of the `hike-to-the-top` repo. It wraps the game in a full-screen web view with [Capacitor](https://capacitorjs.com), with three.js and the fonts bundled inside, so it works offline.

- **A Mac with the newest Xcode** from the Mac App Store. Apple only accepts uploads built with Xcode 26 or later ([Apple](https://developer.apple.com/news/upcoming-requirements/?id=04282026a)).
- **Node.js**, the current LTS version from [nodejs.org](https://nodejs.org).
- **An Apple Developer Program membership.** If you enrolled for Treehouse to the Moon, the same membership covers this app.

Steps 1–4 happen once. After that, updating the app is step 8.

## 1. Get the project onto your Mac

```bash
git clone https://github.com/Dotsong/hike-to-the-top.git
cd hike-to-the-top/app
npm install
```

## 2. Build the offline game and create the iOS project

```bash
npm run build        # copies ../index.html into www/, pointed at the bundled files
npx cap add ios      # creates the ios/ Xcode project (one time only)
npm run ios          # syncs the game into the project and opens Xcode
```

The project uses Capacitor 8, which sets up Swift Package Manager by default, so CocoaPods is no longer needed ([Capacitor docs](https://capacitorjs.com/docs/next/getting-started/environment-setup)).

Commit the new `ios/` folder to the repo so the Xcode settings below are saved.

## 3. Set up the app in Xcode

In the left sidebar, click **App** (the blue project icon), then the **App** target.

- **Signing & Capabilities**
    - **Team:** your Apple Developer account.
    - **Bundle Identifier:** `com.dotsong.trailtothetop`. If you change it, change `appId` in `capacitor.config.json` to match.
- **General**
    - **Display Name:** Trail to the Top.
    - **Supported Destinations:** iPhone and iPad.
    - **Device Orientation:** leave all orientations on. The game adapts to any shape, and iPad multitasking needs them.
    - **Version** 1.0.0, **Build** 1.
- **Info** (or `ios/App/App/Info.plist`): add
    - `Status bar is initially hidden` = `YES`
    - `View controller-based status bar appearance` = `NO`
- **Keep the screen awake.** The hike is watched more than touched. Open `ios/App/App/AppDelegate.swift` and add one line inside `application(_:didFinishLaunchingWithOptions:)`, before `return true`:

```swift
UIApplication.shared.isIdleTimerDisabled = true
```

## 4. App icon and launch screen

- **Icon:** open `ios/App/App/Assets.xcassets`, then **AppIcon**. Drag in `app/icon/AppIcon-1024.png`. It is a first draft showing the sisters on the trail; swap in your own 1024×1024 PNG if you prefer.
- **Launch screen:** open `ios/App/App/Base.lproj/LaunchScreen.storyboard`, select the view, and set its **Background** to **#262A66**, the splash page's deep blue. That stops a white flash at startup.

## 5. Try it

Run it in an iPad simulator, then on a real iPhone or iPad. Check:

- [ ] **Sound:** music starts on the first tap and plays with the mute switch on.
- [ ] **No zooming:** double-tapping and pinching don't zoom the page.
- [ ] **Offline:** turn on Airplane Mode and relaunch. Everything still works.
- [ ] **Screen stays on** through a long stretch of trail.
- [ ] **Notch and corners:** the pause and fact book buttons clear the Dynamic Island in both orientations.
- [ ] **Saving:** stop for today at a rest spot, close the app fully, reopen, and carry on.
- [ ] **Settings:** text size changes stick; Restart progress clears the fact book.
- [ ] **Speed:** the marsh, the pond and the crystal hollow run smoothly on the oldest device you can find.

## 6. Create the app in App Store Connect

At [appstoreconnect.apple.com](https://appstoreconnect.apple.com), go to **Apps**, then **+** and **New App**.

- **Basics:** Platform iOS. Name Trail to the Top. Bundle ID from step 3. SKU anything unique, such as `trail-top-1`.
- **Listing text:** paste the subtitle, description, keywords and categories from `app/APP_STORE_LISTING.md`.
- **Privacy Policy URL:** turn on GitHub Pages for the repo (**Settings → Pages**, branch `main`, folder `/`). The policy is then at `https://dotsong.github.io/hike-to-the-top/privacy.html`. Pages needs the repo to be public unless you have a paid GitHub plan.
- **App Privacy:** answer **Data Not Collected**. The game has no accounts, ads, analytics or tracking, and everything it saves stays on the device.
- **Age rating:** Apple replaced the old questionnaire. Ratings are now 4+, 9+, 13+, 16+ and 18+, and there are new required questions on in-app controls, capabilities, medical or wellness topics and violent themes ([Apple](https://developer.apple.com/news/?id=ks775ehf)). Answer no or none to all of them for **4+**.
- **Kids category (optional):** age band 6–8 suits it. It adds review checks for ads, analytics and outside links; the game has none of these.
- **App Review notes:** paste the note from the listing file. It tells the reviewer the game plays itself and how to open the Testing menu.

### Screenshots

Ready-made screenshots are in `app/screenshots/`: ten for each slot, numbered in the order to upload. Drag them in. To retake any, use **File → Save Screen** (⌘S) in the simulator. Apple's accepted sizes ([screenshot specifications](https://developer.apple.com/help/app-store-connect/reference/app-information/screenshot-specifications)):

| Slot | Simulator to use | Size, portrait | Needed? |
| --- | --- | --- | --- |
| iPhone, large display | iPhone 17 Pro Max | 1320 × 2868 | Recommended; smaller iPhone sizes are scaled from it |
| iPad 13-inch | iPad Pro 13-inch | 2064 × 2752 | Required, because the app runs on iPad |

Landscape versions of the same sizes are also accepted, and the game looks good that way. Up to 10 per slot, PNG or JPEG with no transparency. Good moments: the title page, the first fork, the Frog King, the night marsh, the upside-down pond, a village, the open fact book, the summit.

## 7. Upload and submit

1. In Xcode, set the destination to **Any iOS Device (arm64)**.
2. Choose **Product → Archive**.
3. In the Organizer window, choose **Distribute App**, then **App Store Connect**, then **Upload**.
4. After a few minutes the build appears in App Store Connect. Try it through **TestFlight** first if you like.
5. On the app's version page, pick the build, press **Add for Review**, then **Submit**.

If Apple asks questions, answer them in App Store Connect.

## 8. Updating the app later

Whenever `index.html` changes:

```bash
cd app
git pull
npm run sync         # rebuilds www/ and copies it into the iOS project
npx cap open ios
```

Then raise the **Build** number (and the **Version**, for a visible update), archive, and upload as in step 7.

## What changed since the Treehouse guide

| Topic | Then | Now |
| --- | --- | --- |
| Xcode | Any recent version | Xcode 26 or later is required for every upload |
| Capacitor | `latest`, might ask for CocoaPods | Pinned to version 8; Swift Package Manager, no CocoaPods |
| Age rating | "None to everything" | New questionnaire and tiers; still 4+ for this game |
| iPhone screenshots | 6.9-inch slot | Same 1320 × 2868 size; Apple now labels it "Dynamic Island (large display)" |
| Screen stays on | One line in AppDelegate | Same line; the game also asks the browser to stay awake |
| App Review note | Not needed | Explains the picture lock on the Testing menu |

## Still to do before you submit

- [ ] Put a real contact email in `privacy.html`, replacing `[your contact email]`.
- [ ] Decide whether to keep the draft icon.
- [ ] Decide whether the Testing button should ship at all. It is hidden behind the picture lock, but it can be removed for the store build.
- [ ] Play the game through once on a real device. It has only been tested in a desktop browser so far.

## What's in the app folder

| File | What it is |
| --- | --- |
| `package.json` | Capacitor dependencies and the `build`, `sync` and `ios` commands |
| `capacitor.config.json` | App ID, name, background color, web-view settings |
| `vendor-files/` | three.js r128 and the three fonts, with their licenses |
| `www/` | The built offline game, made by `npm run build`; not stored in the repo |
| `screenshots/` | Ten iPhone and ten iPad screenshots, plus a contact sheet of each |
| `icon/` | `AppIcon-1024.png` and the `icon.svg` it was drawn from |
| `APP_STORE_LISTING.md` | Ready-to-paste App Store text and the App Review note |
| `IOS_CHECKLIST.md` | This guide, as a file in the repo |
