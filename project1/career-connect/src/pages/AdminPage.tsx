import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Navigate } from "react-router-dom";
import { Plus, Trash2, Users } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

const AdminPage = () => {
  const { user, isAdmin, loading } = useAuth();
  const queryClient = useQueryClient();
  const [title, setTitle] = useState("");
  const [company, setCompany] = useState("");
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState("Remote");
  const [jobType, setJobType] = useState("Full-time");
  const [salaryRange, setSalaryRange] = useState("");
  const [skillsInput, setSkillsInput] = useState("");

  const { data: jobs, isLoading } = useQuery({
    queryKey: ["admin-jobs"],
    queryFn: async () => {
      const { data, error } = await supabase.from("jobs").select("*").order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: isAdmin,
  });

  const { data: applications } = useQuery({
    queryKey: ["admin-applications"],
    queryFn: async () => {
      const { data, error } = await supabase.from("applications").select("*, jobs(*), profiles:user_id(name, email)");
      if (error) throw error;
      return data;
    },
    enabled: isAdmin,
  });

  const createMutation = useMutation({
    mutationFn: async () => {
      if (!title.trim() || !company.trim()) throw new Error("Title and company are required");
      const { error } = await supabase.from("jobs").insert({
        title: title.trim(),
        company: company.trim(),
        description: description.trim(),
        location: location.trim(),
        job_type: jobType,
        salary_range: salaryRange.trim(),
        skills_required: skillsInput.split(",").map((s) => s.trim()).filter(Boolean),
        created_by: user!.id,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Job posted!");
      queryClient.invalidateQueries({ queryKey: ["admin-jobs"] });
      setTitle(""); setCompany(""); setDescription(""); setSalaryRange(""); setSkillsInput("");
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const deleteMutation = useMutation({
    mutationFn: async (jobId: string) => {
      const { error } = await supabase.from("jobs").delete().eq("id", jobId);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Job deleted");
      queryClient.invalidateQueries({ queryKey: ["admin-jobs"] });
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const updateStatusMutation = useMutation({
    mutationFn: async ({ appId, status }: { appId: string; status: string }) => {
      const { error } = await supabase.from("applications").update({ status }).eq("id", appId);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Status updated");
      queryClient.invalidateQueries({ queryKey: ["admin-applications"] });
    },
    onError: (err: Error) => toast.error(err.message),
  });

  if (loading) return null;
  if (!user || !isAdmin) return <Navigate to="/" />;

  return (
    <div className="container py-8 animate-fade-in">
      <h1 className="font-display text-3xl font-bold">Admin Panel</h1>
      <p className="mt-1 text-muted-foreground">Manage jobs and applications</p>

      <div className="mt-6 grid gap-8 lg:grid-cols-2">
        {/* Post Job */}
        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 font-display">
              <Plus className="h-5 w-5 text-accent" /> Post New Job
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={(e) => { e.preventDefault(); createMutation.mutate(); }} className="space-y-3">
              <div className="space-y-1"><Label>Title *</Label><Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Frontend Developer Intern" /></div>
              <div className="space-y-1"><Label>Company *</Label><Input value={company} onChange={(e) => setCompany(e.target.value)} placeholder="Acme Corp" /></div>
              <div className="space-y-1"><Label>Description</Label><Textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Job description..." rows={3} /></div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1"><Label>Location</Label><Input value={location} onChange={(e) => setLocation(e.target.value)} /></div>
                <div className="space-y-1"><Label>Type</Label>
                  <Select value={jobType} onValueChange={setJobType}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Full-time">Full-time</SelectItem>
                      <SelectItem value="Part-time">Part-time</SelectItem>
                      <SelectItem value="Internship">Internship</SelectItem>
                      <SelectItem value="Contract">Contract</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-1"><Label>Salary Range</Label><Input value={salaryRange} onChange={(e) => setSalaryRange(e.target.value)} placeholder="$50k - $80k" /></div>
              <div className="space-y-1"><Label>Skills (comma-separated)</Label><Input value={skillsInput} onChange={(e) => setSkillsInput(e.target.value)} placeholder="React, Node.js, TypeScript" /></div>
              <Button type="submit" disabled={createMutation.isPending} className="w-full bg-accent text-accent-foreground hover:bg-accent/90">
                {createMutation.isPending ? "Posting..." : "Post Job"}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Existing Jobs */}
        <div className="space-y-4">
          <h2 className="font-display text-xl font-semibold">Posted Jobs ({jobs?.length ?? 0})</h2>
          {isLoading ? <p className="text-muted-foreground">Loading...</p> : jobs?.map((job) => (
            <Card key={job.id} className="glass-card">
              <CardContent className="flex items-center justify-between py-4">
                <div>
                  <p className="font-display font-semibold">{job.title}</p>
                  <p className="text-sm text-muted-foreground">{job.company} • {formatDistanceToNow(new Date(job.created_at), { addSuffix: true })}</p>
                </div>
                <Button variant="ghost" size="icon" onClick={() => deleteMutation.mutate(job.id)} className="text-destructive hover:text-destructive">
                  <Trash2 className="h-4 w-4" />
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Applications */}
      <div className="mt-8">
        <h2 className="font-display text-xl font-semibold flex items-center gap-2">
          <Users className="h-5 w-5 text-accent" /> Applications ({applications?.length ?? 0})
        </h2>
        <div className="mt-4 space-y-3">
          {applications?.map((app) => (
            <Card key={app.id} className="glass-card">
              <CardContent className="flex items-center justify-between py-4">
                <div>
                  <p className="font-semibold">{(app.profiles as any)?.name || "Unknown"} — {(app.profiles as any)?.email}</p>
                  <p className="text-sm text-muted-foreground">Applied for: {(app.jobs as any)?.title} at {(app.jobs as any)?.company}</p>
                  {app.cover_letter && <p className="mt-1 text-sm text-muted-foreground line-clamp-1">"{app.cover_letter}"</p>}
                </div>
                <Select value={app.status} onValueChange={(status) => updateStatusMutation.mutate({ appId: app.id, status })}>
                  <SelectTrigger className="w-32"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="reviewed">Reviewed</SelectItem>
                    <SelectItem value="accepted">Accepted</SelectItem>
                    <SelectItem value="rejected">Rejected</SelectItem>
                  </SelectContent>
                </Select>
              </CardContent>
            </Card>
          ))}
          {applications?.length === 0 && <p className="text-muted-foreground">No applications yet.</p>}
        </div>
      </div>
    </div>
  );
};

export default AdminPage;
