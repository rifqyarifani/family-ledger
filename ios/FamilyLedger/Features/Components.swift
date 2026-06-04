import SwiftUI

struct PrimaryButtonStyle: ButtonStyle {
    func makeBody(configuration: Configuration) -> some View {
        configuration.label
            .font(.headline)
            .foregroundStyle(Color.ledgerInk)
            .frame(maxWidth: .infinity)
            .padding(.vertical, 14)
            .background(Color.ledgerLime.opacity(configuration.isPressed ? 0.7 : 1), in: Capsule())
    }
}

struct SummaryCard: View {
    let title: String
    let value: String
    let systemImage: String

    var body: some View {
        VStack(alignment: .leading, spacing: 12) {
            Image(systemName: systemImage).font(.title2)
            Text(title).font(.caption).foregroundStyle(.secondary)
            Text(value).font(.title3.bold()).minimumScaleFactor(0.7)
        }
        .frame(maxWidth: .infinity, alignment: .leading)
        .padding()
        .background(.background, in: RoundedRectangle(cornerRadius: 20))
        .accessibilityElement(children: .combine)
    }
}

struct TransactionRow: View {
    let transaction: Transaction

    var body: some View {
        HStack(spacing: 12) {
            Image(systemName: icon)
                .frame(width: 38, height: 38)
                .background(color.opacity(0.15), in: Circle())
                .foregroundStyle(color)
            VStack(alignment: .leading, spacing: 3) {
                Text(transaction.title).font(.headline)
                Text("\(transaction.category) · \(transaction.accountName ?? "Account")")
                    .font(.caption).foregroundStyle(.secondary).lineLimit(1)
            }
            Spacer()
            VStack(alignment: .trailing, spacing: 3) {
                Text(prefix + Formatters.money(transaction.amount)).font(.subheadline.bold()).foregroundStyle(color)
                Text(Formatters.date(transaction.date)).font(.caption2).foregroundStyle(.secondary)
            }
        }
        .accessibilityElement(children: .combine)
    }

    private var color: Color {
        transaction.type == "income" ? .green : transaction.type == "expense" ? .red : .blue
    }
    private var prefix: String { transaction.type == "income" ? "+" : transaction.type == "expense" ? "-" : "" }
    private var icon: String { transaction.type == "income" ? "arrow.down.left" : transaction.type == "expense" ? "arrow.up.right" : "arrow.left.arrow.right" }
}

struct EmptyStateView: View {
    let title: String
    let message: String
    var body: some View {
        ContentUnavailableView(title, systemImage: "tray", description: Text(message))
    }
}

extension View {
    @ViewBuilder
    func ledgerEmailInput() -> some View {
#if os(iOS)
        keyboardType(.emailAddress).textInputAutocapitalization(.never).autocorrectionDisabled()
#else
        self
#endif
    }

    @ViewBuilder
    func ledgerNumberInput() -> some View {
#if os(iOS)
        keyboardType(.decimalPad)
#else
        self
#endif
    }

    @ViewBuilder
    func ledgerUppercaseInput() -> some View {
#if os(iOS)
        textInputAutocapitalization(.characters)
#else
        self
#endif
    }

    @ViewBuilder
    func ledgerInlineNavigationTitle() -> some View {
#if os(iOS)
        navigationBarTitleDisplayMode(.inline)
#else
        self
#endif
    }
}
