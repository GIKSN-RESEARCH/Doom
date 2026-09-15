"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";

type Kind = "case-studies" | "articles" | "updates";

type ListItem = {
  id: string;
  slug: string;
  title: string;
  published: boolean;
  featured?: boolean;
  updatedAt?: string;
};

const KINDS: { id: Kind; label: string; singular: string }[] = [
  { id: "case-studies", label: "Case studies", singular: "case study" },
  { id: "articles", label: "Articles", singular: "article" },
  { id: "updates", label: "Updates", singular: "update" },
];

const ARTICLE_TYPES = ["BREAKDOWN", "EXPLAINER", "BUILD_LOG"] as const;
const BOTTLENECK_TAGS = [
  "PRODUCT",
  "SHIPPING",
  "DISTRIBUTION",
  "FUNDING",
  "CLARITY",
  "OTHER",
] as const;

const inputClass =
  "w-full rounded-xl border border-white/15 bg-[#20060e]/80 px-3 py-2.5 text-sm text-[#fff2f2] outline-none placeholder:text-[#fff2f2]/35 focus:border-white/40";
const areaClass = `${inputClass} min-h-28 resize-y leading-relaxed`;

function csv(value: unknown): string {
  return Array.isArray(value) ? value.filter(Boolean).join(", ") : "";
}

function lines(value: unknown): string {
  return Array.isArray(value) ? value.filter(Boolean).join("\n") : "";
}

function parseCsv(value: string): string[] {
  return value
    .split(",")
    .map((part) => part.trim())
    .filter(Boolean);
}

function parseLines(value: string): string[] {
  return value
    .split("\n")
    .map((part) => part.trim())
    .filter(Boolean);
}

async function readError(response: Response): Promise<string> {
  try {
    const body = await response.json();
    if (body && typeof body.error === "string") return body.error;
  } catch {
    // Fall through.
  }
  return `Request failed (${response.status})`;
}

async function adminFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const headers = new Headers(init?.headers);
  if (
    init?.body &&
    !(init.body instanceof FormData) &&
    !headers.has("Content-Type")
  ) {
    headers.set("Content-Type", "application/json");
  }

  const response = await fetch(path, {
    credentials: "include",
    ...init,
    headers,
  });

  if (!response.ok) {
    throw new Error(await readError(response));
  }

  return (await response.json()) as T;
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#fff2f2]/55">
        {label}
      </span>
      {children}
    </label>
  );
}

