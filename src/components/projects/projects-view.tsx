import { projects } from "@/lib/curriculum";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export function ProjectsView() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-3xl font-semibold tracking-tight">Projects</h1>
        <p className="mt-2 max-w-3xl text-sm leading-7 text-muted-foreground">
          Projects are seeded with business problems, milestones, and acceptance criteria so later phases can attach starter code, test harnesses, and submissions without changing the model.
        </p>
      </div>
      <div className="grid gap-4 xl:grid-cols-2">
        {projects.map((project) => (
          <Card key={project.id}>
            <CardHeader>
              <div className="flex flex-wrap gap-2">
                <Badge variant="outline">{project.courseSlug.toUpperCase()}</Badge>
              </div>
              <CardTitle className="font-heading text-xl">{project.title}</CardTitle>
              <CardDescription>{project.businessProblem}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 text-sm leading-6">
              <div>
                <p className="font-medium">Milestones</p>
                <ul className="mt-2 space-y-2 text-muted-foreground">
                  {project.milestones.map((milestone) => (
                    <li key={milestone}>• {milestone}</li>
                  ))}
                </ul>
              </div>
              <div>
                <p className="font-medium">Acceptance criteria</p>
                <ul className="mt-2 space-y-2 text-muted-foreground">
                  {project.acceptanceCriteria.map((criterion) => (
                    <li key={criterion}>• {criterion}</li>
                  ))}
                </ul>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
