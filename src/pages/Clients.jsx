import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import PageHeader from "@/components/shared/PageHeader";
import StatusBadge from "@/components/shared/StatusBadge";
import EmptyState from "@/components/shared/EmptyState";
import ClientIntakeForm from "@/components/clients/ClientIntakeForm";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Heart, Plus, Search, LayoutGrid, List, ShieldAlert } from "lucide-react";
import { useAssignedClients } from "@/hooks/useAssignedClients";
import { useRole } from "@/hooks/useRole";
import NoDSPClientsState from "@/components/shared/NoDSPClientsState";

const emptyClient = {
  first_name: "", last_name: "", date_of_birth: "", gender: "",
  phone: "", form_completed_by: "", ssn: "", pin: "",
  medicaid_case_number: "", medicaid_number: "", case_review_date: "", medicaid_case_worker: "",
  diagnosis: "", address: "", insurance_id: "", insurance_provider: "",
  pharmacy_name: "", pharmacy_contact: "", prescriber: "", medications: "", allergies: "", medical_concerns: "",
  support_coordinator_name: "", support_coordinator_email: "", support_coordinator_phone: "",
  place_of_work_name: "", place_of_work_address: "", place_of_work_phone: "",
  emergency_contact_name: "", emergency_contact_email: "", emergency_contact_phone: "",
  emergency_contact_address: "", emergency_contact_method: "", emergency_contact_relation: "",
  guardian_name: "", guardian_email: "", guardian_phone: "", guardian_address: "",
  guardian_contact_method: "", guardian_relation: "",
  pcp_name: "", pcp_address: "", pcp_phone: "",
  dentist_name: "", dentist_address: "", dentist_phone: "",
  healthcare_provider1_name: "", healthcare_provider1_address: "", healthcare_provider1_phone: "",
  healthcare_provider2_name: "", healthcare_provider2_address: "", healthcare_provider2_phone: "",
  service_enrollments: [], status: "Active",
  other_information: "", notes: ""
};

