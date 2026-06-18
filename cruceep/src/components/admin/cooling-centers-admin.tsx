"use client";

import { useCallback, useEffect, useState } from "react";
import { Pencil, Plus, Trash2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { LoadingState, ErrorState, EmptyState } from "@/components/states";
import { useTranslation } from "@/lib/i18n/context";
import { apiFetch, ClientApiError } from "@/lib/client-api";
import { coolingCenterInputSchema } from "@/lib/validation";
import type { CoolingCenter, CoolingCenterType } from "@/lib/types";
import type { TranslationKey } from "@/lib/i18n/dictionary";

const TYPES: CoolingCenterType[] = [
  "cooling_center",
  "library",
  "public_facility",
  "shelter",
  "recreation_center",
];

interface FormState {
  name: string;
  type: CoolingCenterType;
  address: string;
  phone: string;
  website: string;
  hoursEn: string;
  hoursEs: string;
  source: string;
  active: boolean;
}

const EMPTY: FormState = {
  name: "",
  type: "cooling_center",
  address: "",
  phone: "",
  website: "",
  hoursEn: "",
  hoursEs: "",
  source: "City of El Paso",
  active: true,
};

export function CoolingCentersAdmin() {
  const { t } = useTranslation();
  const [centers, setCenters] = useState<CoolingCenter[] | null>(null);
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<FormState>(EMPTY);
  const [formError, setFormError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setStatus("loading");
    try {
      const res = await apiFetch<{ centers: CoolingCenter[] }>(
        "/api/admin/cooling-centers"
      );
      setCenters(res.centers);
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

  const startEdit = (c: CoolingCenter) => {
    setEditingId(c.id);
    setForm({
      name: c.name,
      type: c.type,
      address: c.address,
      phone: c.phone ?? "",
      website: c.website ?? "",
      hoursEn: c.hoursEn ?? "",
      hoursEs: c.hoursEs ?? "",
      source: c.source,
      active: c.active,
    });
    setFormError(null);
    setShowForm(true);
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    const parsed = coolingCenterInputSchema.safeParse({
      ...form,
      website: form.website || null,
      phone: form.phone || null,
      hoursEn: form.hoursEn || null,
      hoursEs: form.hoursEs || null,
    });
    if (!parsed.success) {
      setFormError(t("error.validation"));
      return;
    }
    setSaving(true);
    try {
      if (editingId) {
        await apiFetch(`/api/admin/cooling-centers/${editingId}`, {
          method: "PATCH",
          body: JSON.stringify(parsed.data),
        });
      } else {
        await apiFetch("/api/admin/cooling-centers", {
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
      await apiFetch(`/api/admin/cooling-centers/${id}`, { method: "DELETE" });
      await load();
    } catch {
      // surfaced via reload; keep silent inline
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button onClick={startCreate}>
          <Plus className="h-4 w-4" aria-hidden="true" />
          {t("admin.coolingCenters.new")}
        </Button>
      </div>

      {showForm ? (
        <Card>
          <CardHeader className="flex-row items-center justify-between space-y-0">
            <CardTitle className="text-base">
              {editingId ? t("common.edit") : t("admin.coolingCenters.new")}
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
              <Field label={t("cooling.title")} htmlFor="cc-name">
                <Input
                  id="cc-name"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  required
                />
              </Field>
              <Field label={t("alerts.category.city")} htmlFor="cc-type">
                <Select
                  id="cc-type"
                  value={form.type}
                  onChange={(e) =>
                    setForm({ ...form, type: e.target.value as CoolingCenterType })
                  }
                >
                  {TYPES.map((ty) => (
                    <option key={ty} value={ty}>
                      {t(`cooling.type.${ty}` as TranslationKey)}
                    </option>
                  ))}
                </Select>
              </Field>
              <Field label="Address" htmlFor="cc-address" full>
                <Input
                  id="cc-address"
                  value={form.address}
                  onChange={(e) => setForm({ ...form, address: e.target.value })}
                  required
                />
              </Field>
              <Field label={t("cooling.phone")} htmlFor="cc-phone">
                <Input
                  id="cc-phone"
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                />
              </Field>
              <Field label={t("cooling.website")} htmlFor="cc-website">
                <Input
                  id="cc-website"
                  type="url"
                  value={form.website}
                  onChange={(e) => setForm({ ...form, website: e.target.value })}
                  placeholder="https://"
                />
              </Field>
              <Field label={`${t("cooling.hours")} (EN)`} htmlFor="cc-hours-en">
                <Input
                  id="cc-hours-en"
                  value={form.hoursEn}
                  onChange={(e) => setForm({ ...form, hoursEn: e.target.value })}
                />
              </Field>
              <Field label={`${t("cooling.hours")} (ES)`} htmlFor="cc-hours-es">
                <Input
                  id="cc-hours-es"
                  value={form.hoursEs}
                  onChange={(e) => setForm({ ...form, hoursEs: e.target.value })}
                />
              </Field>
              <Field label={t("common.source")} htmlFor="cc-source">
                <Input
                  id="cc-source"
                  value={form.source}
                  onChange={(e) => setForm({ ...form, source: e.target.value })}
                  required
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
      {status === "ready" && centers && centers.length === 0 ? (
        <EmptyState title={t("cooling.empty")} />
      ) : null}

      {status === "ready" && centers && centers.length > 0 ? (
        <ul className="space-y-2">
          {centers.map((c) => (
            <li key={c.id}>
              <Card>
                <CardContent className="flex items-center justify-between gap-3 py-4">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="truncate font-medium">{c.name}</p>
                      {!c.active ? (
                        <Badge variant="secondary">inactive</Badge>
                      ) : null}
                    </div>
                    <p className="truncate text-sm text-muted-foreground">
                      {c.address}
                    </p>
                  </div>
                  <div className="flex shrink-0 gap-1">
                    <Button variant="ghost" size="icon" onClick={() => startEdit(c)}>
                      <Pencil className="h-4 w-4" aria-hidden="true" />
                      <span className="sr-only">{t("common.edit")}</span>
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => remove(c.id)}>
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
