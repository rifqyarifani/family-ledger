import Foundation

struct Session: Codable {
    let accessToken: String
    let refreshToken: String
    let expiresAt: Int?

    enum CodingKeys: String, CodingKey {
        case accessToken = "access_token"
        case refreshToken = "refresh_token"
        case expiresAt = "expires_at"
    }
}

struct AuthResponse: Codable {
    let accessToken: String?
    let refreshToken: String?
    let expiresAt: Int?

    enum CodingKeys: String, CodingKey {
        case accessToken = "access_token"
        case refreshToken = "refresh_token"
        case expiresAt = "expires_at"
    }

    var session: Session? {
        guard let accessToken, let refreshToken else { return nil }
        return Session(accessToken: accessToken, refreshToken: refreshToken, expiresAt: expiresAt)
    }
}

struct Profile: Codable {
    let id: String
    let email: String
    var firstName: String
    var lastName: String
    let displayName: String
}

struct Household: Codable {
    let id: String
    var name: String
    let inviteCode: String
    let role: String
}

struct FamilyMember: Codable, Identifiable, Hashable {
    let id: String
    let name: String
    let role: String
    let email: String?
}

struct Account: Codable, Identifiable, Hashable {
    let id: String
    let name: String
    let type: String
    let openingBalance: Double
    let iconColor: String?
    let ownerMemberId: String?
}

struct Category: Codable, Identifiable, Hashable {
    let id: String
    let name: String
    let type: String
    let color: String?
    let icon: String?
}

struct ReferenceData: Codable {
    let members: [FamilyMember]
    let accounts: [Account]
    let categories: [Category]
}

struct Bootstrap: Codable {
    let profile: Profile
    let household: Household?
    let reference: ReferenceData?
}

struct Transaction: Codable, Identifiable, Hashable {
    let id: String
    let title: String
    let type: String
    let amount: Double
    let category: String
    let categoryId: String?
    let memberId: String
    let memberName: String?
    let accountId: String
    let accountName: String?
    let transferAccountId: String?
    let transferAccountName: String?
    let date: String
    let time: String?
    let createdAt: String
    let note: String?
}

struct TransactionInput: Codable {
    let title: String
    let type: String
    let amount: Double
    let categoryId: String?
    let memberId: String
    let accountId: String
    let transferAccountId: String?
    let date: String
    let time: String?
    let note: String?
}

struct Dashboard: Codable {
    let totalBalance: Double
    let monthlyIncome: Double
    let monthlyExpense: Double
    let savingsRate: Int
    let recentTransactions: [Transaction]
    let accounts: [Account]
    let accountBalances: [String: Double]
}

struct Budget: Codable, Identifiable {
    let id: String
    let categoryId: String
    let month: String
    let limit: Double
    let category: String?
}

struct AccountInput: Codable {
    let name: String
    let type: String
    let openingBalance: Double
    let ownerMemberId: String?
    let iconColor: String?
}

struct BudgetInput: Codable {
    let categoryId: String
    let month: String
    let limit: Double
}

struct GoalInput: Codable {
    let name: String
    let targetAmount: Double
    let dueDate: String
    let accountId: String
}

struct CategoryInput: Codable {
    let name: String
    let type: String
    let color: String?
    let icon: String?
}

struct MemberInput: Codable {
    let name: String
    let role: String
    let email: String
    let note: String?
}

struct SavingsGoal: Codable, Identifiable {
    let id: String
    let name: String
    let targetAmount: Double
    let savedAmount: Double
    let dueDate: String
    let accountId: String
}

struct Planning: Codable {
    let budgets: [Budget]
    let goals: [SavingsGoal]
    let transactions: [Transaction]
    let accounts: [Account]
}

struct APIEnvelope<Value: Decodable>: Decodable {
    let data: Value
}

struct APIErrorEnvelope: Decodable {
    struct Detail: Decodable {
        let code: String
        let message: String
    }
    let error: Detail
}

enum AppError: LocalizedError {
    case message(String)
    var errorDescription: String? {
        switch self { case .message(let message): message }
    }
}
