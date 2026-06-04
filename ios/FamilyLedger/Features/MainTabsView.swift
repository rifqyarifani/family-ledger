import SwiftUI

struct MainTabsView: View {
    @Bindable var model: AppModel

    var body: some View {
        TabView {
            DashboardView(model: model)
                .tabItem { Label("Home", systemImage: "house") }
            TransactionsView(model: model)
                .tabItem { Label("Transactions", systemImage: "list.bullet.rectangle") }
            PlanningView(model: model)
                .tabItem { Label("Plan", systemImage: "chart.pie") }
            AccountsView(model: model)
                .tabItem { Label("Accounts", systemImage: "wallet.bifold") }
            MoreView(model: model)
                .tabItem { Label("More", systemImage: "ellipsis.circle") }
        }
        .sheet(item: $model.transactionSheet) { transaction in
            TransactionEditorView(model: model, transaction: transaction)
        }
        .sheet(isPresented: $model.isCreatingTransaction) {
            TransactionEditorView(model: model, transaction: nil)
        }
    }
}

struct AddTransactionButton: View {
    @Bindable var model: AppModel

    var body: some View {
        Button {
            model.isCreatingTransaction = true
        } label: {
            Image(systemName: "plus")
        }
        .accessibilityLabel("Add transaction")
    }
}
