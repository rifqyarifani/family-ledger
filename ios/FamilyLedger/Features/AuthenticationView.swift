import SwiftUI

struct AuthenticationView: View {
    @Bindable var model: AppModel
    @State private var isSignUp = false
    @State private var firstName = ""
    @State private var lastName = ""
    @State private var email = ""
    @State private var password = ""

    var body: some View {
        NavigationStack {
            ScrollView {
                VStack(alignment: .leading, spacing: 24) {
                    VStack(alignment: .leading, spacing: 8) {
                        Text("FamilyLedger").font(.largeTitle.bold())
                        Text("Simple money tracking for your household.").foregroundStyle(.secondary)
                    }
                    .padding(.top, 56)

                    VStack(spacing: 16) {
                        if isSignUp {
                            TextField("First name", text: $firstName).textContentType(.givenName)
                            TextField("Last name", text: $lastName).textContentType(.familyName)
                        }
                        TextField("Email", text: $email)
                            .textContentType(.emailAddress).ledgerEmailInput()
                        SecureField("Password", text: $password).textContentType(isSignUp ? .newPassword : .password)
                    }
                    .textFieldStyle(.roundedBorder)

                    Button(isSignUp ? "Create account" : "Sign in") {
                        Task {
                            if isSignUp {
                                await model.signUp(firstName: firstName, lastName: lastName, email: email, password: password)
                            } else {
                                await model.signIn(email: email, password: password)
                            }
                        }
                    }
                    .buttonStyle(PrimaryButtonStyle())
                    .disabled(email.isEmpty || password.count < 6 || (isSignUp && firstName.isEmpty))

                    Button(isSignUp ? "Already have an account? Sign in" : "New to FamilyLedger? Create account") {
                        isSignUp.toggle()
                    }
                    .frame(maxWidth: .infinity)
                    if !isSignUp {
                        Button("Forgot password?") { Task { await model.requestPasswordReset(email: email) } }
                            .frame(maxWidth: .infinity)
                    }
                }
                .padding(24)
                .frame(maxWidth: 520)
                .frame(maxWidth: .infinity)
            }
            .background(Color.ledgerSage.opacity(0.65))
        }
    }
}

struct OnboardingView: View {
    @Bindable var model: AppModel
    @State private var mode = 0
    @State private var householdName = ""
    @State private var inviteCode = ""

    var body: some View {
        NavigationStack {
            Form {
                Section {
                    Picker("Household setup", selection: $mode) {
                        Text("Create").tag(0)
                        Text("Join").tag(1)
                    }
                    .pickerStyle(.segmented)
                }
                Section {
                    if mode == 0 {
                        TextField("Household name", text: $householdName)
                    } else {
                        TextField("6-character invite code", text: $inviteCode)
                            .ledgerUppercaseInput()
                    }
                } footer: {
                    Text(mode == 0 ? "You will become the household owner." : "Ask the household owner for the invite code.")
                }
                Section {
                    Button(mode == 0 ? "Create household" : "Join household") {
                        Task {
                            if mode == 0 { await model.createHousehold(name: householdName) }
                            else { await model.joinHousehold(code: inviteCode) }
                        }
                    }
                    .disabled(mode == 0 ? householdName.isEmpty : inviteCode.isEmpty)
                }
                Section {
                    Button("Sign out", role: .destructive) { Task { await model.signOut() } }
                }
            }
            .navigationTitle("Set up your family")
        }
    }
}
