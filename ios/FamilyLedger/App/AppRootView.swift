import SwiftUI

struct AppRootView: View {
    @Bindable var model: AppModel

    var body: some View {
        ZStack {
            Group {
                if model.session == nil {
                    AuthenticationView(model: model)
                } else if model.profile == nil {
                    ProgressView("Loading FamilyLedger")
                } else if model.household == nil {
                    OnboardingView(model: model)
                } else {
                    MainTabsView(model: model)
                }
            }
            if model.isLoading {
                Color.black.opacity(0.08).ignoresSafeArea()
                ProgressView().padding(24).background(.regularMaterial, in: RoundedRectangle(cornerRadius: 20))
            }
        }
        .alert("FamilyLedger", isPresented: Binding(
            get: { model.errorMessage != nil },
            set: { if !$0 { model.errorMessage = nil } }
        )) {
            Button("OK") { model.errorMessage = nil }
        } message: {
            Text(model.errorMessage ?? "")
        }
    }
}
