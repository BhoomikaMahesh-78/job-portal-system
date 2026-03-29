import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Briefcase, FileText, Clock } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { Navigate, Link } from "react-router-dom";

const statusColors: Record<string, string> = {
  pending: "bg-warning/10 text-warning border-warning/30",
  reviewed: "bg-accent/10 text-accent border-accent/30",
  accepted: "bg-success/10 text-success border-success/30",
  rejected: "bg-destructive/10 text-destructive border-destructive/30",
};

const DashboardPage = () => {
  const { user, loading } = useAuth();

  const { data: applications, isLoading } = useQuery({
    queryKey: ["my-applications", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("applications")
        .select("*, jobs(*)")
        .eq("user_id", user!.id)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  if (loading) return null;
  if (!user) return <Navigate to="/login" />;

  return (
    <div className="container py-8 animate-fade-in">
      <h1 className="font-display text-3xl font-bold">Dashboard</h1>
      <p className="mt-1 text-muted-foreground">Track your job applications</p>

      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        <Card className="glass-card">
          <CardContent className="flex items-center gap-3 pt-6">
            <div className="rounded-lg bg-accent/10 p-2"><FileText className="h-5 w-5 text-accent" /></div>
            <div>
              <p className="text-2xl font-bold">{applications?.length ?? 0}</p>
              <p className="text-sm text-muted-foreground">Total Applications</p>
            </div>
          </CardContent>
        </Card>
        <Card className="glass-card">
          <CardContent className="flex items-center gap-3 pt-6">
            <div className="rounded-lg bg-success/10 p-2"><Briefcase className="h-5 w-5 text-success" /></div>
            <div>
              <p className="text-2xl font-bold">{applications?.filter((a) => a.status === "accepted").length ?? 0}</p>
              <p className="text-sm text-muted-foreground">Accepted</p>
            </div>
          </CardContent>
        </Card>
        <Card className="glass-card">
          <CardContent className="flex items-center gap-3 pt-6">
            <div className="rounded-lg bg-warning/10 p-2"><Clock className="h-5 w-5 text-warning" /></div>
            <div>
              <p className="text-2xl font-bold">{applications?.filter((a) => a.status === "pending").length ?? 0}</p>
              <p className="text-sm text-muted-foreground">Pending</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <h2 className="mt-8 font-display text-xl font-semibold">Your Applications</h2>
      {isLoading ? (
        <p className="mt-4 text-muted-foreground">Loading...</p>
      ) : applications?.length === 0 ? (
        <div className="mt-4 rounded-lg border border-dashed p-8 text-center">
          <p className="text-muted-foreground">You haven't applied to any jobs yet.</p>
          <Link to="/jobs" className="mt-2 inline-block text-accent hover:underline">Browse Jobs →</Link>
        </div>
      ) : (
        <div className="mt-4 space-y-3">
          {applications?.map((app) => (
            <Card key={app.id} className="glass-card">
              <CardContent className="flex items-center justify-between py-4">
                <div>
                  <Link to={`/jobs/${app.job_id}`} className="font-display font-semibold hover:text-accent">
                    {(app.jobs as any)?.title ?? "Unknown Job"}
                  </Link>
                  <p className="text-sm text-muted-foreground">{(app.jobs as any)?.company} • Applied {formatDistanceToNow(new Date(app.created_at), { addSuffix: true })}</p>
                </div>
                <Badge className={statusColors[app.status] ?? ""}>{app.status}</Badge>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default DashboardPage;
