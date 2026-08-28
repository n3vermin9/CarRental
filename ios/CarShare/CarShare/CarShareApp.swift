import SwiftUI

@main
struct CarShareApp: App {
    var body: some Scene {
        WindowGroup {
            CarShareWebView()
                .ignoresSafeArea()
        }
    }
}
