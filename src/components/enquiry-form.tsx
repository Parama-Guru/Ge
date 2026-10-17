"use client";

import { useState, type FormEvent } from "react";
import { Arrow } from "./ui";

export function EnquiryForm({ initialScope }: { initialScope: string }) {
  const [notice, setNotice] = useState("");
  const [draft, setDraft] = useState("");

  function compose(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const fields = new FormData(event.currentTarget);
    const name = String(fields.get("name") ?? "").trim();
    const email = String(fields.get("email") ?? "").trim();
    const message = String(fields.get("message") ?? "").trim();
    if (!name || !email || !message) {
      setNotice("Please enter your name, email address and project requirements before preparing a draft.");
      return;
    }
    const subject = String(fields.get("scope") ?? "").trim() || "Project enquiry";
    const body = `Name: ${name}\nEmail: ${email}\nCompany: ${String(fields.get("company") ?? "").trim()}\n\n${message}`;
    setDraft(`mailto:ganeshvar@yahoo.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`);
    setNotice("Your draft is prepared, but nothing has been sent. Open it in your email application to review and send.");
  }

  return <form className="enquiry-form" onSubmit={compose} onChange={() => { setDraft(""); setNotice(""); }}>
    <div className="form-heading">
      <span className="number-label">TELL US WHAT YOU HAVE IN MIND</span>
      <h2>Start a conversation.</h2>
      <p>Prepare your enquiry below, then review and send it using your email application.</p>
    </div>
    <div className="form-grid">
      <label>Your name <span>*</span><input name="name" autoComplete="name" required maxLength={120} placeholder="Full name" /></label>
      <label>Email address <span>*</span><input name="email" type="email" autoComplete="email" required maxLength={200} placeholder="you@company.com" /></label>
      <label>Company <small>optional</small><input name="company" autoComplete="organization" maxLength={200} placeholder="Company name" /></label>
      <label>Subject <small>optional</small><input name="scope" defaultValue={initialScope} maxLength={200} placeholder="Project or capability" /></label>
    </div>
    <label>Tell us about your project <span>*</span><textarea name="message" required rows={5} maxLength={2000} placeholder="The scope, location or requirements you would like to discuss." /></label>
    <div className="form-bottom">
      <span>Fields marked * are required.<br />Please do not include sensitive project documents.</span>
      <button type="submit" className="button button-blue">Prepare email draft<Arrow diagonal /></button>
    </div>
    <p className="form-notice" role="status">{notice}</p>
    {draft && <a className="text-link prepared-draft" href={draft}>Open draft in your email app<Arrow diagonal /></a>}
  </form>;
}
