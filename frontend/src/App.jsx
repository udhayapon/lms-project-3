import {
  BrowserRouter,
  Routes,
  Route,
  Navigate
} from "react-router-dom";

// ===== PUBLIC =====
import Login from "./pages/Login";

import Profile from "./pages/Profile";
import Notifications from "./pages/Notifications";

// ===== COMMON FEATURES =====
import Courses from "./features/courses/Courses";
import CourseDetails from "./features/courses/CourseDetails";
import Years from "./features/years/Years";
import Subjects from "./features/subjects/Subjects";
import TeachingAssignments from "./features/teaching/TeachingAssignments";
import AttendanceTeacher from "./features/attendance/AttendanceTeacher";
import AttendanceStudent from "./features/attendance/AttendanceStudent";

// ===== ADMIN =====
import Dashboard from "./pages/Admin/Dashboard";

import Students from "./pages/Admin/Students";
import Teachers from "./pages/Admin/Teachers";
import AdminUsers from "./pages/Admin/AdminUsers";

import Enrollments from "./pages/Admin/Enrollments";
import Departments from "./pages/Admin/Departments";
import AdminFees from "./features/fees/AdminFees";

// ===== TEACHER =====
import TeacherHome from "./pages/Teacher/TeacherHome";
import SubjectDetails from "./pages/Teacher/SubjectDetails";
import AssignmentTeacher from "./features/assignments/AssignmentTeacher";       // ADD THIS
import TeacherSubjects from "./features/subjects/Subjects";               // ADD THIS
import TeacherStudents from "./pages/Admin/Students"; 
import TeacherChat from "./pages/Teacher/TeacherChat";

// ===== ASSIGNMENTS =====
import AssignmentSubmissions from "./features/assignments/AssignmentSubmissions";

// ===== STUDENT =====
import StudentHome from "./pages/Student/StudentHome";
import StudentCourses from "./pages/Student/StudentCourses";
import StudentSubjectDetails from "./pages/Student/StudentSubjectDetails";
import StudentGrades from "./pages/Student/StudentGrades";

// ===== PARENTS =====
import ParentDashboard from "./features/parent/ParentDashboard";
import ParentGrades from "./features/parent/ParentGrades";
import ParentAttendance from "./features/parent/ParentAttendance";
import ParentAssignments from "./features/parent/ParentAssignments";
import ParentFees from "./features/parent/ParentFees";
import Parents from "./pages/Admin/Parents";
import ParentMessages from "./features/Parent/ParentMessages";
import ParentChat from "./features/parent/ParentChat";


// ================= USER HELPER =================
const getUser = () => {

  try {

    return JSON.parse(
      localStorage.getItem("user")
    );

  } catch {

    return null;
  }
};


// ================= PROTECTED ROUTE =================
function ProtectedRoute({
  children,
  role,
  adminOnly = false
}) {

  const user = getUser();

  if (!user)
    return (
      <Navigate
        to="/"
        replace
      />
    );

  if (
    adminOnly &&
    user.role?.toLowerCase() !==
      "admin"
  ) {

    return (
      <Navigate
        to="/"
        replace
      />
    );
  }

  if (
    role &&
    user.role?.toLowerCase() !==
      role.toLowerCase()
  ) {

    return (
      <Navigate
        to="/"
        replace
      />
    );
  }

  return children;
}


// ================= ROLE REDIRECT =================
function RoleRedirect() {

  const user = getUser();

  if (!user)
    return (
      <Navigate
        to="/"
        replace
      />
    );

  const role =
    user.role?.toLowerCase();

  if (role === "admin")
    return (
      <Navigate
        to="/dashboard"
        replace
      />
    );

  if (role === "teacher")
    return (
      <Navigate
        to="/teacher"
        replace
      />
    );

  if (role === "student")
    return (
      <Navigate
        to="/student"
        replace
      />
    );

  return (
    <Navigate
      to="/"
      replace
    />
  );

  if (role === "parent")
    return 
    <Navigate 
    to="/parent" 
    replace 
    />;
}


