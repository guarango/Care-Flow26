import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import PageHeader from "@/components/shared/PageHeader";
import StatusBadge from "@/components/shared/StatusBadge";
import EmptyState from "@/components/shared/EmptyState";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { AlertTriangle, Plus, Search, Lock } from "lucide-react";
import { useRole } from "@/hooks/useRole";
import { useAssignedClients } from "@/hooks/useAssignedClients";
import NoDSPClientsState from "@/components/shared/NoDSPClientsState";

const types = ["Behavioral", "Medical", "Fall", "Elopement", "Property Damage", "Medication Error", "Injury", "Abuse/Neglect", "Exploitation", "Other"];
const severities = ["Low", "Medium", "High", "Critical"];
const dhhs_levels = ["Level III — Serious Incident", "Level II — Critical Incident"];
const incidentStatuses = ["Open", "Under Review", "Resolved", "Closed"];

const emptyIncident = {
  client_id: "", client_name: "", reported_by_name: "", staff_involved: "",
  date: "", time: "", type: "", dhhs_level: "", severity: "", description: "",
  injury_occurred: false, injury_description: "",
  medical_treatment_required: false, medical_treatment_notes: "",
  law_enforcement_involved: false, law_enforcement_notes: "",
  level3_missing_person: false, level3_er_visit: false, level3_self_injurious: false,
  level3_restraint_used: false, level3_restraint_description: "",
  level3_medication_error_adverse: false, level3_property_destruction: false,
  level3_drug_alcohol: false, level3_aspiration_choking: false,
  level2_hospitalization: false, level2_abuse_neglect: false,
  level2_exploitation: false, level2_law_enforcement_charges: false,
  initial_report_submitted_24hr: false, initial_report_timestamp: "",
  full_report_completed_5days: false, full_report_completed_date: "",
  support_coordinator_notified: false, support_coordinator_notified_at: "",
  guardian_notified: false, guardian_notified_at: "",
  actions_taken: "", witnesses: "",
  follow_up_required: false, follow_up_notes: "", status: "Open"
};

