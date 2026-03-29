import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { ArrowLeft, MapPin, Clock, Building2, CheckCircle } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

const JobDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [coverLetter, setCoverLetter] = useState("");
  const [showApplyForm, setShowApplyForm] = useState(false);

  const { data: job, isLoading } = useQuery({
    queryKey: ["job", id],
    queryFn: async () => {
      const { data, error } = await supabase.from("jobs").select("*").eq("id", id!).single();
      if (error) throw error;
      return data;
    },
    enabled: !!id,
  });

  const { data: existingApp } = useQuery({
    queryKey: ["application", id, user?.id],
    queryFn: async () => {
      const { data } = await supabase
        .from("applications")
        .select("*")
        .eq("job_id", id!)
        .eq("user_id", user!.id)
        .maybeSingle();
      return data;
    },
    enabled: !!id && !!user,
  });

  const applyMutation = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from("applications").insert({
        user_id: user!.id,
        job_id: id!,
        cover_letter: coverLetter.trim() || null,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Application submitted!");
      queryClient.invalidateQueries({ queryKey: ["application", id] });
      setShowApplyForm(false);
    },
    onError: (err: Error) => toast.error(err.message),
  });

  if (isLoading) return <div className="container py-16 text-center text-muted-foreground">Loading...</div>;
  if (!job) return <div className="container py-16 text-center text-muted-foreground">Job not found.</div>;

  return (
    <div className="container max-w-3xl py-8 animate-fade-in">
      <Button variant="ghost" size="sm" onClick={() => navigate(-1)} className="mb-4">
        <ArrowLeft className="mr-1 h-4 w-4" /> Back
      </Button>

      <Card className="glass-card">
        <CardHeader>
          <div className="flex items-start justify-between">
            <div>
              <CardTitle className="font-display text-2xl">{job.title}</CardTitle>
              <div className="mt-2 flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                <span className="flex items-center gap-1"><Building2 className="h-4 w-4" />{job.company}</span>
                <span className="flex items-center gap-1"><MapPin className="h-4 w-4" />{job.location}</span>
                <span className="flex items-center gap-1"><Clock className="h-4 w-4" />{formatDistanceToNow(new Date(job.created_at), { addSuffix: true })}</span>
              </div>
            </div>
            <Badge variant="secondary">{job.job_type}</Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {job.salary_range && (
            <div>
              <h3 className="font-display text-sm font-semibold text-muted-foreground">Salary</h3>
              <p className="mt-1">{job.salary_range}</p>
            </div>
          )}

          <div>
            <h3 className="font-display text-sm font-semibold text-muted-foreground">Description</h3>
            <p className="mt-1 whitespace-pre-wrap">{job.description}</p>
          </div>

          {job.skills_required && job.skills_required.length > 0 && (
            <div>
              <h3 className="font-display text-sm font-semibold text-muted-foreground">Skills Required</h3>
              <div className="mt-2 flex flex-wrap gap-2">
                {job.skills_required.map((skill) => (
                  <Badge key={skill} variant="outline">{skill}</Badge>
                ))}
              </div>
            </div>
          )}

          {existingApp ? (
            <div className="flex items-center gap-2 rounded-lg border border-success/30 bg-success/10 p-4 text-success">
              <CheckCircle className="h-5 w-5" />
              <span className="font-medium">You've already applied — Status: {existingApp.status}</span>
            </div>
          ) : user ? (
            showApplyForm ? (
              <div className="space-y-3 rounded-lg border p-4">
                <h3 className="font-display font-semibold">Apply for this position</h3>
                <Textarea
                  placeholder="Write a cover letter (optional)..."
                  value={coverLetter}
                  onChange={(e) => setCoverLetter(e.target.value)}
                  rows={4}
                />
                <div className="flex gap-2">
                  <Button onClick={() => applyMutation.mutate()} disabled={applyMutation.isPending} className="bg-accent text-accent-foreground hover:bg-accent/90">
                    {applyMutation.isPending ? "Submitting..." : "Submit Application"}
                  </Button>
                  <Button variant="outline" onClick={() => setShowApplyForm(false)}>Cancel</Button>
                </div>
              </div>
            ) : (
              <Button onClick={() => setShowApplyForm(true)} className="w-full bg-accent text-accent-foreground hover:bg-accent/90" size="lg">
                Apply Now
              </Button>
            )
          ) : (
            <Button onClick={() => navigate("/login")} className="w-full bg-accent text-accent-foreground hover:bg-accent/90" size="lg">
              Sign In to Apply
            </Button>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default JobDetailPage;
