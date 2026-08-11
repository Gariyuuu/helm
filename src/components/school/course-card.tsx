import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AssignmentRow } from "@/components/school/assignment-row";
import { AssignmentQuickAdd } from "@/components/school/assignment-quick-add";
import type { assignments, courses } from "@/lib/db/schema";

function gradeClass(grade: number | null) {
  if (grade == null) return "bg-muted text-foreground";
  if (grade >= 90) return "bg-health-healthy text-white border-0";
  if (grade >= 80) return "bg-priority-low text-white border-0";
  if (grade >= 70) return "bg-priority-medium text-black border-0";
  return "bg-priority-critical text-white border-0";
}

export function CourseCard({
  course,
  assignments: courseAssignments,
  computedGrade,
}: {
  course: typeof courses.$inferSelect;
  assignments: (typeof assignments.$inferSelect)[];
  computedGrade: number | null;
}) {
  const grade = computedGrade ?? course.currentGrade;

  return (
    <Card className="p-4">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="font-medium">
            {course.name} {course.code && <span className="text-muted-foreground">· {course.code}</span>}
          </p>
          <p className="text-xs text-muted-foreground">
            {[course.professor, course.units ? `${course.units} units` : null].filter(Boolean).join(" · ") || "—"}
          </p>
        </div>
        <Badge className={gradeClass(grade)}>{grade != null ? `${grade}%` : "No grade yet"}</Badge>
      </div>

      {courseAssignments.length > 0 && (
        <div className="mt-3 divide-y border-t pt-1.5">
          {courseAssignments.map((a) => (
            <AssignmentRow key={a.id} assignment={a} />
          ))}
        </div>
      )}
      <AssignmentQuickAdd courseId={course.id} />
    </Card>
  );
}
