import Foundation

struct AppConfig {
    let mobileAPIBaseURL: URL
    let supabaseURL: URL
    let supabaseKey: String

    static func load(bundle: Bundle = .main) -> AppConfig {
        func value(_ key: String) -> String {
            (bundle.object(forInfoDictionaryKey: key) as? String)?
                .trimmingCharacters(in: .whitespacesAndNewlines) ?? ""
        }

        let api = value("MOBILE_API_BASE_URL")
        let supabase = value("SUPABASE_URL")
        let key = value("SUPABASE_PUBLISHABLE_KEY")
        precondition(!api.isEmpty && !supabase.isEmpty && !key.isEmpty, "Configure FamilyLedger/Config/Local.xcconfig")
        return AppConfig(
            mobileAPIBaseURL: URL(string: api)!,
            supabaseURL: URL(string: supabase)!,
            supabaseKey: key
        )
    }
}
