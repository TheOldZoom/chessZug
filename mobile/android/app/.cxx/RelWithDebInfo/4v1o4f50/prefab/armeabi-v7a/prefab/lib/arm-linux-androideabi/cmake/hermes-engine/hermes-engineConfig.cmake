if(NOT TARGET hermes-engine::hermesvm)
add_library(hermes-engine::hermesvm SHARED IMPORTED)
set_target_properties(hermes-engine::hermesvm PROPERTIES
    IMPORTED_LOCATION "/home/zoom/.gradle/caches/9.3.1/transforms/948bc2767943b0aed6251e9b86208553/transformed/hermes-android-250829098.0.10-release/prefab/modules/hermesvm/libs/android.armeabi-v7a/libhermesvm.so"
    INTERFACE_INCLUDE_DIRECTORIES "/home/zoom/.gradle/caches/9.3.1/transforms/948bc2767943b0aed6251e9b86208553/transformed/hermes-android-250829098.0.10-release/prefab/modules/hermesvm/include"
    INTERFACE_LINK_LIBRARIES ""
)
endif()

