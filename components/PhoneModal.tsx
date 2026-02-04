// components/PhoneModal.tsx
"use client";
import React, { useState } from "react";
import { Button } from "@/components/ui/button";

type Props = {
  open: boolean;
  onClose: () => void;
  onSave: (phone: string) => Promise<void> | void;
};

export default function PhoneModal({ open, onClose, onSave }: Props) {
  const [val, setVal] = useState("");
  const [saving, setSaving] = useState(false);

  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-xl p-6 w-11/12 max-w-md">
        <h3 className="text-lg font-semibold mb-2">We need your phone number</h3>
        <p className="text-sm text-slate-500 mb-4">To use call features, please provide a number we can reach you at.</p>

        <form onSubmit={async (e) => {
          e.preventDefault();
          setSaving(true);
          try {
            await onSave(val);
          } finally {
            setSaving(false);
          }
        }} className="flex flex-col gap-3">
          <input type="tel" required value={val} onChange={(e) => setVal(e.target.value)} placeholder="5551234567" className="p-2 border rounded" />
          <div className="flex items-center justify-end gap-2">
            <Button variant="ghost" onClick={onClose}>Cancel</Button>
            <Button type="submit" disabled={saving}>{saving ? "Saving…" : "Save"}</Button>
          </div>
        </form>
      </div>
    </div>
  );
}
