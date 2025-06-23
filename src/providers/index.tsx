import { Button } from "@/components/ui/button";
import { useRouter } from "@/routes/hooks";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { Suspense } from "react";
import { ErrorBoundary, FallbackProps } from "react-error-boundary";
import { HelmetProvider } from "react-helmet-async";
import { HashRouter } from "react-router-dom";
import ThemeProvider from "./theme-provider";
import { SidebarProvider } from "@/hooks/use-sidebar";
import PackageProvider from "@/context/packageContext";
import NotificationProvider from "./notificationProvider";
import { NotificationSoundProvider } from "@/contexts/NotificationSoundContext";
import AdminProvider from "@/context/adminContext";
import { MessageProvider } from "./messageProvider";
import { TaskProvider } from "@/context/taskContext";

export const queryClient = new QueryClient();

const ErrorFallback = ({ error }: FallbackProps) => {
  const router = useRouter();
  return (
    <div
      className="flex flex-col items-center justify-center w-screen h-screen text-red-500"
      role="alert"
    >
      <h2 className="text-2xl font-semibold">
        Ooops, something went wrong :({" "}
      </h2>
      <pre className="text-2xl font-bold">{error.message}</pre>
      <pre>{error.stack}</pre>
      <Button className="mt-4" onClick={() => router.back()}>
        Go back
      </Button>
    </div>
  );
};

export default function AppProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Suspense>
      <HelmetProvider>
        <HashRouter>
          <ErrorBoundary FallbackComponent={ErrorFallback}>
            <QueryClientProvider client={queryClient}>
              <ReactQueryDevtools />
              <NotificationSoundProvider>
                <PackageProvider>
                  <AdminProvider>
                    <NotificationProvider>
                      <MessageProvider>
                        <TaskProvider>
                          <ThemeProvider
                            defaultTheme="dark"
                            storageKey="vite-ui-theme"
                          >
                            <SidebarProvider>
                              {children}
                            </SidebarProvider>
                          </ThemeProvider>
                        </TaskProvider>
                      </MessageProvider>
                    </NotificationProvider>
                  </AdminProvider>
                </PackageProvider>
              </NotificationSoundProvider>
            </QueryClientProvider>
          </ErrorBoundary>
        </HashRouter>
      </HelmetProvider>
    </Suspense>
  );
}
