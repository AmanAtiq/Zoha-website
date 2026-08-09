"use client";

import BookEditorForm from "../../../../components/admin/BookEditorForm";

export default function NewBookPage() {
  return (
    <>
      <div className="adm-topbar">
        <div>
          <h1>New book</h1>
          <div className="adm-sub">Add a new title. You can add episodes and details after creating it.</div>
        </div>
      </div>
      <BookEditorForm isNew />
    </>
  );
}
