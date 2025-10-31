# AdiCheats C++ Authentication Library
# CMake build configuration

cmake_minimum_required(VERSION 3.10)
project(AdiCheatsAuth VERSION 1.0.0 LANGUAGES CXX)

# Set C++ standard
set(CMAKE_CXX_STANDARD 14)
set(CMAKE_CXX_STANDARD_REQUIRED ON)
set(CMAKE_CXX_EXTENSIONS OFF)

# Platform-specific settings
if(WIN32)
    # Windows specific settings
    add_definitions(-DCURL_STATICLIB)
    add_definitions(-D_WIN32_WINNT=0x0601)  # Windows 7+
    
    # Use static runtime for easier distribution
    set(CMAKE_MSVC_RUNTIME_LIBRARY "MultiThreaded$<$<CONFIG:Debug>:Debug>")
endif()

# Include directories
include_directories(
    ${CMAKE_CURRENT_SOURCE_DIR}
    ${CMAKE_CURRENT_SOURCE_DIR}/Curl
)

# Source files
set(SOURCES
    login_example.cpp
)

# Header files
set(HEADERS
    auth.hpp
    json.hpp
    Curl/curl.h
)

# Create executable
add_executable(${PROJECT_NAME} ${SOURCES} ${HEADERS})

# Link libraries
if(WIN32)
    target_link_libraries(${PROJECT_NAME}
        # libcurl static library
        ${CMAKE_CURRENT_SOURCE_DIR}/Curl/libcurl_a.lib
        
        # Windows libraries
        ws2_32
        Normaliz
        Crypt32
        Wldap32
        Advapi32
    )
else()
    # For Linux/Unix (requires libcurl-dev installed)
    find_package(CURL REQUIRED)
    target_link_libraries(${PROJECT_NAME} CURL::libcurl)
endif()

# Compiler warnings
if(MSVC)
    target_compile_options(${PROJECT_NAME} PRIVATE /W4)
else()
    target_compile_options(${PROJECT_NAME} PRIVATE -Wall -Wextra -Wpedantic)
endif()

# Set output directory
set_target_properties(${PROJECT_NAME} PROPERTIES
    RUNTIME_OUTPUT_DIRECTORY ${CMAKE_BINARY_DIR}/bin
)

# Installation
install(TARGETS ${PROJECT_NAME}
    RUNTIME DESTINATION bin
)

install(FILES
    auth.hpp
    json.hpp
    README.md
    DESTINATION include/adicheats
)

# Print configuration summary
message(STATUS "")
message(STATUS "========================================")
message(STATUS "  AdiCheats Authentication Library")
message(STATUS "========================================")
message(STATUS "Build type: ${CMAKE_BUILD_TYPE}")
message(STATUS "C++ standard: ${CMAKE_CXX_STANDARD}")
message(STATUS "Compiler: ${CMAKE_CXX_COMPILER_ID}")
message(STATUS "Platform: ${CMAKE_SYSTEM_NAME}")
message(STATUS "========================================")
message(STATUS "")

