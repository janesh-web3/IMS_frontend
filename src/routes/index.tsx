import React, { Suspense, lazy } from "react";
import { Navigate, Outlet, useRoutes } from "react-router-dom";
import PrivateRoute from "./PrivateRoute";
import StudentUpdateForm from "@/pages/students/components/StudentUpdateForm";
import VisitPage from "@/pages/visit-student";
import Loading from "@/pages/not-found/loading";
import PremiumRoute from "./PremiumRoute";
import ProPlanUpgrade from "@/components/shared/ProPlanUpgrade";

// Lazy-loaded components
const DashboardLayout = lazy(
  () => import("@/components/layout/dashboard-layout")
);
const SignInPage = lazy(() => import("@/pages/auth/signin"));
const DashboardPage = lazy(() => import("@/pages/dashboard"));
const StudentPage = lazy(() => import("@/pages/students"));
const CoursePage = lazy(() => import("@/pages/course"));
const CourseDetail = lazy(() => import("@/pages/course/CourseDetail"));
const SubjectDetails = lazy(
  () => import("@/pages/course/subject/SubjectDetails")
);
const FormPage = lazy(() => import("@/pages/form"));
const HandOverPage = lazy(() => import("@/pages/handover"));
const PaymentPage = lazy(() => import("@/pages/payment"));
const QuizPage = lazy(() => import("@/pages/quiz"));
const ReciptPage = lazy(() => import("@/pages/recipt"));
const TeacherPage = lazy(() => import("@/pages/teacher"));
const NotFound = lazy(() => import("@/pages/not-found"));
const SettingPage = lazy(() => import("@/pages/settings"));
const NotificationPage = lazy(() => import("@/pages/notification"));
const AIPage = lazy(() => import("@/pages/ai_model"));
const ProfilePage = lazy(() => import("@/pages/profile"));
const AdministrationPage = lazy(() => import("@/pages/administration"));

const AppRouter: React.FC = () => {
  const dashboardRoutes = [
    {
      path: "/",
      element: (
        <PrivateRoute>
          <DashboardLayout>
            <Suspense
              fallback={
                <div>
                  <Loading />
                </div>
              }
            >
              <Outlet />
            </Suspense>
          </DashboardLayout>
        </PrivateRoute>
      ),
      children: [
        { path: "/", element: <DashboardPage />, index: true },
        { path: "student", element: <StudentPage /> },
        { path: "visit-student", element: <VisitPage /> },
        { path: "student/update/:id", element: <StudentUpdateForm /> },
        { path: "form", element: <FormPage /> },
        { path: "course", element: <CoursePage /> },
        { path: "course/:id", element: <CourseDetail /> },
        { path: "course/subject/:id", element: <SubjectDetails /> },
        { path: "teacher", element: <TeacherPage /> },
        { path: "recipt", element: <ReciptPage /> },
        { path: "payment", element: <PaymentPage /> },
        { path: "handover", element: <HandOverPage /> },
        { path: "profile", element: <ProfilePage /> },
        { path: "upgrade-to-pro", element: <ProPlanUpgrade /> },
        {
          path: "quiz",
          element: (
            <PremiumRoute>
              <QuizPage />
            </PremiumRoute>
          ),
        },
        {
          path: "setting",
          element: (
            <PremiumRoute>
              <SettingPage />
            </PremiumRoute>
          ),
        },
        {
          path: "notification",
          element: (
            <PremiumRoute>
              <NotificationPage />
            </PremiumRoute>
          ),
        },
        {
          path: "ai-model",
          element: (
            <PremiumRoute>
              <AIPage />
            </PremiumRoute>
          ),
        },
        {
          path: "administration",
          element: (
            <PremiumRoute>
              <AdministrationPage />
            </PremiumRoute>
          ),
        },
      ],
    },
  ];

  const publicRoutes = [
    { path: "/login", element: <SignInPage />, index: true },
    { path: "/404", element: <NotFound /> },
    { path: "*", element: <Navigate to="/404" replace /> },
  ];

  const routes = useRoutes([...dashboardRoutes, ...publicRoutes]);

  return routes;
};

export default AppRouter;
