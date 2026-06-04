import SwiftUI

struct TransactionsView: View {
    @Bindable var model: AppModel
    @State private var query = ""
    @State private var type = "all"

    var body: some View {
        NavigationStack {
            List {
                Picker("Type", selection: $type) {
                    Text("All").tag("all")
                    Text("Income").tag("income")
                    Text("Expense").tag("expense")
                    Text("Transfer").tag("transfer")
                }
                .pickerStyle(.segmented)
                .listRowBackground(Color.clear)

                if filtered.isEmpty {
                    EmptyStateView(title: "No transactions", message: "Change the filters or add a transaction.")
                        .listRowBackground(Color.clear)
                } else {
                    ForEach(filtered) { transaction in
                        TransactionRow(transaction: transaction)
                            .contentShape(Rectangle())
                            .onTapGesture { model.transactionSheet = transaction }
                            .swipeActions {
                                Button(role: .destructive) { Task { await model.deleteTransaction(transaction) } } label: {
                                    Label("Delete", systemImage: "trash")
                                }
                            }
                    }
                }
            }
            .searchable(text: $query, prompt: "Search transactions")
            .navigationTitle("Transactions")
            .toolbar { AddTransactionButton(model: model) }
            .refreshable { await model.refresh() }
        }
    }

    private var filtered: [Transaction] {
        model.transactions.filter { transaction in
            (type == "all" || transaction.type == type) &&
            (query.isEmpty || transaction.title.localizedCaseInsensitiveContains(query) ||
             transaction.category.localizedCaseInsensitiveContains(query))
        }
    }
}

struct TransactionEditorView: View {
    @Environment(\.dismiss) private var dismiss
    @Bindable var model: AppModel
    let transaction: Transaction?
    @State private var title: String
    @State private var type: String
    @State private var amount: String
    @State private var categoryId: String
    @State private var memberId: String
    @State private var accountId: String
    @State private var destinationId: String
    @State private var date: Date
    @State private var note: String

    init(model: AppModel, transaction: Transaction?) {
        self.model = model
        self.transaction = transaction
        let reference = model.reference
        _title = State(initialValue: transaction?.title ?? "")
        _type = State(initialValue: transaction?.type ?? "expense")
        _amount = State(initialValue: transaction.map { String(format: "%.0f", $0.amount) } ?? "")
        _categoryId = State(initialValue: transaction?.categoryId ?? reference?.categories.first(where: { $0.type == "expense" })?.id ?? "")
        _memberId = State(initialValue: transaction?.memberId ?? reference?.members.first?.id ?? "")
        _accountId = State(initialValue: transaction?.accountId ?? reference?.accounts.first?.id ?? "")
        _destinationId = State(initialValue: transaction?.transferAccountId ?? reference?.accounts.dropFirst().first?.id ?? "")
        let formatter = DateFormatter()
        formatter.dateFormat = "yyyy-MM-dd"
        _date = State(initialValue: transaction.flatMap { formatter.date(from: $0.date) } ?? Date())
        _note = State(initialValue: transaction?.note ?? "")
    }

    var body: some View {
        NavigationStack {
            Form {
                Picker("Type", selection: $type) {
                    Text("Income").tag("income")
                    Text("Expense").tag("expense")
                    Text("Transfer").tag("transfer")
                }
                .pickerStyle(.segmented)
                TextField("Title", text: $title)
                TextField("Amount (Rp)", text: $amount).ledgerNumberInput()
                Picker("Member", selection: $memberId) {
                    ForEach(model.reference?.members ?? []) { Text($0.name).tag($0.id) }
                }
                Picker(type == "transfer" ? "From account" : "Account", selection: $accountId) {
                    ForEach(model.reference?.accounts ?? []) { Text($0.name).tag($0.id) }
                }
                if type == "transfer" {
                    Picker("To account", selection: $destinationId) {
                        ForEach((model.reference?.accounts ?? []).filter { $0.id != accountId }) { Text($0.name).tag($0.id) }
                    }
                } else {
                    Picker("Category", selection: $categoryId) {
                        ForEach((model.reference?.categories ?? []).filter { $0.type == type }) { Text($0.name).tag($0.id) }
                    }
                }
                DatePicker("Date", selection: $date, displayedComponents: .date)
                TextField("Note", text: $note, axis: .vertical)
            }
            .navigationTitle(transaction == nil ? "New transaction" : "Edit transaction")
            .ledgerInlineNavigationTitle()
            .toolbar {
                ToolbarItem(placement: .cancellationAction) { Button("Cancel") { dismiss() } }
                ToolbarItem(placement: .confirmationAction) {
                    Button("Save") {
                        Task {
                            await model.saveTransaction(TransactionInput(
                                title: title, type: type, amount: parsedAmount,
                                categoryId: type == "transfer" ? nil : categoryId,
                                memberId: memberId, accountId: accountId,
                                transferAccountId: type == "transfer" ? destinationId : nil,
                                date: Formatters.isoDate(date), time: nil, note: note
                            ), id: transaction?.id)
                            if model.errorMessage == nil { dismiss() }
                        }
                    }
                    .disabled(title.isEmpty || parsedAmount <= 0 || memberId.isEmpty || accountId.isEmpty)
                }
            }
        }
    }

    private var parsedAmount: Double {
        Double(amount.replacingOccurrences(of: ".", with: "").replacingOccurrences(of: ",", with: ".")) ?? 0
    }
}
