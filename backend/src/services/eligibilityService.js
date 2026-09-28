// ============================================================
// eligibilityService.js — APP-02
// Checks whether a student meets a program's eligibility criteria.
// Called before creating an application.
// ============================================================

/**
 * Check if a student is eligible for a program.
 *
 * @param {Object} student  - Record from prisma.students (with new academic fields)
 * @param {Object} program  - Record from prisma.programs
 * @returns {{ eligible: boolean, reasons: string[] }}
 */
export function checkEligibility(student, program) {
  const reasons = []

  // ── School check ──────────────────────────────────────────
  if (
    program.schools_eligible?.length > 0 &&
    student.school &&
    !program.schools_eligible.includes(student.school)
  ) {
    reasons.push(
      `Your school '${student.school}' is not eligible for this program. ` +
      `Eligible schools: ${program.schools_eligible.join(', ')}`
    )
  }

  // ── Semester check ────────────────────────────────────────
  if (
    program.semesters_eligible?.length > 0 &&
    student.semester &&
    !program.semesters_eligible.includes(student.semester)
  ) {
    reasons.push(
      `Your semester '${student.semester}' is not eligible for this program. ` +
      `Eligible semesters: ${program.semesters_eligible.join(', ')}`
    )
  }

  // ── Course check ──────────────────────────────────────────
  if (
    program.courses_eligible?.length > 0 &&
    student.course &&
    !program.courses_eligible.includes(student.course)
  ) {
    reasons.push(
      `Your course '${student.course}' is not eligible for this program. ` +
      `Eligible courses: ${program.courses_eligible.join(', ')}`
    )
  }

  // ── Application deadline check ────────────────────────────
  if (program.last_date_to_apply && new Date() > new Date(program.last_date_to_apply)) {
    reasons.push('The application deadline for this program has passed')
  }

  // ── Program status check ──────────────────────────────────
  if (program.status !== 'published') {
    reasons.push('This program is not currently open for applications')
  }

  // TODO: confirm with product team — add CGPA minimum threshold to programs model
  //   Example when field exists:
  //   if (program.min_cgpa && student.cgpa && parseFloat(student.cgpa) < program.min_cgpa) {
  //     reasons.push(`Minimum CGPA required is ${program.min_cgpa}. Your CGPA: ${student.cgpa}`)
  //   }

  // TODO: confirm with product team — add backlog limit once ERP integration provides data
  //   Example when field exists:
  //   if (student.active_backlogs > 0) {
  //     reasons.push('Students with active backlogs are not eligible to apply')
  //   }

  return {
    eligible: reasons.length === 0,
    reasons
  }
}