export default function Incidents() {
  const { can, isDSP, role } = useRole();
  const { isDSPMode, assignedClientIds } = useAssignedClients();
  const [showDialog, setShowDialog] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyIncident);
  const [search, setSearch] = useState("");

  const queryClient = useQueryClient();
  const { data: incidents = [], isLoading } = useQuery({
    queryKey: ["incidents"],
    queryFn: () => base44.entities.IncidentReport.list("-created_date"),
  });

  const { data: clients = [] } = useQuery({
    queryKey: ["clients"],
    queryFn: () => base44.entities.Client.list(),
  });

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.IncidentReport.create(data),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["incidents"] }); closeDialog(); },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.IncidentReport.update(id, data),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["incidents"] }); closeDialog(); },
  });

  const closeDialog = () => { setShowDialog(false); setEditing(null); setForm(emptyIncident); };
  const openNew = () => { setForm(emptyIncident); setEditing(null); setShowDialog(true); };
  const openEdit = (i) => { setForm(i); setEditing(i); setShowDialog(true); };

  const handleSave = () => {
    const data = { ...form };
    // DSPs always submit as "Pending Review" — they cannot set status
    if (isDSP && !editing) data.status = "Under Review";
    if (editing) updateMutation.mutate({ id: editing.id, data });
    else createMutation.mutate(data);
  };

  const handleClientSelect = (clientId) => {
    const client = clients.find(c => c.id === clientId);
    setForm({ ...form, client_id: clientId, client_name: client ? `${client.first_name} ${client.last_name}` : "" });
  };

  const visibleClients = isDSPMode ? clients.filter(c => assignedClientIds.includes(c.id)) : clients;
  const visibleIncidents = isDSPMode ? incidents.filter(i => assignedClientIds.includes(i.client_id)) : incidents;

  const filtered = visibleIncidents.filter(i =>
    `${i.client_name} ${i.type} ${i.severity} ${i.status}`.toLowerCase().includes(search.toLowerCase())
  );

  if (isDSPMode && assignedClientIds.length === 0) return <NoDSPClientsState />;

  return (
    <div>
      <PageHeader
    title="Incident Reports"
    subtitle={isDSP ? "Your submitted reports" : `${incidents.length} reports`}
    action={<Button onClick={openNew} className="bg-destructive hover:bg-destructive/90"><Plus className="w-4 h-4 mr-2" />Report Incident</Button>}
  />
  {isDSP && (
    <div className="flex items-center gap-2 mb-4 bg-chart-4/10 border border-chart-4/20 rounded-lg px-4 py-2.5 text-sm text-chart-4">
      <Lock className="w-4 h-4 flex-shrink-0" />
      <span>Incidents you submit will be sent to your supervisor for review. You cannot change the status of a submitted report.</span>
    </div>
  )}

      <Card className="mb-6">
        <CardContent className="py-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input placeholder="Search incidents..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9 border-0 bg-transparent focus-visible:ring-0" />
          </div>
        </CardContent>
      </Card>

      {filtered.length === 0 && !isLoading ? (
        <EmptyState icon={AlertTriangle} title="No incidents" description="No incident reports have been filed." action={<Button onClick={openNew} size="sm"><Plus className="w-4 h-4 mr-1" />Report Incident</Button>} />
      ) : (
        <Card>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Client</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Severity</TableHead>
                  <TableHead className="hidden md:table-cell">Date</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((i) => (
                  <TableRow key={i.id} className="cursor-pointer hover:bg-muted/50" onClick={() => openEdit(i)}>
                    <TableCell className="font-medium">{i.client_name || "—"}</TableCell>
                    <TableCell className="text-sm">{i.type}</TableCell>
                    <TableCell><StatusBadge status={i.severity} /></TableCell>
                    <TableCell className="hidden md:table-cell text-sm">{i.date}</TableCell>
                    <TableCell><StatusBadge status={i.status} /></TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </Card>
      )}

      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>{editing ? "Edit Incident Report" : "Report Incident"}</DialogTitle></DialogHeader>
          <div className="space-y-5">

            {/* ── Basic Info ── */}
            <div>
              <p className="text-xs font-semibold text-primary uppercase tracking-wide mb-3">Incident Details</p>
              <div className="grid grid-cols-2 gap-3">
                <div className="col-span-2">
                  <Label>Client *</Label>
                  <Select value={form.client_id} onValueChange={handleClientSelect}>
                    <SelectTrigger><SelectValue placeholder="Select client" /></SelectTrigger>
                    <SelectContent>{visibleClients.map(c => <SelectItem key={c.id} value={c.id}>{c.first_name} {c.last_name}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div><Label>Date *</Label><Input type="date" value={form.date} onChange={(e) => setForm({...form, date: e.target.value})} /></div>
                <div><Label>Time</Label><Input type="time" value={form.time} onChange={(e) => setForm({...form, time: e.target.value})} /></div>
                <div>
                  <Label>Incident Type *</Label>
                  <Select value={form.type} onValueChange={(v) => setForm({...form, type: v})}>
                    <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                    <SelectContent>{types.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Severity *</Label>
                  <Select value={form.severity} onValueChange={(v) => setForm({...form, severity: v})}>
                    <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                    <SelectContent>{severities.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div className="col-span-2">
                  <Label>DHHS Classification (R501-1-9)</Label>
                  <Select value={form.dhhs_level || ""} onValueChange={(v) => setForm({...form, dhhs_level: v})}>
                    <SelectTrigger><SelectValue placeholder="Select DHHS level if applicable" /></SelectTrigger>
                    <SelectContent>{dhhs_levels.map(l => <SelectItem key={l} value={l}>{l}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div><Label>Reported By</Label><Input value={form.reported_by_name} onChange={(e) => setForm({...form, reported_by_name: e.target.value})} /></div>
                <div><Label>Staff Involved</Label><Input value={form.staff_involved || ""} onChange={(e) => setForm({...form, staff_involved: e.target.value})} /></div>
                <div><Label>Witnesses</Label><Input value={form.witnesses} onChange={(e) => setForm({...form, witnesses: e.target.value})} /></div>
                <div className="col-span-2"><Label>Description *</Label><Textarea value={form.description} onChange={(e) => setForm({...form, description: e.target.value})} rows={3} /></div>
                <div className="col-span-2"><Label>Actions Taken</Label><Textarea value={form.actions_taken} onChange={(e) => setForm({...form, actions_taken: e.target.value})} rows={2} /></div>
              </div>
            </div>

            {/* ── Injury / Medical / Law Enforcement ── */}
            <div className="border-t pt-4">
              <p className="text-xs font-semibold text-primary uppercase tracking-wide mb-3">Safety & Medical</p>
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Checkbox checked={!!form.injury_occurred} onCheckedChange={(v) => setForm({...form, injury_occurred: v})} />
                  <Label>Injury Occurred</Label>
                </div>
                {form.injury_occurred && <div><Label>Injury Description</Label><Input value={form.injury_description || ""} onChange={e => setForm({...form, injury_description: e.target.value})} /></div>}
                <div className="flex items-center gap-2">
                  <Checkbox checked={!!form.medical_treatment_required} onCheckedChange={(v) => setForm({...form, medical_treatment_required: v})} />
                  <Label>Medical Treatment Required</Label>
                </div>
                {form.medical_treatment_required && <div><Label>Medical Treatment Notes</Label><Input value={form.medical_treatment_notes || ""} onChange={e => setForm({...form, medical_treatment_notes: e.target.value})} /></div>}
                <div className="flex items-center gap-2">
                  <Checkbox checked={!!form.law_enforcement_involved} onCheckedChange={(v) => setForm({...form, law_enforcement_involved: v})} />
                  <Label>Law Enforcement Involved</Label>
                </div>
                {form.law_enforcement_involved && <div><Label>Law Enforcement Notes</Label><Input value={form.law_enforcement_notes || ""} onChange={e => setForm({...form, law_enforcement_notes: e.target.value})} /></div>}
              </div>
            </div>

            {/* ── Level III Indicators ── */}
            {(form.dhhs_level === "Level III — Serious Incident" || !form.dhhs_level) && (
              <div className="border-t pt-4">
                <p className="text-xs font-semibold text-amber-700 uppercase tracking-wide mb-3">Level III Indicators (check all that apply)</p>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    ["level3_missing_person", "Missing person (2+ hours)"],
                    ["level3_er_visit", "ER or clinic visit"],
                    ["level3_self_injurious", "Self-injurious behavior"],
                    ["level3_restraint_used", "Restraint used"],
                    ["level3_medication_error_adverse", "Medication error with adverse effects"],
                    ["level3_property_destruction", "Property destruction ($500+)"],
                    ["level3_drug_alcohol", "Drug/alcohol involvement"],
                    ["level3_aspiration_choking", "Aspiration or choking"],
                  ].map(([key, label]) => (
                    <div key={key} className="flex items-center gap-2">
                      <Checkbox checked={!!form[key]} onCheckedChange={(v) => setForm({...form, [key]: v})} />
                      <Label className="text-xs">{label}</Label>
                    </div>
                  ))}
                </div>
                {form.level3_restraint_used && (
                  <div className="mt-3"><Label>Restraint Description</Label><Input value={form.level3_restraint_description || ""} onChange={e => setForm({...form, level3_restraint_description: e.target.value})} /></div>
                )}
              </div>
            )}

            {/* ── Level II Indicators ── */}
            {(form.dhhs_level === "Level II — Critical Incident" || !form.dhhs_level) && (
              <div className="border-t pt-4">
                <p className="text-xs font-semibold text-destructive uppercase tracking-wide mb-3">Level II Critical Indicators (check all that apply)</p>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    ["level2_hospitalization", "Hospitalization"],
                    ["level2_abuse_neglect", "Abuse/neglect with medical treatment"],
                    ["level2_exploitation", "Exploitation of funds"],
                    ["level2_law_enforcement_charges", "Law enforcement charges filed"],
                  ].map(([key, label]) => (
                    <div key={key} className="flex items-center gap-2">
                      <Checkbox checked={!!form[key]} onCheckedChange={(v) => setForm({...form, [key]: v})} />
                      <Label className="text-xs">{label}</Label>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ── Reporting Timeline Compliance ── */}
            <div className="border-t pt-4">
              <p className="text-xs font-semibold text-primary uppercase tracking-wide mb-3">Reporting Timeline & Notifications</p>
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-3 items-end">
                  <div className="flex items-center gap-2">
                    <Checkbox checked={!!form.initial_report_submitted_24hr} onCheckedChange={(v) => setForm({...form, initial_report_submitted_24hr: v})} />
                    <Label className="text-sm">Initial report submitted within 24 hrs</Label>
                  </div>
                  <div><Label>Timestamp</Label><Input type="datetime-local" value={form.initial_report_timestamp || ""} onChange={e => setForm({...form, initial_report_timestamp: e.target.value})} /></div>
                </div>
                <div className="grid grid-cols-2 gap-3 items-end">
                  <div className="flex items-center gap-2">
                    <Checkbox checked={!!form.full_report_completed_5days} onCheckedChange={(v) => setForm({...form, full_report_completed_5days: v})} />
                    <Label className="text-sm">Full report completed within 5 business days</Label>
                  </div>
                  <div><Label>Completion Date</Label><Input type="date" value={form.full_report_completed_date || ""} onChange={e => setForm({...form, full_report_completed_date: e.target.value})} /></div>
                </div>
                <div className="grid grid-cols-2 gap-3 items-end">
                  <div className="flex items-center gap-2">
                    <Checkbox checked={!!form.support_coordinator_notified} onCheckedChange={(v) => setForm({...form, support_coordinator_notified: v})} />
                    <Label className="text-sm">Support Coordinator Notified</Label>
                  </div>
                  <div><Label>Notified At</Label><Input type="datetime-local" value={form.support_coordinator_notified_at || ""} onChange={e => setForm({...form, support_coordinator_notified_at: e.target.value})} /></div>
                </div>
                <div className="grid grid-cols-2 gap-3 items-end">
                  <div className="flex items-center gap-2">
                    <Checkbox checked={!!form.guardian_notified} onCheckedChange={(v) => setForm({...form, guardian_notified: v})} />
                    <Label className="text-sm">Guardian Notified</Label>
                  </div>
                  <div><Label>Notified At</Label><Input type="datetime-local" value={form.guardian_notified_at || ""} onChange={e => setForm({...form, guardian_notified_at: e.target.value})} /></div>
                </div>
              </div>
            </div>

            {/* ── Follow-up & Status ── */}
            <div className="border-t pt-4 grid grid-cols-2 gap-3">
              {can("changeIncidentStatus") ? (
                <div>
                  <Label>Status</Label>
                  <Select value={form.status} onValueChange={(v) => setForm({...form, status: v})}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>{incidentStatuses.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
              ) : (
                <div>
                  <Label>Status</Label>
                  <div className="flex h-9 items-center px-3 rounded-md border bg-muted text-sm text-muted-foreground">Under Review (set by supervisor)</div>
                </div>
              )}
              <div className="flex items-center gap-2 pt-6">
                <Checkbox checked={form.follow_up_required} onCheckedChange={(v) => setForm({...form, follow_up_required: v})} />
                <Label>Follow-up Required</Label>
              </div>
              {form.follow_up_required && (
                <div className="col-span-2"><Label>Follow-up Notes</Label><Textarea value={form.follow_up_notes} onChange={(e) => setForm({...form, follow_up_notes: e.target.value})} rows={2} /></div>
              )}
            </div>
          </div>

          <DialogFooter className="mt-4">
            <Button variant="outline" onClick={closeDialog}>Cancel</Button>
            <Button onClick={handleSave} disabled={!form.client_id || !form.date || !form.type || !form.severity || !form.description}>{editing ? "Update" : "Submit"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}