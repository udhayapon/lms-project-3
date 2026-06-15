import {
  useNavigate,
  useLocation
} from "react-router-dom";

import {
  useState
} from "react";

import { 
  useTranslation 
} from "react-i18next";

export default function Sidebar({
  open,
  setOpen
}) {

  const navigate =
    useNavigate();

  const location =
    useLocation();

  const user = JSON.parse(
    localStorage.getItem("user") || "{}"
  );

  const { t } = useTranslation();

  // ================= USERS DROPDOWN =================
  const [usersOpen, setUsersOpen] =
    useState(true);

  let menu = [];

  // ================= ADMIN =================
  if (user.role === "admin") {
    menu = [

      {
        name: "Dashboard",
        path: "/dashboard"
      },

      {
        name: "Departments",
        path: "/departments"
      },

      // ================= USERS GROUP =================
      {
        name: "Users",
        children: [

          {
            name: "Students",
            path: "/students"
          },

          {
            name: "Teachers",
            path: "/teachers"
          },

          {
            name: "Admins",
            path: "/admins"
          },

          {
            name: "Parents",
            path: "/parents-admin"
          },

        ]
      },

      {
        name: "Courses",
        path: "/courses"
      },

      {
        name:
          "Faculty Allocation",

        path:
          "/teaching-assignments"
      },

      {
        name: "Enrollments",
        path: "/enrollments"
      },

      { name: "Fee Management", 
        path: "/admin/fees"  
      },

      { name: "Academic Calendar",
         path: "/calendar" 
      },

      {
        name: "Profile",
        path: "/profile"
      },
    ];
  }

  // ================= TEACHER =================
  else if (
    user.role === "teacher"
  ) {

    menu = [

      {
        name: "Dashboard",
        path: "/teacher"
      },

      {
        name: "My Subjects",
        path: "/courses"
      },

      {
        name: "Attendance",
        path: "/teacher/attendance"
      },
      
      { name: "Messages", 
        path: "/teacher/chat" 
      },

      {
        name: "Notifications",
        path: "/notifications"
      },

      { name: "Academic Calendar", 
        path: "/calendar" 
      },

      {
        name: "Profile",
        path: "/profile"
      },

    ];
  }

  // ================= STUDENT =================
  else if (
    user.role === "student"
  ) {

    menu = [

      {
        name: "Dashboard",
        path: "/student"
      },

      {
        name: "My Subjects",
        path:
          "/student/courses"
      },

      {
        name: "Grades",
        path:
          "/student/grades"
      },

      {
        name: "Attendance",
        path: "/student/attendance"
      },

      {
        name: "Notifications",
        path: "/notifications"
      },

      { name: "Academic Calendar", 
        path: "/calendar" 
      },


      {
        name: "Profile",
        path: "/profile"
      },
    ];
  }

  // ================= PARENT =================
  else if (user.role === "parent") {
    menu = [
      { name: t("dashboard"), path: "/parent" },
      { name: t("grades"), path: "/parent/grades" },
      { name: t("attendance"), path: "/parent/attendance" },
      { name: t("assignments"), path: "/parent/assignments" },
      { name: t("fees"), path: "/parent/fees" },
      { name: t("messages"), path: "/parent/chat" },
      { name: t("notifications"), path: "/notifications" },
      { name: t("academic_calendar"), path: "/calendar" },
      { name: t("profile"), path: "/profile" },
    ];
  }

  
  // ================= ACTIVE =================
  const isActive = (path) => {

    // EXACT MATCH
    if (
      location.pathname === path
    ) {

      return true;
    }

    // ================= STUDENT DASHBOARD =================
    if (
      path === "/student"
    ) {

      return (
        location.pathname ===
        "/student"
      );
    }

    // ================= TEACHER DASHBOARD =================
    if (
      path === "/teacher"
    ) {

      return (
        location.pathname ===
        "/teacher"
      );
    }

    // ================= ADMIN DASHBOARD =================
    if (
      path === "/dashboard"
    ) {

      return (
        location.pathname ===
        "/dashboard"
      );
    }

    // ================= PARENT DASHBOARD =================
    if (
      path === "/parent"
    ) {

      return (
        location.pathname ===
        "/parent"
      );
    }

    // ================= NORMAL MATCH =================
    return (
      location.pathname.startsWith(
        path
      )
    );
  };

  return (
    <>

      {/* ================= OVERLAY ================= */}
      {open && (

        <div
          className="sidebar-overlay"
          onClick={() =>
            setOpen(false)
          }
        />

      )}

      {/* ================= SIDEBAR ================= */}
      <div
        className={`sidebar ${
          open ? "open" : ""
        }`}
      >

        {/* ================= LOGO ================= */}
        <h2 className="logo">
          LMS
        </h2>

        {/* ================= USER INFO ================= */}
        <div className="user-info">

          <div className="avatar">

            {user?.username
              ?.slice(0, 2)
              .toUpperCase() || "US"}

          </div>

          <div>

            <p>
              {user?.username}
            </p>

            <span>
              {user?.role}
            </span>

          </div>

        </div>

        {/* ================= MENU ================= */}
        <div className="menu">

          {menu.map((item) => (

            <div key={item.name}>

              {/* ================= NORMAL MENU ================= */}
              {!item.children && (

                <p
                  onClick={() => {

                    navigate(
                      item.path
                    );

                    setOpen(false);
                  }}

                  className={
                    isActive(item.path)
                      ? "active"
                      : ""
                  }
                >

                  {item.name}

                </p>
              )}

              {/* ================= USERS DROPDOWN ================= */}
              {item.children && (

                <div>

                  <p
                    onClick={() =>
                      setUsersOpen(
                        !usersOpen
                      )
                    }
                  >

                    {item.name}

                  </p>

                  {usersOpen && (

                    <div
                      style={{
                        marginLeft: "20px"
                      }}
                    >

                      {item.children.map(
                        (sub) => (

                          <p
                            key={sub.name}

                            onClick={() => {

                              navigate(
                                sub.path
                              );

                              setOpen(false);
                            }}

                            className={
                              isActive(
                                sub.path
                              )
                                ? "active"
                                : ""
                            }
                          >

                            {sub.name}

                          </p>
                        )
                      )}

                    </div>
                  )}

                </div>
              )}

            </div>
          ))}

        </div>

      </div>

    </>
  );
}