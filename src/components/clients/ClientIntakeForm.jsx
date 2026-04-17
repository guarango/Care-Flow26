import React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import ServiceEnrollments from "@/components/clients/ServiceEnrollments";
import AssignedStaffSection from "@/components/clients/AssignedStaffSection";

const genders = ["Male", "Female", "Non-binary", "Other"];
const clientStatuses = ["Active", "Inactive", "Discharged"];

function SectionHeader({ title }) {
  return (
    <div className="col-span-2 border-t pt-4 mt-2">
      <h3 className="text-sm font-semibold text-primary uppercase tracking-wide">{title}</h3>
    </div>
  );
}

function Field({ label, children, colSpan = 1 }) {
  return (
    <div className={colSpan === 2 ? "col-span-2" : ""}>
      <Label className="text-xs text-muted-foreground mb-1 block">{label}</Label>
      {children}
    </div>
  );
}

export default function ClientIntakeForm({ form, setForm, editing, isAdmin, serviceCodes }) {
  const f = (field) => (e) => setForm({ ...form, [field]: e.target.value });
  const val = (field) => form[field] || "";

  return (
    <div className="grid grid-cols-2 gap-4">

      {/* ── CLIENT INFO — General ── */}
      <SectionHeader title="Client Info — General" />

      <Field label="First Name *">
        <Input value={val("first_name")} onChange={f("first_name")} />
      </Field>
      <Field label="Last Name *">
        <Input value={val("last_name")} onChange={f("last_name")} />
      </Field>
      <Field label="Date of Birth">
        <Input type="date" value={val("date_of_birth")} onChange={f("date_of_birth")} />
      </Field>
      <Field label="Gender">
        <Select value={val("gender")} onValueChange={(v) => setForm({ ...form, gender: v })}>
          <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
          <SelectContent>{genders.map(g => <SelectItem key={g} value={g}>{g}</SelectItem>)}</SelectContent>
        </Select>
      </Field>
      <Field label="Phone Number">
        <Input value={val("phone")} onChange={f("phone")} placeholder="(555) 000-0000" />
      </Field>
      <Field label="Name of Person Filling Out Form">
        <Input value={val("form_completed_by")} onChange={f("form_completed_by")} />
      </Field>
      <Field label="Social Security Number">
        <Input value={val("ssn")} onChange={f("ssn")} placeholder="XXX-XX-XXXX" />
      </Field>
      <Field label="Personal Identification Number (PIN)">
        <Input value={val("pin")} onChange={f("pin")} />
      </Field>
      <Field label="Medicaid Case Number">
        <Input value={val("medicaid_case_number")} onChange={f("medicaid_case_number")} />
      </Field>
      <Field label="Medicaid Number">
        <Input value={val("medicaid_number")} onChange={f("medicaid_number")} />
      </Field>
      <Field label="Case Review Date">
        <Input type="date" value={val("case_review_date")} onChange={f("case_review_date")} />
      </Field>
      <Field label="Medicaid Case Worker Name">
        <Input value={val("medicaid_case_worker")} onChange={f("medicaid_case_worker")} />
      </Field>
      <Field label="Insurance Provider">
        <Input value={val("insurance_provider")} onChange={f("insurance_provider")} />
      </Field>
      <Field label="Insurance ID">
        <Input value={val("insurance_id")} onChange={f("insurance_id")} />
      </Field>
      <Field label="Address" colSpan={2}>
        <Input value={val("address")} onChange={f("address")} />
      </Field>
      <Field label="Diagnosis" colSpan={2}>
        <Input value={val("diagnosis")} onChange={f("diagnosis")} />
      </Field>
      <Field label="Status">
        <Select value={val("status") || "Active"} onValueChange={(v) => setForm({ ...form, status: v })}>
          <SelectTrigger><SelectValue /></SelectTrigger>
          <SelectContent>{clientStatuses.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
        </Select>
      </Field>

      {/* ── CLIENT INFO — Medical ── */}
      <SectionHeader title="Client Info — Medical" />

      <Field label="Current Pharmacy Name">
        <Input value={val("pharmacy_name")} onChange={f("pharmacy_name")} />
      </Field>
      <Field label="Pharmacy Contact">
        <Input value={val("pharmacy_contact")} onChange={f("pharmacy_contact")} />
      </Field>
      <Field label="Who Prescribes the Medications" colSpan={2}>
        <Input value={val("prescriber")} onChange={f("prescriber")} />
      </Field>
      <Field label="Medications" colSpan={2}>
        <Textarea value={val("medications")} onChange={f("medications")} rows={3} placeholder="List medications, dosages, and schedules..." />
      </Field>
      <Field label="Allergies" colSpan={2}>
        <Input value={val("allergies")} onChange={f("allergies")} placeholder="e.g. Penicillin, Latex" />
      </Field>
      <Field label="Medical Concerns" colSpan={2}>
        <Textarea value={val("medical_concerns")} onChange={f("medical_concerns")} rows={2} placeholder="Any ongoing or notable medical concerns..." />
      </Field>

      {/* ── CONTACT INFORMATION ── */}
      <SectionHeader title="Contact Information" />

      {/* Support Coordinator */}
      <div className="col-span-2">
        <p className="text-xs font-medium text-foreground mb-2">Support Coordinator</p>
        <div className="grid grid-cols-3 gap-3">
          <div><Label className="text-xs text-muted-foreground">Name</Label><Input value={val("support_coordinator_name")} onChange={f("support_coordinator_name")} /></div>
          <div><Label className="text-xs text-muted-foreground">Email</Label><Input value={val("support_coordinator_email")} onChange={f("support_coordinator_email")} /></div>
          <div><Label className="text-xs text-muted-foreground">Phone</Label><Input value={val("support_coordinator_phone")} onChange={f("support_coordinator_phone")} /></div>
        </div>
      </div>

      {/* Place of Work */}
      <div className="col-span-2">
        <p className="text-xs font-medium text-foreground mb-2">Place of Work</p>
        <div className="grid grid-cols-3 gap-3">
          <div><Label className="text-xs text-muted-foreground">Name</Label><Input value={val("place_of_work_name")} onChange={f("place_of_work_name")} /></div>
          <div><Label className="text-xs text-muted-foreground">Address</Label><Input value={val("place_of_work_address")} onChange={f("place_of_work_address")} /></div>
          <div><Label className="text-xs text-muted-foreground">Phone</Label><Input value={val("place_of_work_phone")} onChange={f("place_of_work_phone")} /></div>
        </div>
      </div>

      {/* Emergency Contact */}
      <div className="col-span-2">
        <p className="text-xs font-medium text-foreground mb-2">Emergency Contact</p>
        <div className="grid grid-cols-2 gap-3">
          <div><Label className="text-xs text-muted-foreground">Name</Label><Input value={val("emergency_contact_name")} onChange={f("emergency_contact_name")} /></div>
          <div><Label className="text-xs text-muted-foreground">Email</Label><Input value={val("emergency_contact_email")} onChange={f("emergency_contact_email")} /></div>
          <div><Label className="text-xs text-muted-foreground">Phone</Label><Input value={val("emergency_contact_phone")} onChange={f("emergency_contact_phone")} /></div>
          <div><Label className="text-xs text-muted-foreground">Relation to Client</Label><Input value={val("emergency_contact_relation")} onChange={f("emergency_contact_relation")} /></div>
          <div><Label className="text-xs text-muted-foreground">Address</Label><Input value={val("emergency_contact_address")} onChange={f("emergency_contact_address")} /></div>
          <div><Label className="text-xs text-muted-foreground">How to Contact</Label><Input value={val("emergency_contact_method")} onChange={f("emergency_contact_method")} placeholder="e.g. Call, Text, Email" /></div>
        </div>
      </div>

      {/* Guardian */}
      <div className="col-span-2">
        <p className="text-xs font-medium text-foreground mb-2">Guardian <span className="text-muted-foreground font-normal">(if applicable)</span></p>
        <div className="grid grid-cols-2 gap-3">
          <div><Label className="text-xs text-muted-foreground">Name</Label><Input value={val("guardian_name")} onChange={f("guardian_name")} /></div>
          <div><Label className="text-xs text-muted-foreground">Email</Label><Input value={val("guardian_email")} onChange={f("guardian_email")} /></div>
          <div><Label className="text-xs text-muted-foreground">Phone</Label><Input value={val("guardian_phone")} onChange={f("guardian_phone")} /></div>
          <div><Label className="text-xs text-muted-foreground">Relation to Client</Label><Input value={val("guardian_relation")} onChange={f("guardian_relation")} /></div>
          <div><Label className="text-xs text-muted-foreground">Address</Label><Input value={val("guardian_address")} onChange={f("guardian_address")} /></div>
          <div><Label className="text-xs text-muted-foreground">How to Contact</Label><Input value={val("guardian_contact_method")} onChange={f("guardian_contact_method")} placeholder="e.g. Call, Text, Email" /></div>
        </div>
      </div>

      {/* Primary Care Provider */}
      <div className="col-span-2">
        <p className="text-xs font-medium text-foreground mb-2">Primary Care Provider</p>
        <div className="grid grid-cols-3 gap-3">
          <div><Label className="text-xs text-muted-foreground">Name</Label><Input value={val("pcp_name")} onChange={f("pcp_name")} /></div>
          <div><Label className="text-xs text-muted-foreground">Address</Label><Input value={val("pcp_address")} onChange={f("pcp_address")} /></div>
          <div><Label className="text-xs text-muted-foreground">Phone</Label><Input value={val("pcp_phone")} onChange={f("pcp_phone")} /></div>
        </div>
      </div>

      {/* Dentist */}
      <div className="col-span-2">
        <p className="text-xs font-medium text-foreground mb-2">Dentist</p>
        <div className="grid grid-cols-3 gap-3">
          <div><Label className="text-xs text-muted-foreground">Name</Label><Input value={val("dentist_name")} onChange={f("dentist_name")} /></div>
          <div><Label className="text-xs text-muted-foreground">Address</Label><Input value={val("dentist_address")} onChange={f("dentist_address")} /></div>
          <div><Label className="text-xs text-muted-foreground">Phone</Label><Input value={val("dentist_phone")} onChange={f("dentist_phone")} /></div>
        </div>
      </div>

      {/* Healthcare Provider 1 */}
      <div className="col-span-2">
        <p className="text-xs font-medium text-foreground mb-2">Healthcare Provider 1</p>
        <div className="grid grid-cols-3 gap-3">
          <div><Label className="text-xs text-muted-foreground">Name</Label><Input value={val("healthcare_provider1_name")} onChange={f("healthcare_provider1_name")} /></div>
          <div><Label className="text-xs text-muted-foreground">Address</Label><Input value={val("healthcare_provider1_address")} onChange={f("healthcare_provider1_address")} /></div>
          <div><Label className="text-xs text-muted-foreground">Phone</Label><Input value={val("healthcare_provider1_phone")} onChange={f("healthcare_provider1_phone")} /></div>
        </div>
      </div>

      {/* Healthcare Provider 2 */}
      <div className="col-span-2">
        <p className="text-xs font-medium text-foreground mb-2">Healthcare Provider 2</p>
        <div className="grid grid-cols-3 gap-3">
          <div><Label className="text-xs text-muted-foreground">Name</Label><Input value={val("healthcare_provider2_name")} onChange={f("healthcare_provider2_name")} /></div>
          <div><Label className="text-xs text-muted-foreground">Address</Label><Input value={val("healthcare_provider2_address")} onChange={f("healthcare_provider2_address")} /></div>
          <div><Label className="text-xs text-muted-foreground">Phone</Label><Input value={val("healthcare_provider2_phone")} onChange={f("healthcare_provider2_phone")} /></div>
        </div>
      </div>

      {/* ── SERVICE ENROLLMENTS ── */}
      <div className="col-span-2 border-t pt-4 mt-2">
        <h3 className="text-sm font-semibold text-primary uppercase tracking-wide mb-3">Service Enrollments</h3>
        <ServiceEnrollments
          enrollments={form.service_enrollments || []}
          onChange={(enrollments) => setForm({ ...form, service_enrollments: enrollments })}
          serviceCodes={serviceCodes}
        />
      </div>

      {/* ── HIPAA / PHI ACCESS ── */}
      <SectionHeader title="HIPAA / PHI Access (Policy #4800)" />

      <div className="col-span-2">
        <div className="bg-blue-50 border border-blue-200 rounded-lg px-3 py-2 text-xs text-blue-800 mb-3">
          <strong>HIPAA Notice:</strong> Per Policy #4800, client PHI may only be shared with individuals listed below or as directed by the client/guardian. Do not share records through personal email, text, or unapproved channels.
        </div>
      </div>

      <div className="col-span-2 flex items-center gap-2">
        <input
          type="checkbox"
          id="guardian_phi"
          checked={!!form.guardian_is_phi_decision_maker}
          onChange={e => setForm({ ...form, guardian_is_phi_decision_maker: e.target.checked })}
          className="w-4 h-4"
        />
        <label htmlFor="guardian_phi" className="text-sm cursor-pointer font-medium">Guardian is the authorized PHI decision-maker for this client</label>
      </div>

      <div className="col-span-2">
        <p className="text-xs font-medium text-foreground mb-2">PHI-Authorized Contacts <span className="text-muted-foreground font-normal">(individuals authorized to receive PHI)</span></p>
        {(form.phi_authorized_contacts || []).map((contact, idx) => (
          <div key={idx} className="border border-border rounded-lg p-3 mb-2 grid grid-cols-2 gap-2">
            <div><Label className="text-xs text-muted-foreground">Name</Label><input className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm" value={contact.name || ""} onChange={e => { const updated = [...(form.phi_authorized_contacts || [])]; updated[idx] = { ...updated[idx], name: e.target.value }; setForm({ ...form, phi_authorized_contacts: updated }); }} /></div>
            <div><Label className="text-xs text-muted-foreground">Relationship</Label><input className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm" value={contact.relationship || ""} onChange={e => { const updated = [...(form.phi_authorized_contacts || [])]; updated[idx] = { ...updated[idx], relationship: e.target.value }; setForm({ ...form, phi_authorized_contacts: updated }); }} /></div>
            <div><Label className="text-xs text-muted-foreground">Phone</Label><input className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm" value={contact.phone || ""} onChange={e => { const updated = [...(form.phi_authorized_contacts || [])]; updated[idx] = { ...updated[idx], phone: e.target.value }; setForm({ ...form, phi_authorized_contacts: updated }); }} /></div>
            <div><Label className="text-xs text-muted-foreground">Email</Label><input className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm" value={contact.email || ""} onChange={e => { const updated = [...(form.phi_authorized_contacts || [])]; updated[idx] = { ...updated[idx], email: e.target.value }; setForm({ ...form, phi_authorized_contacts: updated }); }} /></div>
            <div className="col-span-2 flex items-end justify-between gap-2">
              <div className="flex-1"><Label className="text-xs text-muted-foreground">Authorized PHI Categories</Label><input className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm" placeholder="e.g. Medical info, Progress notes, All PHI" value={contact.authorized_categories || ""} onChange={e => { const updated = [...(form.phi_authorized_contacts || [])]; updated[idx] = { ...updated[idx], authorized_categories: e.target.value }; setForm({ ...form, phi_authorized_contacts: updated }); }} /></div>
              <button type="button" onClick={() => { const updated = (form.phi_authorized_contacts || []).filter((_, i) => i !== idx); setForm({ ...form, phi_authorized_contacts: updated }); }} className="text-xs text-destructive hover:underline mb-1">Remove</button>
            </div>
          </div>
        ))}
        <button
          type="button"
          onClick={() => setForm({ ...form, phi_authorized_contacts: [...(form.phi_authorized_contacts || []), { name: "", relationship: "", phone: "", email: "", authorized_categories: "" }] })}
          className="text-xs text-primary hover:underline"
        >
          + Add Authorized Contact
        </button>
      </div>

      {/* ── OTHER ── */}
      <SectionHeader title="Other" />

      <Field label="Other Applicable Information" colSpan={2}>
        <Textarea value={val("other_information")} onChange={f("other_information")} rows={3} placeholder="Any other relevant information..." />
      </Field>
      <Field label="Internal Notes" colSpan={2}>
        <Textarea value={val("notes")} onChange={f("notes")} rows={2} />
      </Field>

      {/* ── ASSIGNED STAFF ── */}
      {editing && (
        <div className="col-span-2 border-t pt-4">
          <AssignedStaffSection clientId={editing.id} isAdmin={isAdmin} />
        </div>
      )}
    </div>
  );
}