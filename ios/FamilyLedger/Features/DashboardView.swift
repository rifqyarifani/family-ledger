import SwiftUI

struct DashboardView: View {
    @Bindable var model: AppModel

    var body: some View {
        NavigationStack {
            ScrollView {
                if let dashboard = model.dashboard {
                    LazyVGrid(columns: [GridItem(.adaptive(minimum: 155), spacing: 12)], spacing: 12) {
                        SummaryCard(title: "Total balance", value: Formatters.money(dashboard.totalBalance), systemImage: "wallet.bifold")
                        SummaryCard(title: "Monthly income", value: Formatters.money(dashboard.monthlyIncome), systemImage: "arrow.down.left")
                        SummaryCard(title: "Monthly expense", value: Formatters.money(dashboard.monthlyExpense), systemImage: "arrow.up.right")
                        SummaryCard(title: "Savings rate", value: "\(dashboard.savingsRate)%", systemImage: "banknote")
                    }
                    .padding(.horizontal)

                    VStack(alignment: .leading, spacing: 12) {
                        Text("Recent transactions").font(.title2.bold())
                        if dashboard.recentTransactions.isEmpty {
                            EmptyStateView(title: "No transactions", message: "Add your first household transaction.")
                        } else {
                            ForEach(dashboard.recentTransactions) { TransactionRow(transaction: $0) }
                        }
                    }
                    .padding()
                    .background(.background, in: RoundedRectangle(cornerRadius: 24))
                    .padding()
                } else {
                    EmptyStateView(title: "Dashboard unavailable", message: "Pull to refresh your household summary.")
                }
            }
            .background(Color.ledgerSage.opacity(0.55))
            .navigationTitle(model.household?.name ?? "FamilyLedger")
            .toolbar { AddTransactionButton(model: model) }
            .refreshable { await model.refresh() }
        }
    }
}
