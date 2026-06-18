"use client";

import { useCallback, useEffect, useState } from "react";
import { Pencil, Plus, Trash2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { LoadingState, ErrorState, EmptyState } from "@/components/states";
import { useTranslation } from "@/lib/i18n/context";
import { apiFetch, ClientApiError } from "@/lib/client-api";
import { alertInputSchema } from "@/lib/validation";
import type { AlertCategory, AlertSeverity, ServiceAlert } from "@/lib/types";
import type { TranslationKey } from "@/lib/i18n/dictionary";

const CATEGORIES: AlertCategory[] = [
  "sun_metro",
  "eta",
  "bridge",
  "weather",
  "cooling_center",
  "city",
];
const SEVERITIES: AlertSeverity[] = ["info", "minor", "major", "severe"];

interface FormState {
  titleEn: string;
  titleEs: string;
  bodyEn: string;
  bodyEs: string;
  category: AlertCategory;
  severity: AlertSeverity;
  affectedArea: string;
  source: string;
  sourceUrl: string;
  active: boolean;
}

const EMPTY: FormState = {
  titleEn: "",
  titleEs: "",
  bodyEn: "",
  bodyEs: "",
  category: "city",
  severity: "info",
  affectedArea: "",
  source: "City of El Paso",
  sourceUrl: "",
  active: true,
};

export function AlertsAdmin() {
  const { t } = useTranslation();
  const [alerts, setAlerts] = useState<ServiceAlert[] | null>(null);
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<FormState>(EMPTY);
  const [formError, setFormError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setStatus("loading");
    try {
      const res = await apiFetch<{ alerts: ServiceAlert[] }>("/api/admin/alerts");
      setAlerts(res.alerts);
      setStatus("ready");
    } catch {
      setStatus("error");
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const startCreate = () => {
    setEditingId(null);
    setForm(EMPTY);
    setFormError(null);
    setShowForm(true);
  };

  const startEdit = (a: ServiceAlert) => {
    setEditingId(a.id);
    setForm({
      titleEn: a.titleEn,
      titleEs: a.titleEs,
      bodyEn: a.bodyEn,
      bodyEs: a.bodyEs,
      category: a.category,
      severity: a.severity,
      affectedArea: a.affectedArea ?? "",
      source: a.source,
      sourceUrl: a.sourceUrl ?? "",
      active: true,
    });
    setFormError(null);
    setShowForm(true);
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    const parsed = alertInputSchema.safeParse({
      ...form,
      affectedArea: form.affectedArea || null,
      sourceUrl: form.sourceUrl || null,
    });
    if (!parsed.success) {
      setFormError(t("error.validation"));
      return;
    }
    setSaving(true);
    try {
      if (editingId) {
        await apiFetch(`/api/admin/alerts/${editingId}`, {
          method: "PATCH",
          body: JSON.stringify(parsed.data),
        });
      } else {
        await apiFetch("/api/admin/alerts", {
          method: "POST",
          body: JSON.stringify(parsed.data),
        });
      }
      setShowForm(false);
      await load();
    } catch (err) {
      setFormError(
        err instanceof ClientApiError && err.code === "forbidden"
          ? t("error.forbidden")
          : t("error.saveFailed")
      );
    } finally {
      setSaving(false);
    }
  };

  const remove = async (id: string) => {
    if (!window.confirm(t("admin.deleteConfirm"))) return;
    try {
      await apiFetch(`/api/admin/alerts/${id}`, { method: "DELETE" });
      await load();
    } catch {
      // reload reflects state
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button onClick={startCreate}>
          <Plus className="h-4 w-4" aria-hidden="true" />
          {t("admin.alerts.new")}
        </Button>
      </div>

      {showForm ? (
        <Card>
          <CardHeader className="flex-row items-center justify-between space-y-0">
            <CardTitle className="text-base">
              {editingId ? t("common.edit") : t("admin.alerts.new")}
            </CardTitle>
            <button
              type="button"
              onClick={() => setShowForm(false)}
              aria-label={t("common.close")}
              className="rounded-md p-1 text-muted-foreground hover:bg-accent"
            >
              <X className="h-4 w-4" aria-hidden="true" />
            </button>
          </CardHeader>
          <CardContent>
            <form onSubmit={submit} className="grid gap-3 sm:grid-cols-2">
              <Field label={`${t("alerts.title")} (EN)`} htmlFor="a-title-en">
                <Input
                  id="a-title-en"
                  value={form.titleEn}
                  onChange={(e) => setForm({ ...form, titleEn: e.target.value })}
                  required
                />
              </Field>
              <Field label={`${t("alerts.title")} (ES)`} htmlFor="a-title-es">
                <Input
                  id="a-title-es"
                  value={form.titleEs}
                  onChange={(e) => setForm({ ...form, titleEs: e.target.value })}
                  required
                />
              </Field>
              <Field label="Body (EN)" htmlFor="a-body-en" full>
                <Textarea
                  id="a-body-en"
                  value={form.bodyEn}
                  onChange={(e) => setForm({ ...form, bodyEn: e.target.value })}
                  required
                />
              </Field>
              <Field label="Body (ES)" htmlFor="a-body-es" full>
                <Textarea
                  id="a-body-es"
                  value={form.bodyEs}
                  onChange={(e) => setForm({ ...form, bodyEs: e.target.value })}
                  required
                />
              </Field>
              <Field label={t("alerts.filter.all")} htmlFor="a-category">
                <Select
                  id="a-category"
                  value={form.category}
                  onChange={(e) =>
                    setForm({ ...form, category: e.target.value as AlertCategory })
                  }
                >
                  {CATEGORIES.map((c) => (
                    <option key={c} value={c}>
                      {t(`alerts.category.${c}` as TranslationKey)}
                    </option>
                  ))}
                </Select>
              </Field>
              <Field label={t("alerts.severity.info")} htmlFor="a-severity">
                <Select
                  id="a-severity"
                  value={form.severity}
                  onChange={(e) =>
                    setForm({ ...form, severity: e.target.value as AlertSeverity })
                  }
                >
                  {SEVERITIES.map((s) => (
                    <option key={s} value={s}>
                      {t(`alerts.severity.${s}` as TranslationKey)}
                    </option>
                  ))}
                </Select>
              </Field>
              <Field label={t("alerts.affectedArea")} htmlFor="a-area">
                <Input
                  id="a-area"
                  value={form.affectedArea}
                  onChange={(e) =>
                    setForm({ ...form, affectedArea: e.target.value })
                  }
                />
              </Field>
              <Field label={t("common.source")} htmlFor="a-source">
                <Input
                  id="a-source"
                  value={form.source}
                  onChange={(e) => setForm({ ...form, source: e.target.value })}
                  required
                />
              </Field>
              <Field label={t("common.viewSource")} htmlFor="a-source-url" full>
                <Input
                  id="a-source-url"
                  type="url"
                  value={form.sourceUrl}
                  onChange={(e) => setForm({ ...form, sourceUrl: e.target.value })}
                  placeholder="https://"
                />
              </Field>
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={form.active}
                  onChange={(e) => setForm({ ...form, active: e.target.checked })}
                  className="h-4 w-4 rounded border-input"
                />
                Active
              </label>

              <div className="col-span-full flex items-center gap-3">
                <Button type="submit" disabled={saving}>
                  {t("common.save")}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowForm(false)}
                >
                  {t("common.cancel")}
                </Button>
                {formError ? (
                  <span className="text-sm text-destructive" role="alert">
                    {formError}
                  </span>
                ) : null}
              </div>
            </form>
          </CardContent>
        </Card>
      ) : null}

      {status === "loading" ? <LoadingState /> : null}
      {status === "error" ? <ErrorState message={t("error.generic")} onRetry={load} /> : null}
      {status === "ready" && alerts && alerts.length === 0 ? (
        <EmptyState title={t("alerts.empty")} />
      ) : null}

      {status === "ready" && alerts && alerts.length > 0 ? (
        <ul className="space-y-2">
          {alerts.map((a) => (
            <li key={a.id}>
              <Card>
                <CardContent className="flex items-center justify-between gap-3 py-4">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="truncate font-medium">{a.titleEn}</p>
                      <Badge variant="outline">
                        {t(`alerts.category.${a.category}` as TranslationKey)}
                      </Badge>
                      <Badge variant="secondary">
                        {t(`alerts.severity.${a.severity}` as TranslationKey)}
                      </Badge>
                    </div>
                    <p className="truncate text-sm text-muted-foreground">
                      {a.titleEs}
                    </p>
                  </div>
                  <div className="flex shrink-0 gap-1">
                    <Button variant="ghost" size="icon" onClick={() => startEdit(a)}>
                      <Pencil className="h-4 w-4" aria-hidden="true" />
                      <span className="sr-only">{t("common.edit")}</span>
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => remove(a.id)}>
                      <Trash2 className="h-4 w-4 text-destructive" aria-hidden="true" />
                      <span className="sr-only">{t("common.delete")}</span>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}

function Field({
  label,
  htmlFor,
  full,
  children,
}: {
  label: string;
  htmlFor: string;
  full?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className={full ? "sm:col-span-2" : undefined}>
      <Label htmlFor={htmlFor} className="mb-1.5 block">
        {label}
      </Label>
      {children}
    </div>
  );
}
