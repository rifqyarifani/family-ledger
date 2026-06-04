import SwiftUI

struct AccountEditorView: View {
    @Environment(\.dismiss) private var dismiss
    @Bindable var model: AppModel
    let account: Account?
    @State private var name: String
    @State private var type: String
    @State private var openingBalance: String
    @State private var ownerMemberId: String

    init(model: AppModel, account: Account?) {
        self.model = model
        self.account = account
        _name = State(initialValue: account?.name ?? "")
        _type = State(initialValue: account?.type ?? "bank")
        _openingBalance = State(initialValue: account.map { String(format: "%.0f", $0.openingBalance) } ?? "0")
        _ownerMemberId = State(initialValue: account?.ownerMemberId ?? "")
    }

    var body: some View {
        editorForm(title: account == nil ? "New account" : "Edit account") {
            TextField("Account name", text: $name)
            Picker("Type", selection: $type) {
                Text("Cash").tag("cash"); Text("Bank").tag("bank"); Text("Credit").tag("credit"); Text("Savings").tag("savings")
            }
            TextField("Opening balance", text: $openingBalance).ledgerNumberInput()
            Picker("Owner", selection: $ownerMemberId) {
                Text("Shared").tag("")
                ForEach(model.reference?.members ?? []) { Text($0.name).tag($0.id) }
            }
        } save: {
            await model.saveResource("accounts", id: account?.id, input: AccountInput(
                name: name, type: type, openingBalance: Double(openingBalance) ?? 0,
                ownerMemberId: ownerMemberId.isEmpty ? nil : ownerMemberId, iconColor: account?.iconColor
            ))
        }
    }

    @ViewBuilder private func editorForm<Content: View>(title: String, @ViewBuilder content: () -> Content, save: @escaping () async -> Void) -> some View {
        NavigationStack {
            Form { content() }
                .navigationTitle(title).ledgerInlineNavigationTitle()
                .toolbar {
                    ToolbarItem(placement: .cancellationAction) { Button("Cancel") { dismiss() } }
                    ToolbarItem(placement: .confirmationAction) { Button("Save") { Task { await save(); if model.errorMessage == nil { dismiss() } } }.disabled(name.isEmpty) }
                }
        }
    }
}

struct BudgetEditorView: View {
    @Environment(\.dismiss) private var dismiss
    @Bindable var model: AppModel
    let budget: Budget?
    @State private var categoryId: String
    @State private var month: String
    @State private var limit: String

    init(model: AppModel, budget: Budget?) {
        self.model = model
        self.budget = budget
        _categoryId = State(initialValue: budget?.categoryId ?? model.reference?.categories.first(where: { $0.type == "expense" })?.id ?? "")
        _month = State(initialValue: budget?.month ?? AppModel.monthKey)
        _limit = State(initialValue: budget.map { String(format: "%.0f", $0.limit) } ?? "")
    }

    var body: some View {
        NavigationStack {
            Form {
                Picker("Expense category", selection: $categoryId) {
                    ForEach((model.reference?.categories ?? []).filter { $0.type == "expense" }) { Text($0.name).tag($0.id) }
                }
                TextField("Month (YYYY-MM)", text: $month)
                TextField("Limit", text: $limit).ledgerNumberInput()
            }
            .navigationTitle(budget == nil ? "New budget" : "Edit budget").ledgerInlineNavigationTitle()
            .toolbar {
                ToolbarItem(placement: .cancellationAction) { Button("Cancel") { dismiss() } }
                ToolbarItem(placement: .confirmationAction) {
                    Button("Save") {
                        Task {
                            await model.saveResource("budgets", id: budget?.id, input: BudgetInput(categoryId: categoryId, month: month, limit: Double(limit) ?? 0))
                            if model.errorMessage == nil { dismiss() }
                        }
                    }.disabled(categoryId.isEmpty || limit.isEmpty)
                }
            }
        }
    }
}

