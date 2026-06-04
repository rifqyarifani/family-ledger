import SwiftUI

@main
struct FamilyLedgerApp: App {
    @State private var model = AppModel()

    var body: some Scene {
        WindowGroup {
            AppRootView(model: model)
                .tint(.ledgerInk)
                .task { await model.start() }
        }
    }
}
