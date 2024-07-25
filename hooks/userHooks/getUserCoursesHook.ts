import { useState, useEffect, useCallback } from "react";
import { CourseProps } from "@/types/CourseTypes";
import { UserProps } from "@/types/UserTypes";
import { useCourseContext } from "@/context/CourseContext";
import { useAlertContext } from "@/context/AlertContext";

const useGetUserCoursesHook = (user: UserProps | null) => {
  const { showAlert } = useAlertContext();
  const { getCourse } = useCourseContext();
  const [courses, setCourses] = useState<CourseProps[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  const fetchUserCourses = useCallback(async () => {
    try {
      if (user) {
        setLoading(true);
        const fetchedUserCourses = await Promise.all(
          user.courses.map(async (courseID) => {
            const response = await getCourse(courseID);
            return "data" in response ? response.data : null;
          })
        );

        const validCourses = fetchedUserCourses.filter(
          (course) => course !== null
        );
        setCourses(validCourses);
      }
    } catch (error) {
      showAlert(
        "Error",
        error instanceof Error ? error.message : String(error)
      );
    } finally {
      setLoading(false);
    }
  }, [getCourse, showAlert]);

  useEffect(() => {
    fetchUserCourses();
  }, [user, fetchUserCourses]);

  return { courses, setCourses, loading };
};

export default useGetUserCoursesHook;
