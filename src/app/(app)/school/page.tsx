import { requireUser } from "@/lib/auth/current-user";
import { getSchoolDataForUser } from "@/lib/queries/school";
import { SemesterFormDialog } from "@/components/school/semester-form-dialog";
import { CourseFormDialog } from "@/components/school/course-form-dialog";
import { CourseCard } from "@/components/school/course-card";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

export default async function SchoolPage() {
  const user = await requireUser();
  const { semesters, courses } = await getSchoolDataForUser(user.id);
  const activeSemester = semesters.find((s) => s.isActive) ?? null;
  const activeCourses = courses.filter((c) => c.course.semesterId === (activeSemester?.id ?? null));

  return (
    <div className="mx-auto max-w-3xl space-y-4 p-4 md:p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold tracking-tight">School</h1>
          <div className="mt-1 flex items-center gap-2 text-sm text-muted-foreground">
            {activeSemester ? (
              <Badge variant="outline">{activeSemester.name}</Badge>
            ) : (
              <span>No active semester</span>
            )}
          </div>
        </div>
        <div className="flex gap-1.5">
          <SemesterFormDialog
            trigger={
              <Button size="sm" variant="outline" className="gap-1.5">
                <Plus className="size-4" /> Semester
              </Button>
            }
          />
          <CourseFormDialog
            semesterId={activeSemester?.id ?? null}
            trigger={
              <Button size="sm" className="gap-1.5" disabled={!activeSemester}>
                <Plus className="size-4" /> Course
              </Button>
            }
          />
        </div>
      </div>

      {!activeSemester ? (
        <Card className="border-dashed p-10 text-center text-sm text-muted-foreground">
          Start a semester to add courses and assignments.
        </Card>
      ) : activeCourses.length === 0 ? (
        <Card className="border-dashed p-10 text-center text-sm text-muted-foreground">
          No courses yet in {activeSemester.name}.
        </Card>
      ) : (
        <div className="flex flex-col gap-3">
          {activeCourses.map(({ course, assignments, computedGrade }) => (
            <CourseCard key={course.id} course={course} assignments={assignments} computedGrade={computedGrade} />
          ))}
        </div>
      )}
    </div>
  );
}
