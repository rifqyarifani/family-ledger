import Foundation
import Security

struct KeychainStore {
    private let service = "com.familyledger.ios"
    private let account = "session"

    func save(_ session: Session) throws {
        let data = try JSONEncoder().encode(session)
        SecItemDelete(query() as CFDictionary)
        var values = query()
        values[kSecValueData as String] = data
        let status = SecItemAdd(values as CFDictionary, nil)
        guard status == errSecSuccess else { throw AppError.message("Could not save session.") }
    }

    func load() -> Session? {
        var values = query()
        values[kSecReturnData as String] = true
        values[kSecMatchLimit as String] = kSecMatchLimitOne
        var result: AnyObject?
        guard SecItemCopyMatching(values as CFDictionary, &result) == errSecSuccess,
              let data = result as? Data else { return nil }
        return try? JSONDecoder().decode(Session.self, from: data)
    }

    func clear() {
        SecItemDelete(query() as CFDictionary)
    }

    private func query() -> [String: Any] {
        [kSecClass as String: kSecClassGenericPassword, kSecAttrService as String: service, kSecAttrAccount as String: account]
    }
}

actor AuthService {
    private let config: AppConfig
    private let store = KeychainStore()

    init(config: AppConfig) { self.config = config }
    func storedSession() -> Session? { store.load() }

    func signIn(email: String, password: String) async throws -> Session {
        try await request(path: "token?grant_type=password", body: ["email": email, "password": password])
    }

    func signUp(firstName: String, lastName: String, email: String, password: String) async throws -> Session? {
        let response: AuthResponse = try await rawRequest(path: "signup", body: [
            "email": email, "password": password,
            "data": ["first_name": firstName, "last_name": lastName]
        ])
        if let session = response.session { try store.save(session) }
        return response.session
    }

    func refresh(_ session: Session) async throws -> Session {
        try await request(path: "token?grant_type=refresh_token", body: ["refresh_token": session.refreshToken])
    }

    func signOut() { store.clear() }

    func requestPasswordReset(email: String) async throws {
        var request = URLRequest(url: config.supabaseURL.appendingPathComponent("auth/v1/recover"))
        request.httpMethod = "POST"
        request.setValue(config.supabaseKey, forHTTPHeaderField: "apikey")
        request.setValue("application/json", forHTTPHeaderField: "Content-Type")
        request.httpBody = try JSONEncoder().encode(["email": email])
        let (_, response) = try await URLSession.shared.data(for: request)
        guard let http = response as? HTTPURLResponse, 200..<300 ~= http.statusCode else {
            throw AppError.message("Could not send the password reset email.")
        }
    }

    private func request(path: String, body: [String: Any]) async throws -> Session {
        let response: AuthResponse = try await rawRequest(path: path, body: body)
        guard let session = response.session else { throw AppError.message("Authentication did not return a session.") }
        try store.save(session)
        return session
    }

    private func rawRequest<T: Decodable>(path: String, body: [String: Any]) async throws -> T {
        var components = URLComponents(url: config.supabaseURL.appendingPathComponent("auth/v1/\(path.split(separator: "?")[0])"), resolvingAgainstBaseURL: false)!
        components.percentEncodedQuery = path.split(separator: "?", maxSplits: 1).dropFirst().first.map(String.init)
        var request = URLRequest(url: components.url!)
        request.httpMethod = "POST"
        request.setValue(config.supabaseKey, forHTTPHeaderField: "apikey")
        request.setValue("application/json", forHTTPHeaderField: "Content-Type")
        request.httpBody = try JSONSerialization.data(withJSONObject: body)
        let (data, response) = try await URLSession.shared.data(for: request)
        guard let http = response as? HTTPURLResponse, 200..<300 ~= http.statusCode else {
            let payload = (try? JSONSerialization.jsonObject(with: data) as? [String: Any])
            throw AppError.message(payload?["msg"] as? String ?? payload?["error_description"] as? String ?? "Authentication failed.")
        }
        return try JSONDecoder().decode(T.self, from: data)
    }
}

actor APIClient {
    private let baseURL: URL
    init(config: AppConfig) { baseURL = config.mobileAPIBaseURL }

    func get<T: Decodable>(_ path: String, session: Session) async throws -> T {
        try await request(path, method: "GET", session: session, body: Optional<String>.none)
    }

    func send<Input: Encodable, Output: Decodable>(_ path: String, method: String, session: Session, body: Input) async throws -> Output {
        try await request(path, method: method, session: session, body: body)
    }

    func send<Input: Encodable>(_ path: String, method: String, session: Session, body: Input) async throws {
        let _: EmptyResponse = try await request(path, method: method, session: session, body: body)
    }

    private func request<Input: Encodable, Output: Decodable>(
        _ path: String, method: String, session: Session, body: Input?
    ) async throws -> Output {
        var request = URLRequest(url: endpoint(path))
        request.httpMethod = method
        request.setValue("Bearer \(session.accessToken)", forHTTPHeaderField: "Authorization")
        request.setValue("application/json", forHTTPHeaderField: "Content-Type")
        if let body { request.httpBody = try JSONEncoder().encode(body) }
        let (data, response) = try await URLSession.shared.data(for: request)
        guard let http = response as? HTTPURLResponse, 200..<300 ~= http.statusCode else {
            if let apiError = try? JSONDecoder().decode(APIErrorEnvelope.self, from: data) {
                throw AppError.message(apiError.error.message)
            }
            throw AppError.message("The server request failed.")
        }
        return try JSONDecoder().decode(APIEnvelope<Output>.self, from: data).data
    }

    private func endpoint(_ path: String) -> URL {
        let pieces = path.split(separator: "?", maxSplits: 1).map(String.init)
        var components = URLComponents(url: baseURL.appendingPathComponent(pieces[0]), resolvingAgainstBaseURL: false)!
        components.percentEncodedQuery = pieces.count > 1 ? pieces[1] : nil
        return components.url!
    }
}

private struct EmptyResponse: Decodable {}
