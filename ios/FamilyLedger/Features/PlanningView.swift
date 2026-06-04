import SwiftUI

struct PlanningView: View {
    @Bindable var model: AppModel
    @State private var selection = 0
    @State private var selectedBudget: Budget?
    @State private var selectedGoal: SavingsGoal?
    @State private var creatingBudget = false
    @State private var creatingGoal = false

    var body: some View {
        NavigationStack {
            VStack {
                Picker("Plan", selection: $selection) {
                    Text("Budgets").tag(0)
                    Text("Savings goals").tag(1)
                }
                .pickerStyle(.segmented)
                .padding()

                List {
                    if selection == 0 {
                        if model.planning?.budgets.isEmpty != false {
                            EmptyStateView(title: "No budgets", message: "Create a category budget for this month.")
                        }
                        ForEach(model.planning?.budgets ?? []) { budget in
                            VStack(alignment: .leading, spacing: 10) {
                                HStack {
                                    Text(budget.category ?? "Uncategorized").font(.headline)
                                    Spacer()
                                    Text(Formatters.money(budget.limit)).font(.subheadline.bold())
                                }
                                ProgressView(value: min(spent(for: budget) / max(budget.limit, 1), 1))
                                    .tint(spent(for: budget) > budget.limit ? .red : .ledgerLime)
                                Text("\(Formatters.money(spent(for: budget))) spent")
                                    .font(.caption).foregroundStyle(.secondary)
                            }
                            .padding(.vertical, 6)
                            .contentShape(Rectangle()).onTapGesture { selectedBudget = budget }
                            .swipeActions { Button("Delete", role: .destructive) { Task { await model.deleteResource("budgets", id: budget.id) } } }
                        }
                    } else {
                        if model.planning?.goals.isEmpty != false {
                            EmptyStateView(title: "No savings goals", message: "Create a goal linked to a savings account.")
                        }
                        ForEach(model.planning?.goals ?? []) { goal in
                            VStack(alignment: .leading, spacing: 10) {
                                Text(goal.name).font(.headline)
                                ProgressView(value: min(goal.savedAmount / max(goal.targetAmount, 1), 1)).tint(.ledgerLime)
                                Text("\(Formatters.money(goal.savedAmount)) of \(Formatters.money(goal.targetAmount))")
                                    .font(.caption).foregroundStyle(.secondary)
                            }
                            .padding(.vertical, 6)
                            .contentShape(Rectangle()).onTapGesture { selectedGoal = goal }
                            .swipeActions { Button("Delete", role: .destructive) { Task { await model.deleteResource("goals", id: goal.id) } } }
                        }
                    }
                }
                .listStyle(.plain)
            }
            .navigationTitle("Plan")
            .toolbar {
                Button {
                    if selection == 0 { creatingBudget = true } else { creatingGoal = true }
                } label: { Image(systemName: "plus") }
            }
            .refreshable { await model.refresh() }
            .sheet(item: $selectedBudget) { BudgetEditorView(model: model, budget: $0) }
            .sheet(item: $selectedGoal) { GoalEditorView(model: model, goal: $0) }
            .sheet(isPresented: $creatingBudget) { BudgetEditorView(model: model, budget: nil) }
            .sheet(isPresented: $creatingGoal) { GoalEditorView(model: model, goal: nil) }
        }
    }

    private func spent(for budget: Budget) -> Double {
        (model.planning?.transactions ?? [])
            .filter { $0.type == "expense" && $0.category == budget.category }
            .reduce(0) { $0 + $1.amount }
    }
}
