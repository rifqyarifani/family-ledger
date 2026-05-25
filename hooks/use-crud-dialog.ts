"use client";

import { useState } from "react";

export function useCrudDialog<T>() {
  const [editingItem, setEditingItem] = useState<T | undefined>();
  const [deletingItem, setDeletingItem] = useState<T | undefined>();
  const [isFormOpen, setIsFormOpen] = useState(false);

  function openCreate() {
    setEditingItem(undefined);
    setIsFormOpen(true);
  }

  function openEdit(item: T) {
    setEditingItem(item);
    setIsFormOpen(true);
  }

  function closeForm() {
    setIsFormOpen(false);
    setEditingItem(undefined);
  }

  function closeDelete() {
    setDeletingItem(undefined);
  }

  return {
    editingItem,
    deletingItem,
    isFormOpen,
    openCreate,
    openEdit,
    closeForm,
    setDeletingItem,
    closeDelete
  };
}
