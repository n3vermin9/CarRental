#!/bin/zsh
set -euo pipefail

workspace_dir="${0:A:h:h}"
developer_dir="/Users/nvr/Downloads/Xcode.app/Contents/Developer"
device_id="BD05A28C-8F54-4F8F-80FD-0F0D25F8FAC4"
project_path="$workspace_dir/ios/CarShare/CarShare.xcodeproj"
derived_data="$workspace_dir/ios/CarShare/DerivedData"
app_path="$derived_data/Build/Products/Debug-iphonesimulator/CarShare.app"

export DEVELOPER_DIR="$developer_dir"

if ! curl --silent --fail --max-time 2 http://127.0.0.1:3000/ >/dev/null; then
  print -u2 "CarShare development server is not running. Start it with: npm run dev"
  exit 1
fi

xcrun simctl boot "$device_id" 2>/dev/null || true
xcrun simctl bootstatus "$device_id" -b

xcodebuild \
  -project "$project_path" \
  -scheme CarShare \
  -configuration Debug \
  -destination "platform=iOS Simulator,id=$device_id" \
  -derivedDataPath "$derived_data" \
  CODE_SIGNING_ALLOWED=NO \
  build

xcrun simctl install "$device_id" "$app_path"
xcrun simctl launch "$device_id" local.carshare.dev
