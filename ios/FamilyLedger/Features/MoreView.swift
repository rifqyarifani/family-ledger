import SwiftUI

struct MoreView: View {
    @Bindable var model: AppModel
    @State private var firstName = ""
    @State private var lastName = ""
    @State private var householdName = ""

    var body: some View {
        NavigationStack {
            List {
                Section("Insights and management") {
                    NavigationLink("Reports") { ReportsView(model: model) }
                    NavigationLink("Family") { FamilyManagementView(model: model) }
                    NavigationLink("Categories") { CategoryManagementView(model: model) }
                }
                Section("Household") {
                    LabeledContent("Name", value: model.household?.name ?? "")
                    LabeledContent("Invite code", value: model.household?.inviteCode ?? "")
                    LabeledContent("Role", value: model.household?.role.capitalized ?? "")
                }
                Section("Profile settings") {
                    TextField("First name", text: $firstName)
                    TextField("Last name", text: $lastName)
                    Button("Save profile") { Task { await model.updateProfile(firstName: firstName, lastName: lastName) } }
                }
                if model.household?.role == "owner" {
                    Section("Household settings") {
                        TextField("Household name", text: $householdName)
                        Button("Save household") { Task { await model.updateHousehold(name: householdName) } }
                    }
                }
                Section {
                    Button("Sign out", role: .destructive) { Task { await model.signOut() } }
                }
            }
            .navigationTitle("More")
            .onAppear {
                firstName = model.profile?.firstName ?? ""
                lastName = model.profile?.lastName ?? ""
                householdName = model.household?.name ?? ""
            }
        }
    }
}
