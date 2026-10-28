import { lazy, Suspense, type ReactNode } from "react"
import { Navigate, Route, Routes, useLocation } from "react-router-dom"
import { AppShell } from "@/components/layout/AppShell"
import { StoreShell } from "@/components/layout/StoreShell"
import { BoardProvider } from "@/lib/board"
import { SessionProvider, useSession } from "@/lib/session"
import { BoardSkeleton } from "@/components/layout/BoardSkeleton"
import { DeleteAccountPage } from "@/pages/DeleteAccountPage"
import { HowItWorksPage } from "@/pages/HowItWorksPage"
import { NotFoundPage } from "@/pages/NotFoundPage"
import { ContentPolicyPage } from "@/pages/ContentPolicyPage"
import { StoreDashboardPage } from "@/pages/StoreDashboardPage"
import { StoreLoginPage } from "@/pages/StoreLoginPage"
import { StorePlansPage } from "@/pages/StorePlansPage"
import { StoresLandingPage } from "@/pages/StoresLandingPage"
import { PrivacyPage } from "@/pages/PrivacyPage"
import { StaffQueuePage } from "@/pages/StaffQueuePage"
import { TermsPage } from "@/pages/TermsPage"
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

function SideShell({ children }: { children: ReactNode }) {
  const { user } = useSession()
  const { pathname } = useLocation()
  const storeSide = pathname.startsWith("/stores") || user?.kind === "store"
  return storeSide ? <StoreShell>{children}</StoreShell> : <AppShell>{children}</AppShell>
}

export default function App() {
  return (
    <SessionProvider>
    <BoardProvider>
    <SideShell>
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
        <Route path="/plans" element={<Navigate to="/stores/plans" replace />} />
        <Route path="/stores" element={<StoresLandingPage />} />
        <Route path="/stores/plans" element={<StorePlansPage />} />
        <Route path="/stores/login" element={<StoreLoginPage />} />
        <Route path="/stores/dashboard" element={<StoreDashboardPage />} />
        <Route path="/staff" element={<StaffQueuePage />} />
        <Route path="/privacy" element={<PrivacyPage />} />
        <Route path="/terms" element={<TermsPage />} />
        <Route path="/content" element={<ContentPolicyPage />} />
        <Route path="/account/delete" element={<DeleteAccountPage />} />
        <Route path="/write" element={<WritePage />} />
        <Route path="/home" element={<Navigate to="/" replace />} />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </SideShell>
    </BoardProvider>
    </SessionProvider>
  )
}