// ================= APP =================
function App() {

  return (

    <BrowserRouter>

      <Routes>

        {/* ===== PUBLIC ===== */}
        <Route
          path="/"
          element={<Login />}
        />

        {/* ===== AFTER LOGIN ===== */}
        <Route
          path="/home"
          element={<RoleRedirect />}
        />



        {/* ================= COMMON ================= */}

        <Route
          path="/courses"
          element={
            <ProtectedRoute>

              <Courses />

            </ProtectedRoute>
          }
        />

        <Route
          path="/courses/:id"
          element={
            <ProtectedRoute>

              <CourseDetails />

            </ProtectedRoute>
          }
        />

        {/* ================= ADMIN ================= */}

        <Route
          path="/dashboard"
          element={
            <ProtectedRoute
              adminOnly={true}
            >

              <Dashboard />

            </ProtectedRoute>
          }
        />



        {/* ================= STUDENTS ================= */}
        <Route
          path="/students"
          element={
            <ProtectedRoute
              adminOnly={true}
            >

              <Students />

            </ProtectedRoute>
          }
        />



        {/* ================= TEACHERS ================= */}
        <Route
          path="/teachers"
          element={
            <ProtectedRoute
              adminOnly={true}
            >

              <Teachers />

            </ProtectedRoute>
          }
        />



        {/* ================= ADMINS ================= */}
        <Route
          path="/admins"
          element={
            <ProtectedRoute
              adminOnly={true}
            >

              <AdminUsers />

            </ProtectedRoute>
          }
        />



        {/* ================= ENROLLMENTS ================= */}
        <Route
          path="/enrollments"
          element={
            <ProtectedRoute
              adminOnly={true}
            >

              <Enrollments />

            </ProtectedRoute>
          }
        />

        {/* ================= FEE MANAGEMENT ================= */}
        <Route
          path="/admin/fees"
          element={
            <ProtectedRoute adminOnly={true}>
              <AdminFees />
              </ProtectedRoute>
            }
        />


        {/* ================= YEARS ================= */}
        <Route
          path="/years"
          element={
            <ProtectedRoute
              adminOnly={true}
            >

              <Years />

            </ProtectedRoute>
          }
        />



        {/* ================= SUBJECTS ================= */}
        <Route
          path="/subjects"
          element={
            <ProtectedRoute
              adminOnly={true}
            >

              <Subjects />

            </ProtectedRoute>
          }
        />



        {/* ================= TEACHING ASSIGNMENTS ================= */}
        <Route
          path="/teaching-assignments"
          element={
            <ProtectedRoute
              adminOnly={true}
            >

              <TeachingAssignments />

            </ProtectedRoute>
          }
        />

        {/* ================= Attendance  ================= */}
        <Route path="/teacher/attendance" element={<ProtectedRoute role="teacher"><AttendanceTeacher /></ProtectedRoute>} />
        <Route path="/student/attendance" element={<ProtectedRoute role="student"><AttendanceStudent /></ProtectedRoute>} />

        {/* ================= DEPARTMENTS ================= */}
        <Route
          path="/departments"
          element={
            <ProtectedRoute
              adminOnly={true}
            >

              <Departments />

            </ProtectedRoute>
          }
        />



        {/* ================= TEACHER ================= */}

        <Route
          path="/teacher"
          element={
            <ProtectedRoute
              role="teacher"
            >

              <TeacherHome />

            </ProtectedRoute>
          }
        />



        <Route
          path="/teacher/subject/:id"
          element={
            <ProtectedRoute
              role="teacher"
            >

              <SubjectDetails />

            </ProtectedRoute>
          }
        />

          {/* ================= TEACHER SUBJECTS ================= */}
        <Route
          path="/teacher/subjects"
          element={
            <ProtectedRoute role="teacher">
              <SubjectDetails />
            </ProtectedRoute>
          }
        />

        {/* ================= TEACHER STUDENTS ================= */}
        <Route
          path="/teacher/students"
          element={
            <ProtectedRoute role="teacher">
              <SubjectDetails />
            </ProtectedRoute>
          }
        />

        {/* ================= TEACHER ASSIGNMENTS ================= */}
        <Route
          path="/teacher/assignments"
          element={
            <ProtectedRoute role="teacher">
              <AssignmentTeacher />
            </ProtectedRoute>
          }
        />

        {/* ================= ASSIGNMENT SUBMISSIONS ================= */}

        <Route
          path="/assignments/:id/submissions"
          element={
            <ProtectedRoute>

              <AssignmentSubmissions />

            </ProtectedRoute>
          }
        />



        {/* ================= STUDENT ================= */}

        <Route
          path="/student"
          element={
            <ProtectedRoute
              role="student"
            >

              <StudentHome />

            </ProtectedRoute>
          }
        />



         <Route
          path="/student/courses"
          element={
            <ProtectedRoute
              role="student"
            >

              <StudentCourses />

            </ProtectedRoute>
          }
        /> 



        <Route
          path="/student/subject/:id"
          element={
            <ProtectedRoute
              role="student"
            >

              <StudentSubjectDetails />

            </ProtectedRoute>
          }
        />



        <Route
          path="/student/grades"
          element={
            <ProtectedRoute
              role="student"
            >

              <StudentGrades />

            </ProtectedRoute>
          }
        />

        {/* ================= PARENT ================= */}
        
        <Route 
        path="/parent" element={<ProtectedRoute role="parent"><ParentDashboard /></ProtectedRoute>} />
        <Route path="/parent/grades" element={<ProtectedRoute role="parent"><ParentGrades /></ProtectedRoute>} />
        <Route path="/parent/attendance" element={<ProtectedRoute role="parent"><ParentAttendance /></ProtectedRoute>} />
        <Route path="/parent/assignments" element={<ProtectedRoute role="parent"><ParentAssignments /></ProtectedRoute>} />
        <Route path="/parent/fees" element={<ProtectedRoute role="parent"><ParentFees /></ProtectedRoute>} />
        <Route path="/parent/messages" element={<ProtectedRoute role="parent"><ParentMessages /></ProtectedRoute>} />
        <Route path="/parent/chat" element={<ProtectedRoute role="parent"><ParentChat /></ProtectedRoute>} />
        <Route path="/teacher/chat" element={<ProtectedRoute role="teacher"><TeacherChat /></ProtectedRoute>} />

        <Route
          path="/parents-admin"
          element={
            <ProtectedRoute adminOnly={true}>
              <Parents />
            </ProtectedRoute>
          }
        />

        {/* ================= PROFILE ================= */}

        <Route
          path="/profile"
          element={
            <ProtectedRoute>

              <Profile />

            </ProtectedRoute>
          }
        />



        {/* ================= NOTIFICATIONS ================= */}

        <Route
          path="/notifications"
          element={
            <ProtectedRoute>

              <Notifications />

            </ProtectedRoute>
          }
        />


        {/* ===== FALLBACK ===== */}
        <Route
          path="*"
          element={
            <Navigate
              to="/"
              replace
            />
          }
        />

      </Routes>

    </BrowserRouter>
  );
}

export default App;