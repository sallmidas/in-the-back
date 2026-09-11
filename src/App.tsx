import { Navigate, Route, Routes } from "react-router-dom"
import { AppShell } from "@/components/layout/AppShell"
import { DeleteAccountPage } from "@/pages/DeleteAccountPage"
import { DirectoryPage } from "@/pages/DirectoryPage"
import { HomePage } from "@/pages/HomePage"
import { HowItWorksPage } from "@/pages/HowItWorksPage"
import { NotFoundPage } from "@/pages/NotFoundPage"
import { PlansPage } from "@/pages/PlansPage"
import { PrivacyPage } from "@/pages/PrivacyPage"
import { StaffQueuePage } from "@/pages/StaffQueuePage"
import { WorkplacePage } from "@/pages/WorkplacePage"
import { WritePage } from "@/pages/WritePage"

export default function App() {
  return (
    <AppShell>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/how-it-works" element={<HowItWorksPage />} />
        <Route path="/workplaces" element={<DirectoryPage />} />
        <Route path="/workplaces/:slug" element={<WorkplacePage />} />
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
