import { requireUser } from "@/lib/auth/current-user";
import { getSchoolDataForUser } from "@/lib/queries/school";
import { SemesterFormDialog } from "@/components/school/semester-form-dialog";
import { CourseFormDialog } from "@/components/school/course-form-dialog";
import { CourseCard } from "@/components/school/course-card";
import { PageHeader } from "@/components/layout/page-header";
import { EmptyState } from "@/components/layout/empty-state";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { GraduationCap, Plus } from "lucide-react";

export default async function SchoolPage() {
  const user = await requireUser();
  const { semesters, courses } = await getSchoolDataForUser(user.id);
  const activeSemester = semesters.find((s) => s.isActive) ?? null;
  const activeCourses = courses.filter((c) => c.course.semesterId === (activeSemester?.id ?? null));

  return (
    <div className="mx-auto max-w-3xl space-y-4 p-4 md:p-6">
      <PageHeader
        icon={GraduationCap}
        title="School"
        domainSlug="academics"
        description={activeSemester ? undefined : "No active semester"}
        action={
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
        }
      />
      {activeSemester && (
        <Badge variant="outline" className="-mt-2">
          {activeSemester.name}
        </Badge>
      )}

      {!activeSemester ? (
        <EmptyState icon={GraduationCap}>Start a semester to add courses and assignments.</EmptyState>
      ) : activeCourses.length === 0 ? (
        <EmptyState icon={GraduationCap}>No courses yet in {activeSemester.name}.</EmptyState>
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
