"use client";

import { ArrowDownRight, ArrowUpRight, Plus, Tags } from "lucide-react";
import {
  createCategoryAction,
  deleteCategoryAction,
  updateCategoryAction,
} from "@/app/app/categories/actions";
import { Button } from "@/components/button";
import { Card } from "@/components/card";
import { CategoryForm } from "@/components/category-form";
import { ConfirmDialog } from "@/components/confirm-dialog";
import { EmptyState } from "@/components/empty-state";
import { Modal } from "@/components/modal";
import { PageIntro } from "@/components/page-intro";
import { ResourceActions } from "@/components/resource-actions";
import { useCrudDialog } from "@/hooks/use-crud-dialog";
import { useRunAction } from "@/hooks/use-run-action";
import type { Category } from "@/types/finance";

const defaultColors = {
  income: "#2ead4b",
  expense: "#d03238",
};

function CategorySection({
  title,
  icon,
  iconBg,
  iconColor,
  categories,
  onEdit,
  onDelete,
  emptyMessage,
}: {
  title: string;
  icon: React.ReactNode;
  iconBg: string;
  iconColor: string;
  categories: Category[];
  onEdit: (category: Category) => void;
  onDelete: (category: Category) => void;
  emptyMessage: string;
}) {
  return (
    <section>
      <div className="mb-4 flex items-center gap-3">
        <div
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full"
          style={{ backgroundColor: iconBg }}
        >
          <span style={{ color: iconColor }}>{icon}</span>
        </div>
        <h2 className="text-sm font-semibold text-ink">{title}</h2>
        <span className="rounded-full bg-surface px-2.5 py-0.5 text-xs font-medium text-ink-secondary">
          {categories.length}
        </span>
      </div>

      {categories.length > 0 ? (
        <div className="grid gap-3">
          {categories.map((category) => {
            const dotColor = category.color || (category.type === "income" ? defaultColors.income : category.type === "expense" ? defaultColors.expense : "#868685");

            return (
              <Card key={category.id}>
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <span
                      className="inline-block h-3 w-3 shrink-0 rounded-full"
                      style={{ backgroundColor: dotColor }}
                    />
                    <span className="text-sm font-medium text-ink">
                      {category.name}
                    </span>
                  </div>
                  <ResourceActions
                    editLabel={`Edit ${category.name}`}
                    deleteLabel={`Delete ${category.name}`}
                    onEdit={() => onEdit(category)}
                    onDelete={() => onDelete(category)}
                  />
                </div>
              </Card>
            );
          })}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-surface-border bg-surface px-5 py-10 text-center">
          <Tags className="h-8 w-8 text-ink-muted" aria-hidden="true" />
          <p className="mt-2 text-sm text-ink-secondary">{emptyMessage}</p>
        </div>
      )}
    </section>
  );
}

export function CategoriesClient({ categories }: { categories: Category[] }) {
  const categoryDialog = useCrudDialog<Category>();
  const { isPending, error, runAction } = useRunAction();

  const incomeCategories = categories.filter((c) => c.type === "income");
  const expenseCategories = categories.filter((c) => c.type === "expense");

  return (
    <>
      <PageIntro
        title="Categories"
        action={
          <Button onClick={categoryDialog.openCreate} disabled={isPending}>
            <Plus className="h-4 w-4" aria-hidden="true" />
            Add category
          </Button>
        }
      />

      {error ? (
        <p className="mb-4 rounded-2xl border border-surface-border bg-surface p-3 text-sm text-ink-secondary">
          {error}
        </p>
      ) : null}

      {categories.length > 0 ? (
        <div className="grid gap-6 lg:grid-cols-2">
          <CategorySection
            title="Income"
            icon={<ArrowUpRight className="h-4 w-4" aria-hidden="true" />}
            iconBg="#e2f6d5"
            iconColor="#054d28"
            categories={incomeCategories}
            onEdit={(cat) => categoryDialog.openEdit(cat)}
            onDelete={(cat) => categoryDialog.setDeletingItem(cat)}
            emptyMessage="No income categories yet."
          />
          <CategorySection
            title="Expense"
            icon={<ArrowDownRight className="h-4 w-4" aria-hidden="true" />}
            iconBg="#320707"
            iconColor="#ffffff"
            categories={expenseCategories}
            onEdit={(cat) => categoryDialog.openEdit(cat)}
            onDelete={(cat) => categoryDialog.setDeletingItem(cat)}
            emptyMessage="No expense categories yet."
          />
        </div>
      ) : (
        <EmptyState
          title="No categories"
          message="Add income or expense categories for transactions and budgets."
        />
      )}

      <Modal
        open={categoryDialog.isFormOpen}
        title={categoryDialog.editingItem ? "Edit category" : "Add category"}
        onClose={categoryDialog.closeForm}
      >
        <CategoryForm
          key={
            categoryDialog.editingItem?.id ??
            (categoryDialog.isFormOpen ? "new-category" : "closed-category")
          }
          category={categoryDialog.editingItem}
          onCancel={categoryDialog.closeForm}
          onSubmit={(category) =>
            runAction(
              () =>
                categoryDialog.editingItem
                  ? updateCategoryAction(category)
                  : createCategoryAction(category),
              categoryDialog.closeForm,
            )
          }
        />
      </Modal>

      <ConfirmDialog
        open={Boolean(categoryDialog.deletingItem)}
        title="Delete category?"
        message={`This will remove ${categoryDialog.deletingItem?.name ?? "this category"}. Existing linked records may become uncategorized.`}
        onClose={categoryDialog.closeDelete}
        onConfirm={() =>
          categoryDialog.deletingItem &&
          runAction(
            () => deleteCategoryAction(categoryDialog.deletingItem!.id),
            categoryDialog.closeDelete,
          )
        }
      />
    </>
  );
}
