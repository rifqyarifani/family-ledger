import Foundation
import SwiftUI

enum Formatters {
    static let rupiah: NumberFormatter = {
        let formatter = NumberFormatter()
        formatter.locale = Locale(identifier: "id_ID")
        formatter.numberStyle = .currency
        formatter.currencyCode = "IDR"
        formatter.maximumFractionDigits = 0
        return formatter
    }()

    static func money(_ value: Double) -> String {
        rupiah.string(from: NSNumber(value: value)) ?? "Rp0"
    }

    static func date(_ value: String) -> String {
        let input = DateFormatter()
        input.locale = Locale(identifier: "en_US_POSIX")
        input.dateFormat = "yyyy-MM-dd"
        guard let date = input.date(from: value) else { return value }
        return date.formatted(.dateTime.locale(Locale(identifier: "id_ID")).day().month(.wide).year())
    }

    static func isoDate(_ date: Date) -> String {
        let formatter = DateFormatter()
        formatter.locale = Locale(identifier: "en_US_POSIX")
        formatter.dateFormat = "yyyy-MM-dd"
        return formatter.string(from: date)
    }
}

extension Color {
    static let ledgerLime = Color(red: 0.624, green: 0.91, blue: 0.439)
    static let ledgerInk = Color(red: 0.055, green: 0.059, blue: 0.047)
    static let ledgerSage = Color(red: 0.91, green: 0.922, blue: 0.902)
}