function ImagePicker({
  label,
  value,
  onChange,
  multiple = false,
  busy,
}: {
  label: string;
  value: string;
  onChange: (next: string) => void;
  multiple?: boolean;
  busy: boolean;
}) {
  const [uploading, setUploading] = useState(false);
  const urls = multiple ? parseLines(value) : value.trim() ? [value.trim()] : [];

  const upload = async (fileList: FileList | null) => {
    if (!fileList || fileList.length === 0) return;
    setUploading(true);
    try {
      const body = new FormData();
      for (const file of Array.from(fileList)) {
        body.append("files", file);
      }
      const data = await adminFetch<{ urls: string[] }>("/api/admin/uploads", {
        method: "POST",
        body,
      });
      const uploaded = data.urls ?? [];
      if (multiple) {
        onChange([...urls, ...uploaded].join("\n"));
      } else {
        onChange(uploaded[0] ?? "");
      }
    } catch (error) {
      throw error;
    } finally {
      setUploading(false);
    }
  };

  const removeAt = (index: number) => {
    const next = urls.filter((_, i) => i !== index);
    onChange(multiple ? next.join("\n") : "");
  };

  return (
    <div className="flex flex-col gap-2">
      <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#fff2f2]/55">
        {label}
      </span>
      <input
        id={multiple ? "gallery-image-input" : "cover-image-input"}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif,image/avif"
        multiple={multiple}
        disabled={busy || uploading}
        className="block w-full cursor-pointer text-sm text-[#fff2f2]/80 file:mr-3 file:rounded-full file:border-0 file:bg-[#fff2f2] file:px-4 file:py-2 file:text-sm file:font-semibold file:text-[#4b1426]"
        onChange={(event) => {
          const files = event.target.files;
          void upload(files)
            .catch((error: unknown) => {
              window.alert(
                error instanceof Error ? error.message : "Upload failed",
              );
            })
            .finally(() => {
              event.target.value = "";
            });
        }}
      />
      {uploading ? (
        <p className="text-xs text-[#fff2f2]/60">Uploading…</p>
      ) : null}
      {urls.length > 0 ? (
        <div className={`grid gap-3 ${multiple ? "grid-cols-2 sm:grid-cols-3" : "grid-cols-1 max-w-sm"}`}>
          {urls.map((url, index) => (
            <div
              key={`${url}-${index}`}
              className="relative overflow-hidden rounded-2xl border border-white/15 bg-[#20060e]/80"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={url} alt="" className="h-36 w-full object-cover" />
              <button
                type="button"
                onClick={() => removeAt(index)}
                className="absolute right-2 top-2 rounded-full bg-[#150509]/80 px-3 py-1 text-xs text-[#fff2f2]"
              >
                Remove
              </button>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-xs text-[#fff2f2]/45">JPEG, PNG, WebP, GIF, or AVIF. 8MB max.</p>
      )}
    </div>
  );
}

function emptyForm(kind: Kind): Record<string, string | boolean> {
  if (kind === "case-studies") {
    return {
      title: "",
      slug: "",
      outcomeLine: "",
      bottleneck: "",
      context: "",
      whatWeDid: "",
      whatChanged: "",
      tags: "",
      coverImageUrl: "",
      galleryUrls: "",
      liveUrl: "",
      year: "",
      published: false,
      featured: false,
    };
  }
  if (kind === "articles") {
    return {
      title: "",
      slug: "",
      excerpt: "",
      body: "",
      articleType: "EXPLAINER",
      bottleneckTag: "",
      coverImageUrl: "",
      tags: "",
      published: false,
      featured: false,
    };
  }
  return {
    title: "",
    slug: "",
    summary: "",
    body: "",
    coverImageUrl: "",
    tags: "",
    published: false,
  };
}

function recordToForm(kind: Kind, item: Record<string, unknown>) {
  const base = emptyForm(kind);
  const next = { ...base };
  for (const key of Object.keys(base)) {
    if (key === "tags") {
      next.tags = csv(item.tags);
    } else if (key === "galleryUrls") {
      next.galleryUrls = lines(item.galleryUrls);
    } else if (key === "year") {
      next.year = item.year == null ? "" : String(item.year);
    } else if (key === "published" || key === "featured") {
      next[key] = Boolean(item[key]);
    } else if (item[key] == null) {
      next[key] = "";
    } else {
      next[key] = String(item[key]);
    }
  }
  return next;
}

function formToPayload(kind: Kind, form: Record<string, string | boolean>) {
  const str = (key: string) => String(form[key] ?? "").trim();
  const bool = (key: string) => Boolean(form[key]);

  if (kind === "case-studies") {
    const yearRaw = str("year");
    const year = yearRaw ? Number.parseInt(yearRaw, 10) : null;
    return {
      title: str("title"),
      outcomeLine: str("outcomeLine"),
      bottleneck: str("bottleneck"),
      context: str("context"),
      whatWeDid: str("whatWeDid"),
      whatChanged: str("whatChanged"),
      tags: parseCsv(str("tags")),
      coverImageUrl: str("coverImageUrl"),
      galleryUrls: parseLines(str("galleryUrls")),
      liveUrl: str("liveUrl") || null,
      year: yearRaw && Number.isInteger(year) ? year : null,
      published: bool("published"),
      featured: bool("featured"),
    };
  }

  if (kind === "articles") {
    return {
      title: str("title"),
      excerpt: str("excerpt"),
      body: str("body"),
      articleType: str("articleType") || null,
      bottleneckTag: str("bottleneckTag") || null,
      coverImageUrl: str("coverImageUrl") || null,
      tags: parseCsv(str("tags")),
      published: bool("published"),
      featured: bool("featured"),
    };
  }

  return {
    title: str("title"),
    summary: str("summary"),
    body: str("body"),
    coverImageUrl: str("coverImageUrl") || null,
    tags: parseCsv(str("tags")),
    published: bool("published"),
  };
}

export default function AdminApp() {
  const [ready, setReady] = useState(false);
  const [authed, setAuthed] = useState(false);
  const [keyInput, setKeyInput] = useState("");
  const [kind, setKind] = useState<Kind>("case-studies");
  const [items, setItems] = useState<ListItem[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<Record<string, string | boolean>>(() =>
    emptyForm("case-studies"),
  );
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const kindMeta = useMemo(
    () => KINDS.find((entry) => entry.id === kind) ?? KINDS[0],
    [kind],
  );

  const loadList = useCallback(async (nextKind: Kind) => {
    const data = await adminFetch<{ items: ListItem[] }>(
      `/api/admin/${nextKind}?limit=100`,
    );
    setItems(data.items ?? []);
  }, []);

  useEffect(() => {
    let cancelled = false;
    adminFetch<{ ok: boolean }>("/api/admin/session")
      .then(async () => {
        if (cancelled) return;
        setAuthed(true);
        await loadList("case-studies");
      })
      .catch(() => {
        if (!cancelled) setAuthed(false);
      })
      .finally(() => {
        if (!cancelled) setReady(true);
      });
    return () => {
      cancelled = true;
    };
  }, [loadList]);

  const setField = (key: string, value: string | boolean) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const openNew = (nextKind = kind) => {
    setEditingId(null);
    setForm(emptyForm(nextKind));
    setError("");
    setStatus(
      `New ${KINDS.find((entry) => entry.id === nextKind)?.singular ?? "entry"}`,
    );
  };

  const switchKind = async (nextKind: Kind) => {
    setKind(nextKind);
    setError("");
    setBusy(true);
    try {
      await loadList(nextKind);
      openNew(nextKind);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not load entries");
    } finally {
      setBusy(false);
    }
  };

  const openItem = async (id: string) => {
    setBusy(true);
    setError("");
    try {
      const item = await adminFetch<Record<string, unknown>>(
        `/api/admin/${kind}/${id}`,
      );
      setEditingId(id);
      setForm(recordToForm(kind, item));
      setStatus(`Editing ${String(item.title ?? id)}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not load entry");
    } finally {
      setBusy(false);
    }
  };

  const missingForPublish = () => {
    const str = (key: string) => String(form[key] ?? "").trim();
    const missing: string[] = [];
    if (!str("title")) missing.push("title");
    if (kind === "case-studies") {
      if (!str("outcomeLine")) missing.push("outcome line");
      if (!str("bottleneck")) missing.push("bottleneck");
    }
    if (kind === "articles") {
      if (!str("excerpt")) missing.push("excerpt");
      if (!str("body")) missing.push("body");
      if (!str("articleType")) missing.push("article type");
    }
    if (kind === "updates") {
      if (!str("summary")) missing.push("summary");
      if (!str("body")) missing.push("body");
    }
    return missing;
  };

  const save = async (publish: boolean) => {
    if (publish) {
      const missing = missingForPublish();
      if (missing.length > 0) {
        setError(`To publish, add: ${missing.join(", ")}.`);
        return;
      }
    }

    setBusy(true);
    setError("");
    try {
      const payload = { ...formToPayload(kind, form), published: publish };
      const item = editingId
        ? await adminFetch<Record<string, unknown>>(
            `/api/admin/${kind}/${editingId}`,
            {
              method: "PATCH",
              body: JSON.stringify(payload),
            },
          )
        : await adminFetch<Record<string, unknown>>(`/api/admin/${kind}`, {
            method: "POST",
            body: JSON.stringify(payload),
          });
      setEditingId(String(item.id));
      setForm(recordToForm(kind, item));
      await loadList(kind);
      if (publish) {
        const livePath = kind === "updates" ? "/updates" : "/reading";
        setStatus(`Published. Live at ${livePath}`);
      } else {
        setStatus("Draft saved. It is not public until you publish.");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Save failed");
    } finally {
      setBusy(false);
    }
  };

  const remove = async () => {
    if (!editingId) return;
    if (!window.confirm("Delete this entry? This cannot be undone.")) return;
    setBusy(true);
    setError("");
    try {
      await adminFetch(`/api/admin/${kind}/${editingId}`, { method: "DELETE" });
      await loadList(kind);
      openNew();
      setStatus("Deleted.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Delete failed");
    } finally {
      setBusy(false);
    }
  };

  const login = async (event: React.FormEvent) => {
    event.preventDefault();
    setBusy(true);
    setError("");
    try {
      await adminFetch("/api/admin/session", {
        method: "POST",
        body: JSON.stringify({ key: keyInput }),
      });
      setKeyInput("");
      setAuthed(true);
      await loadList(kind);
      openNew(kind);
    } catch {
      setError("That key is not valid.");
    } finally {
      setBusy(false);
    }
  };

  const logout = async () => {
    await adminFetch("/api/admin/session", { method: "DELETE" }).catch(() => {});
    setAuthed(false);
    setItems([]);
    setKeyInput("");
  };

  if (!ready) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#150509] text-[#fff2f2]/60">
        Loading desk…
      </div>
    );
  }

  if (!authed) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#150509] px-5">
        <form
          onSubmit={login}
          className="w-full max-w-md rounded-3xl border border-white/15 bg-[#340b18]/80 p-8 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.12)]"
        >
          <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.28em] text-[#e07a93]">
            Doom Studio
          </p>
          <h1 className="font-heading text-3xl font-semibold tracking-tight text-[#fff2f2]">
            Content desk
          </h1>
          <p className="mt-3 text-sm leading-relaxed text-[#fff2f2]/65">
            Enter the admin key from your environment to create and publish
            case studies, articles, and updates.
          </p>
          <div className="mt-6">
            <Field label="Admin key">
              <input
                type="password"
                autoComplete="current-password"
                value={keyInput}
                onChange={(event) => setKeyInput(event.target.value)}
                className={inputClass}
                required
              />
            </Field>
          </div>
          {error ? (
            <p className="mt-3 text-sm text-[#ffb4c4]">{error}</p>
          ) : null}
          <button
            type="submit"
            disabled={busy}
            className="mt-6 w-full rounded-full bg-[#fff2f2] px-5 py-3 text-sm font-semibold text-[#4b1426] transition hover:bg-white disabled:opacity-60"
          >
            {busy ? "Checking…" : "Open desk"}
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#150509] text-[#fff2f2]">
      <header className="border-b border-white/10 px-5 py-4 sm:px-8">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-[#e07a93]">
              Doom Studio
            </p>
            <h1 className="font-heading text-2xl font-semibold tracking-tight">
              Content desk
            </h1>
          </div>
          <div className="flex items-center gap-3">
            <a
              href="/reading"
              className="text-sm text-[#fff2f2]/70 underline-offset-4 hover:text-white hover:underline"
            >
              View readings
            </a>
            <a
              href="/updates"
              className="text-sm text-[#fff2f2]/70 underline-offset-4 hover:text-white hover:underline"
            >
              View updates
            </a>
            <button
              type="button"
              onClick={logout}
              className="rounded-full border border-white/20 px-4 py-2 text-sm text-[#fff2f2]/80 hover:bg-white/5"
            >
              Sign out
            </button>
          </div>
        </div>
      </header>

      <div className="mx-auto grid max-w-6xl gap-6 px-5 py-8 sm:px-8 lg:grid-cols-[280px_1fr]">
        <aside className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            {KINDS.map((entry) => (
              <button
                key={entry.id}
                type="button"
                onClick={() => void switchKind(entry.id)}
                className={`rounded-2xl px-4 py-3 text-left text-sm font-semibold transition ${
                  kind === entry.id
                    ? "bg-[#fff2f2] text-[#4b1426]"
                    : "border border-white/10 text-[#fff2f2]/80 hover:bg-white/5"
                }`}
              >
                {entry.label}
              </button>
            ))}
          </div>

          <button
            type="button"
            onClick={() => openNew()}
            className="rounded-full border border-white/20 px-4 py-2 text-sm font-semibold text-[#fff2f2] hover:bg-white/5"
          >
            New {kindMeta.singular}
          </button>

          <ul className="flex flex-col gap-2">
            {items.length === 0 ? (
              <li className="text-sm text-[#fff2f2]/50">No entries yet.</li>
            ) : (
              items.map((item) => (
                <li key={item.id}>
                  <button
                    type="button"
                    onClick={() => void openItem(item.id)}
                    className={`w-full rounded-2xl border px-4 py-3 text-left transition ${
                      editingId === item.id
                        ? "border-[#fff2f2] bg-white/10"
                        : "border-white/10 hover:bg-white/5"
                    }`}
                  >
                    <span className="block text-sm font-semibold">
                      {item.title}
                    </span>
                    <span className="mt-1 block text-[11px] uppercase tracking-[0.16em] text-[#fff2f2]/50">
                      {item.published ? "Published" : "Draft"} · {item.slug}
                    </span>
                  </button>
                </li>
              ))
            )}
          </ul>
        </aside>

        <section className="rounded-3xl border border-white/15 bg-[#340b18]/70 p-5 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.08)] sm:p-8">
          <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
            <h2 className="font-heading text-xl font-semibold">
              {editingId ? `Edit ${kindMeta.singular}` : `New ${kindMeta.singular}`}
            </h2>
            <div className="flex gap-2">
              {editingId ? (
                <button
                  type="button"
                  onClick={() => void remove()}
                  disabled={busy}
                  className="rounded-full border border-white/20 px-4 py-2 text-sm text-[#ffb4c4] hover:bg-white/5 disabled:opacity-60"
                >
                  Delete
                </button>
              ) : null}
              <button
                type="button"
                onClick={() => void save(false)}
                disabled={busy}
                className="rounded-full border border-white/20 px-4 py-2 text-sm text-[#fff2f2]/85 hover:bg-white/5 disabled:opacity-60"
              >
                {busy ? "Saving…" : "Save draft"}
              </button>
              <button
                type="button"
                onClick={() => void save(true)}
                disabled={busy}
                className="rounded-full bg-[#fff2f2] px-5 py-2 text-sm font-semibold text-[#4b1426] hover:bg-white disabled:opacity-60"
              >
                {busy ? "Publishing…" : "Publish"}
              </button>
            </div>
          </div>

          {status ? (
            <p className="mb-4 text-sm text-[#fff2f2]/60">{status}</p>
          ) : null}
          {error ? (
            <p className="mb-4 text-sm text-[#ffb4c4]">{error}</p>
          ) : null}

          <form
            className="grid gap-4"
            onSubmit={(event) => {
              event.preventDefault();
              void save(true);
            }}
          >
            <Field label="Title">
              <input
                className={inputClass}
                value={String(form.title ?? "")}
                onChange={(event) => setField("title", event.target.value)}
                required
              />
            </Field>

            {kind === "case-studies" ? (
              <>
                <Field label="Outcome line">
                  <input
                    className={inputClass}
                    value={String(form.outcomeLine ?? "")}
                    onChange={(event) =>
                      setField("outcomeLine", event.target.value)
                    }
                  />
                </Field>
                <Field label="Bottleneck">
                  <textarea
                    className={areaClass}
                    value={String(form.bottleneck ?? "")}
                    onChange={(event) =>
                      setField("bottleneck", event.target.value)
                    }
                  />
                </Field>
                <Field label="Context">
                  <textarea
                    className={areaClass}
                    value={String(form.context ?? "")}
                    onChange={(event) => setField("context", event.target.value)}
                  />
                </Field>
                <Field label="What we did">
                  <textarea
                    className={areaClass}
                    value={String(form.whatWeDid ?? "")}
                    onChange={(event) =>
                      setField("whatWeDid", event.target.value)
                    }
                  />
                </Field>
                <Field label="What changed">
                  <textarea
                    className={areaClass}
                    value={String(form.whatChanged ?? "")}
                    onChange={(event) =>
                      setField("whatChanged", event.target.value)
                    }
                  />
                </Field>
                <Field label="Live URL">
                  <input
                    className={inputClass}
                    value={String(form.liveUrl ?? "")}
                    onChange={(event) => setField("liveUrl", event.target.value)}
                  />
                </Field>
                <Field label="Year">
                  <input
                    className={inputClass}
                    inputMode="numeric"
                    value={String(form.year ?? "")}
                    onChange={(event) => setField("year", event.target.value)}
                  />
                </Field>
                <ImagePicker
                  label="Gallery images"
                  value={String(form.galleryUrls ?? "")}
                  onChange={(next) => setField("galleryUrls", next)}
                  multiple
                  busy={busy}
                />
              </>
            ) : null}

            {kind === "articles" ? (
              <>
                <Field label="Excerpt">
                  <textarea
                    className={areaClass}
                    value={String(form.excerpt ?? "")}
                    onChange={(event) => setField("excerpt", event.target.value)}
                  />
                </Field>
                <Field label="Body">
                  <textarea
                    className={`${areaClass} min-h-48`}
                    value={String(form.body ?? "")}
                    onChange={(event) => setField("body", event.target.value)}
                  />
                </Field>
                <Field label="Article type">
                  <select
                    className={inputClass}
                    value={String(form.articleType ?? "")}
                    onChange={(event) =>
                      setField("articleType", event.target.value)
                    }
                  >
                    <option value="">None</option>
                    {ARTICLE_TYPES.map((value) => (
                      <option key={value} value={value}>
                        {value}
                      </option>
                    ))}
                  </select>
                </Field>
                <Field label="Bottleneck tag">
                  <select
                    className={inputClass}
                    value={String(form.bottleneckTag ?? "")}
                    onChange={(event) =>
                      setField("bottleneckTag", event.target.value)
                    }
                  >
                    <option value="">None</option>
                    {BOTTLENECK_TAGS.map((value) => (
                      <option key={value} value={value}>
                        {value}
                      </option>
                    ))}
                  </select>
                </Field>
              </>
            ) : null}

            {kind === "updates" ? (
              <>
                <Field label="Summary">
                  <textarea
                    className={areaClass}
                    value={String(form.summary ?? "")}
                    onChange={(event) => setField("summary", event.target.value)}
                  />
                </Field>
                <Field label="Body">
                  <textarea
                    className={`${areaClass} min-h-48`}
                    value={String(form.body ?? "")}
                    onChange={(event) => setField("body", event.target.value)}
                  />
                </Field>
              </>
            ) : null}

            <ImagePicker
              label="Cover image"
              value={String(form.coverImageUrl ?? "")}
              onChange={(next) => setField("coverImageUrl", next)}
              busy={busy}
            />
            <Field label="Tags (comma separated)">
              <input
                className={inputClass}
                value={String(form.tags ?? "")}
                onChange={(event) => setField("tags", event.target.value)}
              />
            </Field>

            {kind !== "updates" ? (
              <label className="flex items-center gap-2 pt-2 text-sm">
                <input
                  type="checkbox"
                  checked={Boolean(form.featured)}
                  onChange={(event) =>
                    setField("featured", event.target.checked)
                  }
                />
                Featured
              </label>
            ) : null}
            <p className="text-xs text-[#fff2f2]/50">
              Save draft keeps this private. Publish makes it live on{" "}
              {kind === "updates" ? "/updates" : "/reading"}.
            </p>
          </form>
        </section>
      </div>
    </div>
  );
}
