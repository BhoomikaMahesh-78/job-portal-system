import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Search, MapPin, Clock, Building2 } from "lucide-react";
import { Link } from "react-router-dom";
import { formatDistanceToNow } from "date-fns";

const JobsPage = () => {
  const [search, setSearch] = useState("");

  const { data: jobs, isLoading } = useQuery({
    queryKey: ["jobs"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("jobs")
        .select("*")
        .eq("is_active", true)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const filtered = jobs?.filter((job) => {
    const q = search.toLowerCase();
    return (
      job.title.toLowerCase().includes(q) ||
      job.company.toLowerCase().includes(q) ||
      job.skills_required?.some((s) => s.toLowerCase().includes(q))
    );
  });

  return (
    <div className="container py-8">
      <div className="mb-8">
        <h1 className="font-display text-3xl font-bold">Find Your Next Opportunity</h1>
        <p className="mt-2 text-muted-foreground">Browse internships and jobs from top companies</p>
      </div>

      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search by title, company, or skill..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-10"
        />
      </div>

      {isLoading ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader><div className="h-6 w-3/4 rounded bg-muted" /><div className="mt-2 h-4 w-1/2 rounded bg-muted" /></CardHeader>
              <CardContent><div className="h-4 w-full rounded bg-muted" /></CardContent>
            </Card>
          ))}
        </div>
      ) : filtered?.length === 0 ? (
        <div className="py-16 text-center">
          <p className="text-lg text-muted-foreground">No jobs found matching your search.</p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filtered?.map((job, i) => (
            <Card key={job.id} className="hover-lift glass-card" style={{ animationDelay: `${i * 80}ms` }}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="font-display text-lg">{job.title}</CardTitle>
                    <div className="mt-1 flex items-center gap-1 text-sm text-muted-foreground">
                      <Building2 className="h-3.5 w-3.5" />
                      {job.company}
                    </div>
                  </div>
                  <Badge variant="secondary" className="text-xs">{job.job_type}</Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="line-clamp-2 text-sm text-muted-foreground">{job.description}</p>
                <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1"><MapPin className="h-3 w-3" />{job.location}</span>
                  {job.salary_range && <span>• {job.salary_range}</span>}
                  <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{formatDistanceToNow(new Date(job.created_at), { addSuffix: true })}</span>
                </div>
                {job.skills_required && job.skills_required.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {job.skills_required.slice(0, 4).map((skill) => (
                      <Badge key={skill} variant="outline" className="text-xs">{skill}</Badge>
                    ))}
                    {job.skills_required.length > 4 && (
                      <Badge variant="outline" className="text-xs">+{job.skills_required.length - 4}</Badge>
                    )}
                  </div>
                )}
                <Link to={`/jobs/${job.id}`}>
                  <Button size="sm" className="mt-2 w-full bg-accent text-accent-foreground hover:bg-accent/90">
                    View Details
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default JobsPage;
