"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Plus, Tags } from "lucide-react";
import {
  createCategoryAction,
  deleteCategoryAction,
  updateCategoryAction,
} from "@/app/app/categories/actions";
import { Badge } from "@/components/badge";
import { Button } from "@/components/button";
import { Card } from "@/components/card";
import { CategoryForm } from "@/components/category-form";
import { ConfirmDialog } from "@/components/confirm-dialog";
import { EmptyState } from "@/components/empty-state";
import { Modal } from "@/components/modal";
import { PageIntro } from "@/components/page-intro";
import { ResourceActions } from "@/components/resource-actions";
import { useCrudDialog } from "@/hooks/use-crud-dialog";
import type { Category } from "@/types/finance";

export function CategoriesClient({ categories }: { categories: Category[] }) {
  const router = useRouter();
  const categoryDialog = useCrudDialog<Category>();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState("");

  function runAction(action: () => Promise<void>, onSuccess?: () => void) {
    setError("");
    startTransition(async () => {
      try {
        await action();
        onSuccess?.();
        router.refresh();
      } catch (actionError) {
        setError(
          actionError instanceof Error
            ? actionError.message
            : "Something went wrong.",
        );
      }
    });
  }

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
        <p className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-700">
          {error}
        </p>
      ) : null}

      {categories.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {categories.map((category) => (
            <Card key={category.id}>
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3">
                  <div className="rounded-lg bg-slate-100 p-2 text-slate-600">
                    <Tags className="h-5 w-5" aria-hidden="true" />
                  </div>
                  <div>
                    <h2 className="font-semibold text-slate-950">
                      {category.name}
                    </h2>
                    <div className="mt-2 capitalize">
                      <Badge
                        tone={category.type === "income" ? "green" : "red"}
                      >
                        {category.type}
                      </Badge>
                    </div>
                  </div>
                </div>
                <ResourceActions
                  editLabel={`Edit ${category.name}`}
                  deleteLabel={`Delete ${category.name}`}
                  onEdit={() => categoryDialog.openEdit(category)}
                  onDelete={() => categoryDialog.setDeletingItem(category)}
                />
              </div>
            </Card>
          ))}
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
