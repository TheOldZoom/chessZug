APP_DIR=android
DIST_DIR=dist

DEBUG_APK_PATH=app/build/outputs/apk/debug/app-debug.apk
RELEASE_APK_PATH=app/build/outputs/apk/release/app-release.apk

DEBUG_APK_NAME=ChessZug-debug.apk
RELEASE_APK_NAME=ChessZug-release.apk

.PHONY: help install start android run build-debug build-release clean logs devices doctor install-apk dist-clean

# ---------------- HELP ----------------

help:
	@echo "Available commands:"
	@echo ""
	@echo "  make install        - install npm dependencies"
	@echo "  make start          - start Metro bundler"
	@echo "  make android        - run app on Android device"
	@echo "  make run            - alias for android"
	@echo ""
	@echo "  make build-debug    - build debug APK (outputs to dist/)"
	@echo "  make build-release  - build release APK (outputs to dist/)"
	@echo ""
	@echo "  make install-apk    - install debug APK from dist/"
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
	npx react-native run-android

run: android

# ---------------- BUILD ----------------

build-debug:
	cd $(APP_DIR) && ./gradlew assembleDebug
	@make move-debug-apk

build-release:
	cd $(APP_DIR) && ./gradlew assembleRelease
	@make move-release-apk

# ---------------- ARTIFACT HANDLING ----------------

move-debug-apk:
	mkdir -p $(DIST_DIR)
	cp $(APP_DIR)/$(DEBUG_APK_PATH) $(DIST_DIR)/$(DEBUG_APK_NAME)

move-release-apk:
	mkdir -p $(DIST_DIR)
	cp $(APP_DIR)/$(RELEASE_APK_PATH) $(DIST_DIR)/$(RELEASE_APK_NAME)

install-apk:
	adb install $(DIST_DIR)/$(DEBUG_APK_NAME)

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