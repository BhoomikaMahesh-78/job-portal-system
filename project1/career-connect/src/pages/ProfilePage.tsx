import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Navigate } from "react-router-dom";
import { User, X } from "lucide-react";

const ProfilePage = () => {
  const { user, loading } = useAuth();
  const queryClient = useQueryClient();
  const [skillInput, setSkillInput] = useState("");

  const { data: profile, isLoading } = useQuery({
    queryKey: ["profile", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase.from("profiles").select("*").eq("user_id", user!.id).single();
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  const [name, setName] = useState("");
  const [initialized, setInitialized] = useState(false);
  if (profile && !initialized) {
    setName(profile.name);
    setInitialized(true);
  }

  const updateMutation = useMutation({
    mutationFn: async (updates: { name?: string; skills?: string[] }) => {
      const { error } = await supabase.from("profiles").update(updates).eq("user_id", user!.id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Profile updated!");
      queryClient.invalidateQueries({ queryKey: ["profile"] });
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const addSkill = () => {
    const skill = skillInput.trim();
    if (!skill || !profile) return;
    if (profile.skills?.includes(skill)) { toast.error("Skill already added"); return; }
    updateMutation.mutate({ skills: [...(profile.skills ?? []), skill] });
    setSkillInput("");
  };

  const removeSkill = (skill: string) => {
    if (!profile) return;
    updateMutation.mutate({ skills: (profile.skills ?? []).filter((s) => s !== skill) });
  };

  if (loading) return null;
  if (!user) return <Navigate to="/login" />;

  return (
    <div className="container max-w-2xl py-8 animate-fade-in">
      <h1 className="font-display text-3xl font-bold">Profile</h1>
      <p className="mt-1 text-muted-foreground">Manage your personal information</p>

      {isLoading ? (
        <p className="mt-8 text-muted-foreground">Loading...</p>
      ) : profile ? (
        <div className="mt-6 space-y-6">
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 font-display">
                <User className="h-5 w-5 text-accent" /> Personal Info
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Full Name</Label>
                <div className="flex gap-2">
                  <Input value={name} onChange={(e) => setName(e.target.value)} />
                  <Button onClick={() => updateMutation.mutate({ name: name.trim() })} disabled={updateMutation.isPending} className="bg-accent text-accent-foreground hover:bg-accent/90">
                    Save
                  </Button>
                </div>
              </div>
              <div className="space-y-2">
                <Label>Email</Label>
                <Input value={profile.email} disabled />
              </div>
            </CardContent>
          </Card>

          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="font-display">Skills</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <Input placeholder="Add a skill (e.g. React, Python)" value={skillInput} onChange={(e) => setSkillInput(e.target.value)} onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addSkill())} />
                <Button onClick={addSkill} className="bg-accent text-accent-foreground hover:bg-accent/90">Add</Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {profile.skills?.map((skill) => (
                  <Badge key={skill} variant="secondary" className="flex items-center gap-1">
                    {skill}
                    <button onClick={() => removeSkill(skill)}><X className="h-3 w-3" /></button>
                  </Badge>
                ))}
                {(!profile.skills || profile.skills.length === 0) && (
                  <p className="text-sm text-muted-foreground">No skills added yet.</p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      ) : null}
    </div>
  );
};

export default ProfilePage;
