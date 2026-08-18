import { createFileRoute } from "@tanstack/react-router";
import { MobileGate } from "@/components/mobile/MobileGate";
import { MobileShell } from "@/components/mobile/MobileShell";
import { StudentInquiriesScreen } from "@/components/mobile/screens/StudentInquiriesScreen";
import StudentInquiries from "@/components/desktop/StudentInquiries";
export const Route = createFileRoute("/my-inquiries")({ component: Page });
function Page() { return <MobileGate mobile={<MobileShell variant="student"><StudentInquiriesScreen /></MobileShell>} desktop={<StudentInquiries />} />; }
