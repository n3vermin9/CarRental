# Project design instruction

For every future CarShare interface change, read and follow `DESIGN_STANDARD.md`. Treat `app/apple-theme.css` as the authoritative design layer. Do not introduce another visual style without an explicit user request.

## Phone simulator workflow

- When the user says **“build app on phone”**, keep `npm run dev` running, open the built-in browser at `http://127.0.0.1:3000/`, and run `npm run phone:run`.
- Leave Codex and its browser/terminal on the left and fit the iPhone Simulator on the right, matching the user's reference layout.
- The native shell is in `ios/CarShare`; it loads the local development server for live iteration.
- Use iPhone 16 Plus on iOS 18.4 and `/Users/nvr/Downloads/Xcode.app/Contents/Developer`.
