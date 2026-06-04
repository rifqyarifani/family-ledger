import Foundation
import Observation

@MainActor
@Observable
final class AppModel {
    var session: Session?
    var profile: Profile?
    var household: Household?
    var reference: ReferenceData?
    var dashboard: Dashboard?
    var transactions: [Transaction] = []
    var planning: Planning?
    var isLoading = false
    var errorMessage: String?
    var transactionSheet: Transaction?
    var isCreatingTransaction = false

    private let auth: AuthService
    private let api: APIClient

    init(config: AppConfig = .load()) {
        auth = AuthService(config: config)
        api = APIClient(config: config)
    }

    func start() async {
        if let stored = await auth.storedSession() {
            if let expiresAt = stored.expiresAt, expiresAt <= Int(Date().timeIntervalSince1970) + 60 {
                session = try? await auth.refresh(stored)
            } else {
                session = stored
            }
        }
        guard session != nil else { return }
        await bootstrap()
    }

    func signIn(email: String, password: String) async {
        await perform {
            self.session = try await self.auth.signIn(email: email, password: password)
            await self.bootstrap()
        }
    }

    func signUp(firstName: String, lastName: String, email: String, password: String) async {
        await perform {
            guard let session = try await self.auth.signUp(firstName: firstName, lastName: lastName, email: email, password: password) else {
                throw AppError.message("Check your email to confirm your account, then sign in.")
            }
            self.session = session
            await self.bootstrap()
        }
    }

    func signOut() async {
        await auth.signOut()
        session = nil
        profile = nil
        household = nil
        reference = nil
        dashboard = nil
        planning = nil
        transactions = []
    }

    func requestPasswordReset(email: String) async {
        await perform {
            guard email.contains("@") else { throw AppError.message("Enter your email address first.") }
            try await self.auth.requestPasswordReset(email: email)
            self.errorMessage = "Password reset email sent."
        }
    }

    func bootstrap() async {
        guard let session else { return }
        await perform {
            let bootstrap: Bootstrap = try await self.api.get("bootstrap", session: session)
            self.profile = bootstrap.profile
            self.household = bootstrap.household
            self.reference = bootstrap.reference
            if bootstrap.household != nil { await self.refresh() }
        }
    }

    func createHousehold(name: String) async {
        await householdAction(["action": "create", "name": name])
    }

    func joinHousehold(code: String) async {
        await householdAction(["action": "join", "code": code])
    }

    private func householdAction(_ payload: [String: String]) async {
        guard let session else { return }
        await perform {
            let _: Household = try await self.api.send("households", method: "POST", session: session, body: payload)
            await self.bootstrap()
        }
    }

    func refresh() async {
        guard let session, household != nil else { return }
        await perform {
            async let dashboard: Dashboard = self.api.get("dashboard", session: session)
            async let transactions: [Transaction] = self.api.get("transactions?limit=200", session: session)
            async let planning: Planning = self.api.get("planning?month=\(Self.monthKey)", session: session)
            self.dashboard = try await dashboard
            self.transactions = try await transactions
            self.planning = try await planning
        }
    }

    func saveTransaction(_ input: TransactionInput, id: String?) async {
        guard let session else { return }
        await perform {
            let path = id.map { "transactions/\($0)" } ?? "transactions"
            let method = id == nil ? "POST" : "PATCH"
            let _: Transaction = try await self.api.send(path, method: method, session: session, body: input)
            self.transactionSheet = nil
            await self.refresh()
        }
    }

    func deleteTransaction(_ transaction: Transaction) async {
        guard let session else { return }
        await perform {
            let _: DeleteResponse = try await self.api.send("transactions/\(transaction.id)", method: "DELETE", session: session, body: EmptyBody())
            await self.refresh()
        }
    }

    func updateProfile(firstName: String, lastName: String) async {
        guard let session else { return }
        await perform {
            let _: SavedResponse = try await self.api.send("settings", method: "PATCH", session: session, body: [
                "firstName": firstName, "lastName": lastName
            ])
            await self.bootstrap()
        }
    }

    func updateHousehold(name: String) async {
        guard let session else { return }
        await perform {
            let _: SavedResponse = try await self.api.send("settings", method: "PATCH", session: session, body: ["householdName": name])
            await self.bootstrap()
        }
    }

    func saveResource<Input: Encodable>(_ resource: String, id: String?, input: Input) async {
        guard let session else { return }
        await perform {
            let path = id.map { "resources/\(resource)/\($0)" } ?? "resources/\(resource)"
            let _: SavedResponse = try await self.api.send(path, method: id == nil ? "POST" : "PATCH", session: session, body: input)
            await self.bootstrap()
        }
    }

    func deleteResource(_ resource: String, id: String) async {
        guard let session else { return }
        await perform {
            let _: DeleteResponse = try await self.api.send("resources/\(resource)/\(id)", method: "DELETE", session: session, body: EmptyBody())
            await self.bootstrap()
        }
    }

    private func perform(_ work: () async throws -> Void) async {
        isLoading = true
        errorMessage = nil
        defer { isLoading = false }
        do { try await work() } catch { errorMessage = error.localizedDescription }
    }

    static var monthKey: String {
        let formatter = DateFormatter()
        formatter.dateFormat = "yyyy-MM"
        return formatter.string(from: Date())
    }
}

private struct EmptyBody: Codable {}
private struct DeleteResponse: Codable { let deleted: Bool }
private struct SavedResponse: Codable { let saved: Bool }