struct GoalEditorView: View {
    @Environment(\.dismiss) private var dismiss
    @Bindable var model: AppModel
    let goal: SavingsGoal?
    @State private var accountId: String
    @State private var target: String
    @State private var dueDate: Date

    init(model: AppModel, goal: SavingsGoal?) {
        self.model = model
        self.goal = goal
        let accounts = (model.reference?.accounts ?? []).filter { $0.type == "savings" }
        _accountId = State(initialValue: goal?.accountId ?? accounts.first?.id ?? "")
        _target = State(initialValue: goal.map { String(format: "%.0f", $0.targetAmount) } ?? "")
        let formatter = DateFormatter(); formatter.dateFormat = "yyyy-MM-dd"
        _dueDate = State(initialValue: goal.flatMap { formatter.date(from: $0.dueDate) } ?? Date())
    }

    var body: some View {
        NavigationStack {
            Form {
                Picker("Savings account", selection: $accountId) {
                    ForEach((model.reference?.accounts ?? []).filter { $0.type == "savings" }) { Text($0.name).tag($0.id) }
                }
                TextField("Target amount", text: $target).ledgerNumberInput()
                DatePicker("Due date", selection: $dueDate, displayedComponents: .date)
            }
            .navigationTitle(goal == nil ? "New goal" : "Edit goal").ledgerInlineNavigationTitle()
            .toolbar {
                ToolbarItem(placement: .cancellationAction) { Button("Cancel") { dismiss() } }
                ToolbarItem(placement: .confirmationAction) {
                    Button("Save") {
                        let name = model.reference?.accounts.first(where: { $0.id == accountId })?.name ?? "Savings goal"
                        Task {
                            await model.saveResource("goals", id: goal?.id, input: GoalInput(name: name, targetAmount: Double(target) ?? 0, dueDate: Formatters.isoDate(dueDate), accountId: accountId))
                            if model.errorMessage == nil { dismiss() }
                        }
                    }.disabled(accountId.isEmpty || target.isEmpty)
                }
            }
        }
    }
}

struct CategoryManagementView: View {
    @Bindable var model: AppModel
    @State private var selected: Category?
    @State private var creating = false

    var body: some View {
        List {
            ForEach((model.reference?.categories ?? []).filter { $0.type != "transfer" }) { category in
                Label(category.name, systemImage: category.type == "income" ? "arrow.down.left" : "arrow.up.right")
                    .contentShape(Rectangle()).onTapGesture { selected = category }
                    .swipeActions { Button("Delete", role: .destructive) { Task { await model.deleteResource("categories", id: category.id) } } }
            }
        }
        .navigationTitle("Categories")
        .toolbar { Button { creating = true } label: { Image(systemName: "plus") } }
        .sheet(item: $selected) { CategoryEditorView(model: model, category: $0) }
        .sheet(isPresented: $creating) { CategoryEditorView(model: model, category: nil) }
    }
}

struct CategoryEditorView: View {
    @Environment(\.dismiss) private var dismiss
    @Bindable var model: AppModel
    let category: Category?
    @State private var name: String
    @State private var type: String
    @State private var color: String

    init(model: AppModel, category: Category?) {
        self.model = model; self.category = category
        _name = State(initialValue: category?.name ?? ""); _type = State(initialValue: category?.type ?? "expense")
        _color = State(initialValue: category?.color ?? "#9FE870")
    }

    var body: some View {
        NavigationStack {
            Form {
                TextField("Name", text: $name)
                Picker("Type", selection: $type) { Text("Income").tag("income"); Text("Expense").tag("expense") }.pickerStyle(.segmented)
                TextField("Color hex", text: $color)
            }
            .navigationTitle(category == nil ? "New category" : "Edit category").ledgerInlineNavigationTitle()
            .toolbar {
                ToolbarItem(placement: .cancellationAction) { Button("Cancel") { dismiss() } }
                ToolbarItem(placement: .confirmationAction) {
                    Button("Save") { Task { await model.saveResource("categories", id: category?.id, input: CategoryInput(name: name, type: type, color: color, icon: category?.icon)); if model.errorMessage == nil { dismiss() } } }.disabled(name.isEmpty)
                }
            }
        }
    }
}

