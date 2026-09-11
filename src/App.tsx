import { lazy, Suspense, type ReactNode } from "react"
import { Navigate, Route, Routes } from "react-router-dom"
import { AppShell } from "@/components/layout/AppShell"
import { BoardSkeleton } from "@/components/layout/BoardSkeleton"
import { DeleteAccountPage } from "@/pages/DeleteAccountPage"
import { HowItWorksPage } from "@/pages/HowItWorksPage"
import { NotFoundPage } from "@/pages/NotFoundPage"
import { PlansPage } from "@/pages/PlansPage"
import { PrivacyPage } from "@/pages/PrivacyPage"
import { StaffQueuePage } from "@/pages/StaffQueuePage"
import { WritePage } from "@/pages/WritePage"

const HomePage = lazy(() =>
  import("@/pages/HomePage").then((module) => ({ default: module.HomePage })),
)
const DirectoryPage = lazy(() =>
  import("@/pages/DirectoryPage").then((module) => ({ default: module.DirectoryPage })),
)
const WorkplacePage = lazy(() =>
  import("@/pages/WorkplacePage").then((module) => ({ default: module.WorkplacePage })),
)

function CatalogRoute({
  variant,
  children,
}: {
  variant: "board" | "directory" | "workplace"
  children: ReactNode
}) {
  return <Suspense fallback={<BoardSkeleton variant={variant} />}>{children}</Suspense>
}

export default function App() {
  return (
    <AppShell>
      <Routes>
        <Route
          path="/"
          element={
            <CatalogRoute variant="board">
              <HomePage />
            </CatalogRoute>
          }
        />
        <Route path="/how-it-works" element={<HowItWorksPage />} />
        <Route
          path="/workplaces"
          element={
            <CatalogRoute variant="directory">
              <DirectoryPage />
            </CatalogRoute>
          }
        />
        <Route
          path="/workplaces/:slug"
          element={
            <CatalogRoute variant="workplace">
              <WorkplacePage />
            </CatalogRoute>
          }
        />
        <Route path="/plans" element={<PlansPage />} />
        <Route path="/staff" element={<StaffQueuePage />} />
        <Route path="/privacy" element={<PrivacyPage />} />
        <Route path="/account/delete" element={<DeleteAccountPage />} />
        <Route path="/write" element={<WritePage />} />
        <Route path="/home" element={<Navigate to="/" replace />} />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </AppShell>
  )
}