export default function Clients() {
  const { isAdmin } = useRole();
  const { isDSPMode, assignedClientIds } = useAssignedClients();
  const [showDialog, setShowDialog] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyClient);
  const [search, setSearch] = useState("");
  const [viewMode, setViewMode] = useState("grid");

  const queryClient = useQueryClient();
  const { data: clients = [], isLoading } = useQuery({
    queryKey: ["clients"],
    queryFn: () => base44.entities.Client.list(),
  });

  const { data: serviceCodes = [] } = useQuery({
    queryKey: ["service-codes"],
    queryFn: () => base44.entities.ServiceCode.list(),
  });

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.Client.create(data),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["clients"] }); closeDialog(); },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Client.update(id, data),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["clients"] }); closeDialog(); },
  });

  const closeDialog = () => { setShowDialog(false); setEditing(null); setForm(emptyClient); };
  const openNew = () => { setForm(emptyClient); setEditing(null); setShowDialog(true); };
  const openEdit = (c) => {
    // Migrate legacy clients that have flat service fields
    const migrated = { ...c };
    if (!migrated.service_enrollments || migrated.service_enrollments.length === 0) {
      if (c.service_type) {
        migrated.service_enrollments = [{
          service_type: c.service_type,
          service_code_id: c.service_code_id || "",
          service_code: c.service_code || "",
          rate: 0,
          rate_type: "Hourly",
          schedule_days: c.schedule_days || [],
          schedule_start_time: c.schedule_start_time || "",
          schedule_end_time: c.schedule_end_time || "",
        }];
      } else {
        migrated.service_enrollments = [];
      }
    }
    setForm(migrated);
    setEditing(c);
    setShowDialog(true);
  };

  const handleSave = () => {
    if (editing) updateMutation.mutate({ id: editing.id, data: form });
    else createMutation.mutate(form);
  };

  // DSP mode: only show assigned clients
  const visibleClients = isDSPMode
    ? clients.filter(c => assignedClientIds.includes(c.id))
    : clients;

  const filtered = visibleClients.filter(c =>
    `${c.first_name} ${c.last_name} ${c.diagnosis}`.toLowerCase().includes(search.toLowerCase())
  );

  const getServiceSummary = (c) => {
    const enrollments = c.service_enrollments || [];
    // also handle legacy flat field
    if (enrollments.length === 0 && c.service_type) return c.service_type;
    if (enrollments.length === 0) return "—";
    if (enrollments.length === 1) return enrollments[0].service_type || "—";
    return `${enrollments.length} services`;
  };

  if (isDSPMode && assignedClientIds.length === 0) return <NoDSPClientsState />;

  // HIPAA: abbreviated display name (e.g. "M. Johnson") for shared/list views
  const abbrevName = (c) => `${c.first_name?.[0] || ""}. ${c.last_name || ""}`;

  return (
    <div>
      <PageHeader title="Client Records" subtitle={`${visibleClients.length} clients`} action={!isDSPMode && <Button onClick={openNew}><Plus className="w-4 h-4 mr-2" />Add Client</Button>} />

      {/* HIPAA Notice — Policy #4800 */}
      <div className="flex items-start gap-2 mb-4 bg-amber-50 border border-amber-200 rounded-lg px-4 py-2.5 text-sm text-amber-800">
        <ShieldAlert className="w-4 h-4 mt-0.5 flex-shrink-0 text-amber-600" />
        <span><strong>HIPAA Notice (Policy #4800):</strong> This screen contains Protected Health Information (PHI). Do not share, screenshot, or export client records through personal devices or unapproved channels. Access is logged and restricted to authorized staff only.</span>
      </div>

      <Card className="mb-6">
        <CardContent className="py-3">
          <div className="flex items-center gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input placeholder="Search clients..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9 border-0 bg-transparent focus-visible:ring-0" />
            </div>
            <div className="flex items-center gap-1 border border-border rounded-lg p-1">
              <button onClick={() => setViewMode("grid")} className={`p-1.5 rounded ${viewMode === "grid" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"}`}>
                <LayoutGrid className="w-4 h-4" />
              </button>
              <button onClick={() => setViewMode("list")} className={`p-1.5 rounded ${viewMode === "list" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"}`}>
                <List className="w-4 h-4" />
              </button>
            </div>
          </div>
        </CardContent>
      </Card>

      {filtered.length === 0 && !isLoading ? (
        <EmptyState icon={Heart} title="No clients" description={isDSPMode ? "No assigned clients match your search." : "Add your first client to get started."} action={!isDSPMode && <Button onClick={openNew} size="sm"><Plus className="w-4 h-4 mr-1" />Add Client</Button>} />
      ) : viewMode === "grid" ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {filtered.map((c) => {
            const initials = `${c.first_name?.[0] || ""}${c.last_name?.[0] || ""}`.toUpperCase();
            const colors = ["bg-blue-100 text-blue-700", "bg-purple-100 text-purple-700", "bg-green-100 text-green-700", "bg-pink-100 text-pink-700", "bg-amber-100 text-amber-700", "bg-cyan-100 text-cyan-700", "bg-rose-100 text-rose-700"];
            const color = colors[(c.first_name?.charCodeAt(0) || 0) % colors.length];
            const service = getServiceSummary(c);
            return (
              <Card key={c.id} className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => openEdit(c)}>
                <CardContent className="p-0">
                  <div className="bg-muted/40 flex items-center justify-center h-32 rounded-t-xl">
                    {c.photo_url
                      ? <img src={c.photo_url} alt={`${c.first_name} ${c.last_name}`} className="w-20 h-20 rounded-full object-cover" />
                      : <div className={`w-20 h-20 rounded-full flex items-center justify-center text-2xl font-bold ${color}`}>{initials}</div>
                    }
                  </div>
                  <div className="p-3">
                    <p className="font-semibold text-foreground text-sm truncate">{c.first_name} {c.last_name}</p>
                    {service !== "—" && (
                      <Badge variant="outline" className="text-[10px] mt-1">{service}</Badge>
                    )}
                    <div className="mt-2">
                      <StatusBadge status={c.status || "Active"} />
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      ) : (
        <Card>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Services</TableHead>
                  <TableHead className="hidden md:table-cell">DOB</TableHead>
                  <TableHead className="hidden md:table-cell">Guardian</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((c) => (
                  <TableRow key={c.id} className="cursor-pointer hover:bg-muted/50" onClick={() => openEdit(c)}>
                    <TableCell className="font-medium">
                      <span title={`${c.first_name} ${c.last_name}`}>{abbrevName(c)}</span>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {(c.service_enrollments || []).length > 0
                          ? (c.service_enrollments || []).map((e, i) => (
                              <Badge key={i} variant="outline" className="text-[10px]">{e.service_type || "—"}</Badge>
                            ))
                          : <span className="text-sm text-muted-foreground">{getServiceSummary(c)}</span>
                        }
                      </div>
                    </TableCell>
                    <TableCell className="hidden md:table-cell text-sm">{c.date_of_birth || "—"}</TableCell>
                    <TableCell className="hidden md:table-cell text-sm">{c.guardian_name || "—"}</TableCell>
                    <TableCell><StatusBadge status={c.status || "Active"} /></TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </Card>
      )}

      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>{editing ? "Edit Client" : "Add Client"}</DialogTitle></DialogHeader>
          <ClientIntakeForm
            form={form}
            setForm={setForm}
            editing={editing}
            isAdmin={isAdmin}
            serviceCodes={serviceCodes}
          />
          <DialogFooter className="mt-4">
            <Button variant="outline" onClick={closeDialog}>Cancel</Button>
            <Button onClick={handleSave} disabled={!form.first_name || !form.last_name}>{editing ? "Update" : "Create"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}