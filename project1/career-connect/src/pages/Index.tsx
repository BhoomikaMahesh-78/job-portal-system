import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { Briefcase, Search, Shield, Sparkles, ArrowRight } from "lucide-react";

const Index = () => {
  const { user } = useAuth();

  return (
    <div className="flex flex-col">
      {/* Hero */}
      <section className="relative overflow-hidden py-24 md:py-32">
        <div className="absolute inset-0 bg-gradient-to-br from-accent/5 via-transparent to-accent/10" />
        <div className="container relative text-center">
          <div className="mx-auto max-w-3xl animate-fade-in">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-accent/20 bg-accent/5 px-4 py-1.5 text-sm font-medium text-accent">
              <Sparkles className="h-4 w-4" /> Your career starts here
            </div>
            <h1 className="font-display text-4xl font-bold leading-tight md:text-6xl">
              Find Your Dream{" "}
              <span className="text-gradient">Internship & Job</span>
            </h1>
            <p className="mx-auto mt-6 max-w-xl text-lg text-muted-foreground">
              Connect with top companies, discover opportunities that match your skills, and launch your career with JobFlow.
            </p>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
              <Link to={user ? "/jobs" : "/signup"}>
                <Button size="lg" className="bg-accent text-accent-foreground hover:bg-accent/90 gap-2">
                  {user ? "Browse Jobs" : "Get Started"} <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <Link to="/jobs">
                <Button size="lg" variant="outline" className="gap-2">
                  <Search className="h-4 w-4" /> Explore Listings
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="border-t py-20">
        <div className="container">
          <h2 className="text-center font-display text-3xl font-bold">How It Works</h2>
          <p className="mx-auto mt-3 max-w-md text-center text-muted-foreground">
            From discovery to application — a seamless experience
          </p>
          <div className="mt-12 grid gap-8 md:grid-cols-3">
            {[
              { icon: Search, title: "Discover Jobs", desc: "Browse and search through curated internships and job opportunities from leading companies." },
              { icon: Briefcase, title: "Apply Instantly", desc: "Submit your application with a single click. Add a cover letter and track your progress." },
              { icon: Shield, title: "Track Progress", desc: "Monitor all your applications from your personal dashboard. Stay updated on every status change." },
            ].map(({ icon: Icon, title, desc }, i) => (
              <div key={title} className="group rounded-2xl border bg-card p-6 hover-lift animate-fade-in" style={{ animationDelay: `${i * 150}ms` }}>
                <div className="mb-4 inline-flex rounded-xl bg-accent/10 p-3">
                  <Icon className="h-6 w-6 text-accent" />
                </div>
                <h3 className="font-display text-lg font-semibold">{title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="border-t bg-muted/50 py-16">
        <div className="container text-center">
          <h2 className="font-display text-2xl font-bold">Ready to Start Your Journey?</h2>
          <p className="mt-2 text-muted-foreground">Join thousands of students finding their next opportunity.</p>
          <Link to={user ? "/jobs" : "/signup"}>
            <Button size="lg" className="mt-6 bg-accent text-accent-foreground hover:bg-accent/90">
              {user ? "Browse Jobs" : "Create Free Account"}
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-8 text-center text-sm text-muted-foreground">
        <p>© {new Date().getFullYear()} JobFlow. Built for students, by students.</p>
      </footer>
    </div>
  );
};

export default Index;
