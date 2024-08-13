import CoursePage from '@/pages/course';
import CourseDetail from '@/pages/course/CourseDetail';
import SubjectDetails from '@/pages/course/subject/SubjectDetails';
import FormPage from '@/pages/form';
import HandOverPage from '@/pages/handover';
import NotFound from '@/pages/not-found';
import PaymentPage from '@/pages/payment';
import QuizPage from '@/pages/quiz';
import ReciptPage from '@/pages/recipt';
import TeacherPage from '@/pages/teacher';
import { Suspense, lazy } from 'react';
import { Navigate, Outlet, useRoutes } from 'react-router-dom';

const DashboardLayout = lazy(
  () => import('@/components/layout/dashboard-layout')
);
const SignInPage = lazy(() => import('@/pages/auth/signin'));
const DashboardPage = lazy(() => import('@/pages/dashboard'));
const StudentPage = lazy(() => import('@/pages/students'));
const StudentDetailPage = lazy(
  () => import('@/pages/students/StudentDetailPage')
);

// ----------------------------------------------------------------------

export default function AppRouter() {
  const dashboardRoutes = [
    {
      path: '/',
      element: (
        <DashboardLayout>
          <Suspense>
            <Outlet />
          </Suspense>
        </DashboardLayout>
      ),
      children: [
        {
          element: <DashboardPage />,
          index: true
        },
        {
          path: 'student',
          element: <StudentPage />
        },
        {
          path: 'student/details',
          element: <StudentDetailPage />
        },
        {
          path: 'form',
          element: <FormPage />
        },
        {
          path: 'course',
          element: <CoursePage />
        },
        {
          path: 'course/:id',
          element: <CourseDetail />
        },
        {
          path: 'course/subject/:id',
          element: <SubjectDetails/>
        },
        {
          path: 'teacher',
          element: <TeacherPage />
        },
        {
          path: 'recipt',
          element: <ReciptPage />
        },
        {
          path: 'payment',
          element: <PaymentPage/>
        },
        {
          path: 'handover',
          element: <HandOverPage />
        },
        {
          path: 'quiz',
          element: <QuizPage/>
        },

      ]
    }
  ];

  const publicRoutes = [
    {
      path: '/login',
      element: <SignInPage />,
      index: true
    },
    {
      path: '/404',
      element: <NotFound />
    },
    {
      path: '*',
      element: <Navigate to="/404" replace />
    }
  ];

  const routes = useRoutes([...dashboardRoutes, ...publicRoutes]);

  return routes;
}
