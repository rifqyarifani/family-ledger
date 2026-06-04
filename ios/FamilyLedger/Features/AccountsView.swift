import SwiftUI

struct AccountsView: View {
    @Bindable var model: AppModel
    @State private var selected: Account?
    @State private var creating = false

    var body: some View {
        NavigationStack {
            List {
                Section("Shared") {
                    ForEach(accounts.filter { $0.ownerMemberId == nil }) { accountRow($0) }
                }
                ForEach(model.reference?.members ?? []) { member in
                    let memberAccounts = accounts.filter { $0.ownerMemberId == member.id }
                    if !memberAccounts.isEmpty {
                        Section(member.name) { ForEach(memberAccounts) { accountRow($0) } }
                    }
                }
            }
            .navigationTitle("Accounts")
            .toolbar { Button { creating = true } label: { Image(systemName: "plus") } }
            .refreshable { await model.refresh() }
            .sheet(item: $selected) { AccountEditorView(model: model, account: $0) }
            .sheet(isPresented: $creating) { AccountEditorView(model: model, account: nil) }
        }
    }

    private var accounts: [Account] { model.dashboard?.accounts ?? model.reference?.accounts ?? [] }

    private func accountRow(_ account: Account) -> some View {
        HStack {
            Image(systemName: account.type == "cash" ? "banknote" : account.type == "savings" ? "building.columns" : "creditcard")
                .frame(width: 40, height: 40).background(Color.ledgerSage, in: Circle())
            VStack(alignment: .leading) {
                Text(account.name).font(.headline)
                Text(account.type.capitalized).font(.caption).foregroundStyle(.secondary)
            }
            Spacer()
            Text(Formatters.money(model.dashboard?.accountBalances[account.id] ?? account.openingBalance)).font(.subheadline.bold())
        }
        .contentShape(Rectangle())
        .onTapGesture { selected = account }
        .swipeActions {
            Button("Delete", role: .destructive) { Task { await model.deleteResource("accounts", id: account.id) } }
        }
        .accessibilityElement(children: .combine)
    }
}
