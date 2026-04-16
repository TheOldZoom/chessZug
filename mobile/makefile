APP_DIR=android
DIST_DIR=dist
DEV_APP_ID=com.chesszug.dev
PROD_APP_ID=com.chesszug

JAVA_17_HOME ?= /usr/lib/jvm/java-17-openjdk
export JAVA_HOME := $(JAVA_17_HOME)
export PATH := $(JAVA_17_HOME)/bin:$(PATH)

DEV_DEBUG_APK_PATH=app/build/outputs/apk/dev/debug/app-dev-arm64-v8a-debug.apk
PROD_DEBUG_APK_PATH=app/build/outputs/apk/prod/debug/app-prod-arm64-v8a-debug.apk
PROD_RELEASE_DIR=app/build/outputs/apk/prod/release

DEV_DEBUG_APK_NAME=ChessZug-dev-debug.apk
PROD_DEBUG_APK_NAME=ChessZug-prod-debug.apk
PROD_RELEASE_ARM64_NAME=ChessZug-arm64.apk

.PHONY: help install start android android-dev android-prod run build-debug build-release build-dev-debug build-prod-debug build-prod-release fetch-stockfish clean logs devices doctor install-apk install-dev-apk install-prod-debug-apk dist-clean

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
	@echo "  make build-prod-release - build prod release APK (outputs to dist/)"
	@echo ""
	@echo "  make install-apk    - build and install dev debug APK (com.chesszug.dev)"
	@echo "  make install-dev-apk - adb install dev debug APK from dist/ (run build-dev-debug first)"
	@echo "  make install-prod-debug-apk - adb install prod debug APK from dist/"
	@echo "  make fetch-stockfish - force re-download Stockfish jni binary"
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
	npx react-native run-android --mode devDebug --appId $(DEV_APP_ID)

android-prod:
	npx react-native run-android --mode prodDebug --appId $(PROD_APP_ID)

run: android

# ---------------- STOCKFISH ----------------

fetch-stockfish:
	cd $(APP_DIR) && ./gradlew :app:fetchStockfish -PstockfishForce

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

move-dev-debug-apk:
	mkdir -p $(DIST_DIR)
	cp $(APP_DIR)/$(DEV_DEBUG_APK_PATH) $(DIST_DIR)/$(DEV_DEBUG_APK_NAME)

move-prod-debug-apk:
	mkdir -p $(DIST_DIR)
	cp $(APP_DIR)/$(PROD_DEBUG_APK_PATH) $(DIST_DIR)/$(PROD_DEBUG_APK_NAME)

move-prod-release-apk:
	mkdir -p $(DIST_DIR)
	cp $$(find $(APP_DIR)/$(PROD_RELEASE_DIR) -maxdepth 1 -name '*.apk' | grep 'arm64-v8a' | head -n 1) $(DIST_DIR)/$(PROD_RELEASE_ARM64_NAME)

install-apk: build-dev-debug
	adb install -r $(DIST_DIR)/$(DEV_DEBUG_APK_NAME)

install-dev-apk:
	adb install -r $(DIST_DIR)/$(DEV_DEBUG_APK_NAME)

build-prod-debug:
	cd $(APP_DIR) && ./gradlew assembleProdDebug
	@make move-prod-debug-apk

install-prod-debug-apk: build-prod-debug
	adb install -r $(DIST_DIR)/$(PROD_DEBUG_APK_NAME)

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