import SwiftUI
import WebKit
import ObjectiveC.runtime

private final class InputAccessoryViewSuppressor: NSObject {
    @objc var inputAccessoryView: UIView? { nil }
}

private func hideInputAccessoryView(in webView: WKWebView) {
    guard let contentView = webView.scrollView.subviews.first(where: {
        NSStringFromClass(type(of: $0)).hasPrefix("WKContent")
    }), let originalClass = object_getClass(contentView) else { return }

    let subclassName = "\(NSStringFromClass(originalClass))_CarShareNoInputAccessoryView"
    let subclass: AnyClass

    if let existingClass = NSClassFromString(subclassName) {
        subclass = existingClass
    } else {
        guard let createdClass = objc_allocateClassPair(originalClass, subclassName, 0),
              let method = class_getInstanceMethod(
                InputAccessoryViewSuppressor.self,
                #selector(getter: InputAccessoryViewSuppressor.inputAccessoryView)
              ) else { return }
        class_addMethod(
            createdClass,
            #selector(getter: UIResponder.inputAccessoryView),
            method_getImplementation(method),
            method_getTypeEncoding(method)
        )
        objc_registerClassPair(createdClass)
        subclass = createdClass
    }

    object_setClass(contentView, subclass)
}

struct CarShareWebView: UIViewRepresentable {
    private let developmentURL: URL = {
        let configuredURL = Bundle.main.object(forInfoDictionaryKey: "CarShareDevelopmentURL") as? String
        return URL(string: configuredURL ?? "http://127.0.0.1:3000/")!
    }()

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
        hideInputAccessoryView(in: webView)
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

        func webView(_ webView: WKWebView, didFinish navigation: WKNavigation?) {
            hideInputAccessoryView(in: webView)
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
