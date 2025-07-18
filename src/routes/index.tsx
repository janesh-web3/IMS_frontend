import React, { Suspense, lazy } from "react";
import { Navigate, Outlet, useRoutes } from "react-router-dom";
import PrivateRoute from "./PrivateRoute";
import StudentUpdateForm from "@/pages/students/components/StudentUpdateForm";
import VisitPage from "@/pages/visit-student";
import Loading from "@/pages/not-found/loading";
import ProPlanUpgrade from "@/components/shared/ProPlanUpgrade";
import IDCardGenerator from "@/pages/id_card/IDCardGenerator";
import LandingPage from "@/components/landing/LandingPage";

// Lazy-loaded components
const DashboardLayout = lazy(
  () => import("@/components/layout/dashboard-layout")
);
const SignInPage = lazy(() => import("@/pages/auth/signin"));
const DashboardPage = lazy(() => import("@/pages/dashboard"));
const StudentPage = lazy(() => import("@/pages/students"));
const StudentDocumentPage = lazy(() => import("@/pages/students/document"));
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
const RecycleBinPage = lazy(() => import("@/pages/recyclebin"));
const TakeQuiz = lazy(() => import("@/pages/quiz/take/[id]"));
const IdCardPage = lazy(() => import("@/pages/id_card"));
const ChatPage = lazy(() => import("@/pages/chat"));
const ComplainPage = lazy(() => import("@/pages/complain"));
const NoticePage = lazy(() => import("@/pages/notices"));
const TasksModule = lazy(() => import("@/pages/tasks"));
const CertificatesPage = lazy(() => import("@/pages/certificates"));

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
        { path: "", element: <DashboardPage />, index: true },
        { path: "student", element: <StudentPage /> },
        { path: "visit-student", element: <VisitPage /> },
        { path: "student/update/:id", element: <StudentUpdateForm /> },
        { path: "students/document/:studentId", element: <StudentDocumentPage /> },
        { path: "form", element: <FormPage /> },
        { path: "course", element: <CoursePage /> },
        { path: "course/:id", element: <CourseDetail /> },
        { path: "course/subject/:id", element: <SubjectDetails /> },
        { path: "teacher", element: <TeacherPage /> },
        { path: "recipt", element: <ReciptPage /> },
        { path: "payment", element: <PaymentPage /> },
        { path: "handover", element: <HandOverPage /> },
        { path: "profile", element: <ProfilePage /> },
        { 
          path: "tasks/*", 
          element: <TasksModule />
        },
        { path: "certificates", element: <CertificatesPage /> },
        { path: "upgrade-to-pro", element: <ProPlanUpgrade /> },
        { path: "quiz/take/:id", element: <TakeQuiz /> },
        {
          path: "quiz",
          element: (
              <QuizPage />
            ),
        },
        {
          path: "quiz/take/:id",
          element: (
              <TakeQuiz />
          ),
        },
        {
          path: "setting",
          element: (
            <SettingPage />
          ),
        },
        {
          path: "notification",
          element: (
            <NotificationPage />
          ),
        },
        {
          path: "ai-model",
          element: (
            <AIPage />
          ),
        },
        {
          path: "administration",
          element: (
            <AdministrationPage />
          ),
        },
        {
          path: "recycle-bin",
          element: (
            <RecycleBinPage />
          ),
        },
        {
          path: "chat-bot",
          element: (
              <ChatPage />
          ),
        },
        {
          path: "live-classes",
          element: (
              <h1>live-classes</h1>
          ),
        },
        {
          path: "notice",
          element: (
              <NoticePage />
          ),
        },
        {
          path: "id-card",
          element: (
              <IdCardPage />
          ),
        },
        {
          path: "id-card/:id",
          element: (
              <IDCardGenerator />
          ),
        },
        {
          path: "complain",
          element: (
              <ComplainPage />
          ),
        },
      ],
    },
  ];

  const publicRoutes = [
    { path: "/home", element: <LandingPage />, index: true},
    { path: "/login", element: <SignInPage />},
    { path: "/404", element: <NotFound /> },
    { path: "*", element: <Navigate to="/404" replace /> },
  ];

  const routes = useRoutes([...publicRoutes, ...dashboardRoutes]);

  return routes;
};

export default AppRouter;
