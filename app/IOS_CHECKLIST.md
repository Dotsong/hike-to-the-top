# Putting Trail to the Top on the App Store

Updated November 18, 2026, with the lessons from submitting Treehouse to the Moon. Each step says which past problem it prevents.

**The one bundle ID, everywhere:** `com.michellebrunk.trailtothetop`

## Before you touch Xcode

1. **Check the tools.** In Terminal:
   ```bash
   node -v
   npm -v
   ```
   If either is missing or old, install Node from nodejs.org. Never use `sudo npm`.
2. **Clone once, to your home folder.** (Last time a second copy nested inside the first sent commands to the wrong place.)
   ```bash
   cd ~
   git clone https://github.com/Dotsong/hike-to-the-top.git
   cd ~/hike-to-the-top/app
   npm install
   ```
   Every command below is run from `~/hike-to-the-top/app`.
3. **Register the bundle ID first.** At developer.apple.com: Certificates, Identifiers & Profiles -> Identifiers -> **+** -> App IDs -> App. Description "Trail to the Top", Bundle ID **Explicit**: `com.michellebrunk.trailtothetop`. (Last time App Store Connect's bundle ID menu was empty until this was done.)
4. **Host the privacy policy.** Put a real contact email in `privacy.html` (replace `[your contact email]`), commit and push, then on GitHub: repo Settings -> Pages -> branch `main`, folder `/`. Check that `https://dotsong.github.io/hike-to-the-top/privacy.html` opens.
5. **Plug in the iPad.** Unlock it, tap Trust, and turn on Settings -> Privacy & Security -> Developer Mode. If Keychain asks for a "login" password, it is the Mac's own login password. (Last time Xcode said "no devices from which to generate a provisioning profile".)

## Build the iOS project

6. ```bash
   cd ~/hike-to-the-top/app
   npm run build
   npx cap add ios
   npm run ios
   ```
   `capacitor.config.json` already carries the right bundle ID, so the Xcode project is created with it.

## In Xcode

7. **Signing.** Click **App** (blue icon, left sidebar) -> target **App** -> **Signing & Capabilities**. Team: your developer account. Bundle Identifier must read `com.michellebrunk.trailtothetop`. Let Xcode register the iPad.
8. **General tab.** Display Name: `Trail to the Top`. Supported Destinations: iPhone and iPad. Leave all orientations on. Version 1.0.0, Build 1.
9. **Info.plist keys, from Terminal** (safer than the Info tab, which broke last time):
   ```bash
   cd ~/hike-to-the-top/app
   P=ios/App/App/Info.plist
   /usr/libexec/PlistBuddy -c "Set :CFBundleDisplayName 'Trail to the Top'" $P || /usr/libexec/PlistBuddy -c "Add :CFBundleDisplayName string 'Trail to the Top'" $P
   /usr/libexec/PlistBuddy -c "Add :UIViewControllerBasedStatusBarAppearance bool false" $P
   /usr/libexec/PlistBuddy -c "Add :UIStatusBarHidden bool true" $P
   /usr/libexec/PlistBuddy -c "Print :UIRequiredDeviceCapabilities" $P
   ```
   The last line should list `arm64`. If it does not: `/usr/libexec/PlistBuddy -c "Add :UIRequiredDeviceCapabilities array" -c "Add :UIRequiredDeviceCapabilities:0 string arm64" $P`. (The display name with spaces fixes the "TrailtotheTop" label under the icon.)
10. **Keep the screen awake.** Open `ios/App/App/AppDelegate.swift` and add this line inside `application(_:didFinishLaunchingWithOptions:)`, before `return true`:
    ```swift
    UIApplication.shared.isIdleTimerDisabled = true
    ```
11. **Icon.** Left sidebar: App -> App -> Assets -> AppIcon. Drag in `app/AppStoreSubmission/icon/AppIcon-1024.png` (in Finder: `~/hike-to-the-top/app/AppStoreSubmission/icon`).
12. **Launch screen colour.** Left sidebar: App -> App -> Base.lproj -> LaunchScreen. Click the background, open the Attributes inspector (right panel, slider icon), and set **Background** to hex `#262A66`.
13. **Commit the `ios/` folder now.** (Last time an Xcode crash wiped Info.plist; with this commit, `git checkout ios/App/App/Info.plist` restores it.)
    ```bash
    cd ~/hike-to-the-top
    git add app/ios && git commit -m "Add the iOS project" && git push
    ```

## Test on the iPad

14. Pick the iPad at the top of Xcode and press Run. Check:
    - The name under the icon reads "Trail to the Top".
    - Music starts on the first tap and plays with the mute switch on.
    - **Symbols:** the close buttons, the fact book's arrows, the stars in the contents and the Pace button all draw correctly. (These were broken characters last time; they are now drawn icons and "Pace 1x".)
    - Airplane Mode: relaunch, and everything still works.
    - The pause and fact book buttons clear the notch in both orientations.
    - Stop for today at a rest spot, close the app fully, reopen, and carry on.
    - It runs smoothly. If it stutters, switch Settings -> June and Pip -> Classic and note it.

## App Store Connect

15. **Create the record once.** Apps -> **+** -> New App. Platform iOS, name Trail to the Top, Bundle ID `com.michellebrunk.trailtothetop`, SKU `trail-top-1`. **If it shows an error, look in the Apps list before trying again**; last time the record had been created anyway.
16. **Fill in from `app/AppStoreSubmission/text/`.** The files are numbered in order. Where things live:
    - Categories: App Information -> Category.
    - Contact details for review: version page -> App Review Information.
    - Marketing URL: leave blank.
17. **Screenshots.** Drag in `screenshots/iPhone-1320x2868/` and `screenshots/iPad-2064x2752/`. If a slot rejects the size, use the folder whose name matches the size it asks for; every size is there.
18. **Header and Search Results.** Upload `header-5244x2950.png` and turn on **Use header asset in search results**.
19. **App Privacy:** Data Not Collected. **Age rating:** No or None to everything, for 4+.

## Upload and submit

20. **Check the four bundle IDs match** (see `text/12-bundle-id.txt`). This mismatch cost 50 minutes last time.
21. In Xcode set the destination to **Any iOS Device (arm64)**, then Product -> Archive. The archive is called "App"; that is correct.
22. Organizer -> Distribute App -> App Store Connect -> Upload. There is no upload button on the website; uploads only come from Xcode.
23. **Wait 10 to 30 minutes.** Watch the TestFlight tab. When the build appears, open the version page -> Build -> attach it.
24. Encryption question: "None of the algorithms mentioned above". Then Add for Review -> Submit.

## Updating later

```bash
cd ~/hike-to-the-top && git pull
cd app && npm run sync && npx cap open ios
```
Raise the **Build** number on every upload, then archive and upload as above.
