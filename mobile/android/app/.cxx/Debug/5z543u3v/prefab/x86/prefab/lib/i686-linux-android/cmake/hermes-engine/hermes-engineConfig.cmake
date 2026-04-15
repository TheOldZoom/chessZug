if(NOT TARGET hermes-engine::hermesvm)
add_library(hermes-engine::hermesvm SHARED IMPORTED)
set_target_properties(hermes-engine::hermesvm PROPERTIES
    IMPORTED_LOCATION "/home/zoom/.gradle/caches/9.3.1/transforms/cd51c00f5529eb545445290c3eb1d1b6/transformed/hermes-android-250829098.0.10-debug/prefab/modules/hermesvm/libs/android.x86/libhermesvm.so"
    INTERFACE_INCLUDE_DIRECTORIES "/home/zoom/.gradle/caches/9.3.1/transforms/cd51c00f5529eb545445290c3eb1d1b6/transformed/hermes-android-250829098.0.10-debug/prefab/modules/hermesvm/include"
    INTERFACE_LINK_LIBRARIES ""
)
endif()