struct FamilyManagementView: View {
    @Bindable var model: AppModel
    @State private var selected: FamilyMember?
    @State private var creating = false

    var body: some View {
        List {
            ForEach(model.reference?.members ?? []) { member in
                LabeledContent(member.name, value: member.role.capitalized)
                    .contentShape(Rectangle()).onTapGesture { if model.household?.role == "owner" { selected = member } }
                    .swipeActions {
                        if model.household?.role == "owner" {
                            Button("Delete", role: .destructive) { Task { await model.deleteResource("members", id: member.id) } }
                        }
                    }
            }
        }
        .navigationTitle("Family")
        .toolbar { if model.household?.role == "owner" { Button { creating = true } label: { Image(systemName: "plus") } } }
        .sheet(item: $selected) { MemberEditorView(model: model, member: $0) }
        .sheet(isPresented: $creating) { MemberEditorView(model: model, member: nil) }
    }
}

struct MemberEditorView: View {
    @Environment(\.dismiss) private var dismiss
    @Bindable var model: AppModel
    let member: FamilyMember?
    @State private var name: String
    @State private var email: String
    @State private var role: String
    @State private var note = ""

    init(model: AppModel, member: FamilyMember?) {
        self.model = model; self.member = member
        _name = State(initialValue: member?.name ?? ""); _email = State(initialValue: member?.email ?? "")
        _role = State(initialValue: member?.role ?? "member")
    }

    var body: some View {
        NavigationStack {
            Form {
                TextField("Name", text: $name); TextField("Email", text: $email).ledgerEmailInput()
                Picker("Role", selection: $role) { Text("Member").tag("member"); Text("Owner").tag("owner") }
                TextField("Monthly responsibility note", text: $note, axis: .vertical)
            }
            .navigationTitle(member == nil ? "Add member" : "Edit member").ledgerInlineNavigationTitle()
            .toolbar {
                ToolbarItem(placement: .cancellationAction) { Button("Cancel") { dismiss() } }
                ToolbarItem(placement: .confirmationAction) {
                    Button("Save") { Task { await model.saveResource("members", id: member?.id, input: MemberInput(name: name, role: role, email: email, note: note)); if model.errorMessage == nil { dismiss() } } }.disabled(name.isEmpty || (member == nil && email.isEmpty))
                }
            }
        }
    }
}

struct ReportsView: View {
    @Bindable var model: AppModel
    var body: some View {
        List {
            Section("Current month") {
                LabeledContent("Income", value: Formatters.money(income))
                LabeledContent("Expense", value: Formatters.money(expense))
                LabeledContent("Net cashflow", value: Formatters.money(income - expense))
            }
            Section("Spending by category") {
                ForEach(categoryTotals, id: \.0) { category, amount in LabeledContent(category, value: Formatters.money(amount)) }
            }
            Section("Expense by member") {
                ForEach(memberTotals, id: \.0) { member, amount in LabeledContent(member, value: Formatters.money(amount)) }
            }
        }
        .navigationTitle("Reports")
    }

    private var monthly: [Transaction] { model.transactions.filter { $0.date.hasPrefix(AppModel.monthKey) } }
    private var income: Double { monthly.filter { $0.type == "income" }.reduce(0) { $0 + $1.amount } }
    private var expense: Double { monthly.filter { $0.type == "expense" }.reduce(0) { $0 + $1.amount } }
    private var categoryTotals: [(String, Double)] { totals { $0.category } }
    private var memberTotals: [(String, Double)] { totals { $0.memberName ?? "Unknown" } }
    private func totals(key: (Transaction) -> String) -> [(String, Double)] {
        Dictionary(grouping: monthly.filter { $0.type == "expense" }, by: key)
            .map { ($0.key, $0.value.reduce(0) { $0 + $1.amount }) }.sorted { $0.1 > $1.1 }
    }
}
