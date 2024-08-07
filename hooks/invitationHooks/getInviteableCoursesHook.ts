"use client";
import { useState, useEffect, useCallback } from "react";
import { UserProps } from "@/types/UserTypes";
import { CourseProps } from "@/types/CourseTypes";
import { useCourseContext } from "@/context/CourseContext";
import { useAlertContext } from "@/context/AlertContext";
import { useUserContext } from "@/context/UserContext";

const useGetInviteableCoursesHook = (user: UserProps) => {
  const { showAlert, showErrorAlert } = useAlertContext();
  const { getCourse } = useCourseContext();
  const { state } = useUserContext();
  const [inviteableCourses, setInviteableCourses] = useState<CourseProps[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  const fetchInvitableCourses = useCallback(async () => {
    try {
      if (state.user) {
        setLoading(true);
        const fetchedCourses = await Promise.all(
          state.user.courses.map(async (courseID) => {
            const response = await getCourse(courseID);
            return typeof response !== "string" ? response.data : null;
          })
        );

        setInviteableCourses(
          fetchedCourses.filter((course): course is CourseProps => {
            if (!course) return false;

            const isCapacityAvailable =
              course.capacity > course.enrolledStudents.length;
            const isUserNotEnrolled = !user.courses.includes(course.id);
            const isUserNotApplied = !user.appliedCourses.includes(course.id);
            const isUserNotInvited = !user.invitations.some(
              (invitation) => invitation.courseID === course.id
            );

            return (
              isCapacityAvailable &&
              isUserNotEnrolled &&
              isUserNotApplied &&
              isUserNotInvited
            );
          })
        );
      }
    } catch (error) {
      showErrorAlert("transactionError");
    } finally {
      setLoading(false);
    }
  }, [getCourse, showAlert, showErrorAlert]);

  useEffect(() => {
    fetchInvitableCourses();
  }, [state.user, fetchInvitableCourses]);

  return { inviteableCourses, setInviteableCourses, loading };
};

export default useGetInviteableCoursesHook;
