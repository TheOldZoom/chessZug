APP_DIR=android
DIST_DIR=dist

DEBUG_APK_PATH=app/build/outputs/apk/debug/app-debug.apk
RELEASE_APK_PATH=app/build/outputs/apk/release/app-release.apk
DEV_DEBUG_APK_PATH=app/build/outputs/apk/dev/debug/app-dev-debug.apk
PROD_RELEASE_DIR=app/build/outputs/apk/prod/release

DEBUG_APK_NAME=ChessZug-debug.apk
RELEASE_APK_NAME=ChessZug-release.apk
DEV_DEBUG_APK_NAME=ChessZug-dev-debug.apk
PROD_RELEASE_ARM64_NAME=ChessZug-arm64.apk
PROD_RELEASE_X86_64_NAME=ChessZug-x86_64.apk

.PHONY: help install start android android-dev android-prod run build-debug build-release build-dev-debug build-prod-release clean logs devices doctor install-apk install-dev-apk dist-clean

# ---------------- HELP ----------------

help:
	@echo "Available commands:"
	@echo ""
	@echo "  make install        - install npm dependencies"
	@echo "  make start          - start Metro bundler"
	@echo "  make android        - run dev app on Android device"
	@echo "  make run            - alias for android"
	@echo ""
	@echo "  make build-debug    - build dev debug APK (outputs to dist/)"
	@echo "  make build-release  - build prod release APK (outputs to dist/)"
	@echo "  make build-dev-debug    - build dev debug APK (outputs to dist/)"
	@echo "  make build-prod-release - build prod release APK (outputs to dist/)"
	@echo ""
	@echo "  make install-apk    - install debug APK from dist/"
	@echo "  make install-dev-apk - install dev debug APK from dist/"
	@echo "  make clean          - clean android build"
	@echo "  make dist-clean     - remove dist/ folder"
	@echo ""
	@echo "  make logs           - show React Native logs"
	@echo "  make devices        - list adb devices"
	@echo "  make doctor         - run react-native doctor"

# ---------------- CORE ----------------

install:
	npm install

start:
	npx react-native start

android:
	@make android-dev

android-dev:
	npx react-native run-android --mode devDebug

android-prod:
	npx react-native run-android --mode prodDebug

run: android

# ---------------- BUILD ----------------

build-debug:
	@make build-dev-debug

build-release:
	@make build-prod-release

build-dev-debug:
	cd $(APP_DIR) && ./gradlew assembleDevDebug
	@make move-dev-debug-apk

build-prod-release:
	cd $(APP_DIR) && ./gradlew assembleProdRelease
	@make move-prod-release-apk

# ---------------- ARTIFACT HANDLING ----------------

move-debug-apk:
	mkdir -p $(DIST_DIR)
	cp $(APP_DIR)/$(DEBUG_APK_PATH) $(DIST_DIR)/$(DEBUG_APK_NAME)

move-release-apk:
	mkdir -p $(DIST_DIR)
	cp $(APP_DIR)/$(RELEASE_APK_PATH) $(DIST_DIR)/$(RELEASE_APK_NAME)

move-dev-debug-apk:
	mkdir -p $(DIST_DIR)
	cp $(APP_DIR)/$(DEV_DEBUG_APK_PATH) $(DIST_DIR)/$(DEV_DEBUG_APK_NAME)

move-prod-release-apk:
	mkdir -p $(DIST_DIR)
	cp $$(find $(APP_DIR)/$(PROD_RELEASE_DIR) -maxdepth 1 -name '*.apk' | grep 'arm64-v8a' | head -n 1) $(DIST_DIR)/$(PROD_RELEASE_ARM64_NAME)
	cp $$(find $(APP_DIR)/$(PROD_RELEASE_DIR) -maxdepth 1 -name '*.apk' | grep 'x86_64' | head -n 1) $(DIST_DIR)/$(PROD_RELEASE_X86_64_NAME)

install-apk:
	adb install $(DIST_DIR)/$(DEBUG_APK_NAME)

install-dev-apk:
	adb install $(DIST_DIR)/$(DEV_DEBUG_APK_NAME)

# ---------------- UTIL ----------------

clean:
	cd $(APP_DIR) && ./gradlew clean

dist-clean:
	rm -rf $(DIST_DIR)

logs:
	adb logcat | grep ReactNativeJS

devices:
	adb devices

doctor:
	npx react-native doctor