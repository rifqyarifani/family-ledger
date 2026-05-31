"use client";

import { useEffect, useRef, useState } from "react";
import {
  ArrowDownRight,
  ArrowUpRight,
  Plus,
  Tags,
  Tag,
  Utensils,
  Car,
  Home,
  Zap,
  GraduationCap,
  Tv,
  Heart,
  Shirt,
  Plane,
  Gift,
  Briefcase,
  TrendingUp,
  DollarSign,
  ShoppingBag,
  MoreVertical,
  Ambulance,
} from "lucide-react";
import {
  createCategoryAction,
  deleteCategoryAction,
  updateCategoryAction,
} from "@/app/app/categories/actions";
import { Button } from "@/components/button";
import { CategoryForm } from "@/components/category-form";
import { ConfirmDialog } from "@/components/confirm-dialog";
import { EmptyState } from "@/components/empty-state";
import { Modal } from "@/components/modal";
import { PageIntro } from "@/components/page-intro";
import { useCrudDialog } from "@/hooks/use-crud-dialog";
import { useRunAction } from "@/hooks/use-run-action";
import type { Category } from "@/types/finance";

const defaultColors = {
  income: "#2ead4b",
  expense: "#d03238",
};

const iconLookup: Record<
  string,
  React.ComponentType<{ className?: string }>
> = {
  tag: Tag,
  utensils: Utensils,
  car: Car,
  home: Home,
  zap: Zap,
  "graduation-cap": GraduationCap,
  tv: Tv,
  heart: Heart,
  shirt: Shirt,
  plane: Plane,
  gift: Gift,
  briefcase: Briefcase,
  "trending-up": TrendingUp,
  "dollar-sign": DollarSign,
  "shopping-bag": ShoppingBag,
  ambulance: Ambulance,
};

function CategorySection({
  title,
  icon,
  iconBg,
  iconColor,
  categories,
  onEdit,
  onDelete,
  openMenuId,
  setOpenMenuId,
  menuRef,
  emptyMessage,
}: {
  title: string;
  icon: React.ReactNode;
  iconBg: string;
  iconColor: string;
  categories: Category[];
  onEdit: (category: Category) => void;
  onDelete: (category: Category) => void;
  openMenuId: string | null;
  setOpenMenuId: (id: string | null) => void;
  menuRef: React.RefObject<HTMLDivElement | null>;
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
        <div className="grid gap-2">
          {categories.map((category) => {
            const dotColor =
              category.color ||
              (category.type === "income"
                ? defaultColors.income
                : category.type === "expense"
                  ? defaultColors.expense
                  : "#868685");
            const CategoryIcon = category.icon
              ? (iconLookup[category.icon] ?? Tag)
              : Tag;
            const menuOpen = openMenuId === category.id;

            return (
              <div
                key={category.id}
                className="flex items-center justify-between gap-3 rounded-2xl border border-surface-border bg-white px-3 py-2 transition hover:bg-surface-subtle"
              >
                <div className="flex items-center gap-3">
                  <div
                    className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-white"
                    style={{ backgroundColor: dotColor }}
                  >
                    <CategoryIcon className="h-4 w-4" aria-hidden="true" />
                  </div>
                  <span className="text-sm font-medium text-ink">
                    {category.name}
                  </span>
                </div>
                <div className="relative shrink-0">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setOpenMenuId(menuOpen ? null : category.id)}
                    aria-expanded={menuOpen}
                    aria-haspopup="true"
                    aria-label={`Actions for ${category.name}`}
                  >
                    <MoreVertical className="h-4 w-4" aria-hidden="true" />
                  </Button>
                  {menuOpen ? (
                    <div
                      ref={menuRef}
                      role="menu"
                      aria-label={`Actions for ${category.name}`}
                      onKeyDown={(event) => {
                        if (event.key === "Escape") {
                          setOpenMenuId(null);
                        }
                      }}
                      className="absolute right-0 top-full z-50 mt-1 w-36 overflow-hidden rounded-xl border border-surface-border bg-white shadow-lg"
                    >
                      <button
                        type="button"
                        role="menuitem"
                        className="flex w-full items-center px-4 py-2 text-left text-sm text-ink transition hover:bg-surface-subtle"
                        onClick={() => {
                          setOpenMenuId(null);
                          onEdit(category);
                        }}
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        role="menuitem"
                        className="flex w-full items-center px-4 py-2 text-left text-sm text-danger transition hover:bg-danger-light"
                        onClick={() => {
                          setOpenMenuId(null);
                          onDelete(category);
                        }}
                      >
                        Delete
                      </button>
                    </div>
                  ) : null}
                </div>
              </div>
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
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const menuRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!openMenuId) return;
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setOpenMenuId(null);
      }
    }
    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, [openMenuId]);

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
            openMenuId={openMenuId}
            setOpenMenuId={setOpenMenuId}
            menuRef={menuRef}
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
            openMenuId={openMenuId}
            setOpenMenuId={setOpenMenuId}
            menuRef={menuRef}
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
