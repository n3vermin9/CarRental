import SwiftUI
import WebKit

struct CarShareWebView: UIViewRepresentable {
    private let developmentURL = URL(string: "http://127.0.0.1:3000/")!

    func makeUIView(context: Context) -> WKWebView {
        let configuration = WKWebViewConfiguration()
        configuration.websiteDataStore = .default()
        configuration.allowsInlineMediaPlayback = true

        let webView = WKWebView(frame: .zero, configuration: configuration)
        webView.navigationDelegate = context.coordinator
        webView.isOpaque = false
        webView.backgroundColor = .black
        webView.scrollView.backgroundColor = .black
        webView.scrollView.contentInsetAdjustmentBehavior = .never
        webView.scrollView.bounces = false
        webView.allowsBackForwardNavigationGestures = false
        webView.load(URLRequest(url: developmentURL))
        return webView
    }

    func updateUIView(_ webView: WKWebView, context: Context) {}

    func makeCoordinator() -> Coordinator {
        Coordinator(developmentURL: developmentURL)
    }

    final class Coordinator: NSObject, WKNavigationDelegate {
        private let developmentURL: URL

        init(developmentURL: URL) {
            self.developmentURL = developmentURL
        }

        func webView(
            _ webView: WKWebView,
            didFailProvisionalNavigation navigation: WKNavigation?,
            withError error: Error
        ) {
            DispatchQueue.main.asyncAfter(deadline: .now() + 0.75) {
                webView.load(URLRequest(url: self.developmentURL))
            }
        }
    }
}
