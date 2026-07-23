"use client";

import { useState } from "react";
import { logoutAction } from "@/app/actions";
import { ConfirmDialog } from "@/components/ConfirmDialog";

export function LogoutButton() {
  const [open, setOpen] = useState(false);
  const [pending, setPending] = useState(false);

  async function handleConfirm() {
    setPending(true);
    await logoutAction();
    // Full navigation so the server re-renders the header as logged out.
    window.location.assign("/");
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="cursor-pointer rounded-md border border-neutral-300 px-3 py-1.5 font-medium transition hover:bg-neutral-100 dark:border-neutral-700 dark:hover:bg-neutral-800"
      >
        Log out
      </button>
      <ConfirmDialog
        open={open}
        title="Log out?"
        description="Are you sure you want to log out of the admin session?"
        confirmLabel="Log out"
        cancelLabel="Cancel"
        variant="danger"
        pending={pending}
        onConfirm={handleConfirm}
        onCancel={() => setOpen(false)}
      />
    </>
  );
}
