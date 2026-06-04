import XCTest
@testable import FamilyLedger

final class FormattingTests: XCTestCase {
    func testRupiahFormattingUsesIDR() {
        XCTAssertTrue(Formatters.money(1_500_000).contains("1.500.000"))
    }

    func testISODateFormatting() {
        XCTAssertEqual(Formatters.isoDate(Date(timeIntervalSince1970: 0)), "1970-01-01")
    }
}
