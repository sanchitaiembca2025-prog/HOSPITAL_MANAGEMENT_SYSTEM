import Link from "next/link"
import {
  Stethoscope, ClipboardList, FlaskConical, ShieldCheck,
  BedDouble, BarChart3, ArrowRight, Heart,
  Activity, Lock, Users,
} from "lucide-react"

const features = [
  {
    icon: ClipboardList,
    title: "Patient Registration",
    description: "Clerks register patients instantly and manage admissions, visits, and invoices in one place.",
  },
  {
    icon: Stethoscope,
    title: "Doctor Workflow",
    description: "Doctors review patient records, upload prescriptions, and track treatment progress end-to-end.",
  },
  {
    icon: FlaskConical,
    title: "Lab Management",
    description: "Lab personnel log tests, equipment, and resources against patient visits with structured cost tracking.",
  },
  {
    icon: BarChart3,
    title: "Admin Control",
    description: "Admins manage all personnel, ward beds, test catalogues, and generate comprehensive reports.",
  },
  {
    icon: BedDouble,
    title: "Ward & Bed Tracking",
    description: "Real-time bed availability across General, ICU, and Maternity wards with automatic updates on admission.",
  },
  {
    icon: ShieldCheck,
    title: "Role-Based Access",
    description: "Every user sees only what they need. JWT-secured endpoints enforce strict role boundaries.",
  },
]

const roles = [
  {
    role: "Admin",
    icon: ShieldCheck,
    color: "bg-primary-600",
    ring: "border-primary-200",
    bg: "bg-primary-50",
    text: "text-primary-700",
    dot: "bg-primary-600",
    tasks: ["Manage personnel", "Configure catalogues", "Oversee wards & seminars", "View reports"],
  },
  {
    role: "Doctor",
    icon: Stethoscope,
    color: "bg-accent-500",
    ring: "border-accent-100",
    bg: "bg-accent-50",
    text: "text-accent-700",
    dot: "bg-accent-500",
    tasks: ["Review active patients", "Upload prescriptions", "Mark treatment progress", "Update your profile"],
  },
  {
    role: "Clerk",
    icon: ClipboardList,
    color: "bg-sky-300",
    ring: "border-neutral-200",
    bg: "bg-neutral-50",
    text: "text-sky-500",
    dot: "bg-sky-300",
    tasks: ["Register new patients", "Create & manage visits", "Generate invoices", "Record payments"],
  },
  {
    role: "Lab",
    icon: FlaskConical,
    color: "bg-success-700",
    ring: "border-success-100",
    bg: "bg-success-50",
    text: "text-success-700",
    dot: "bg-success-700",
    tasks: ["View active patient visits", "Log tests & equipment", "Upload test results", "Track resource usage"],
  },
]

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white text-neutral-800 font-sans">

      {/* ── Navbar ──────────────────────────────────────────────────────── */}
      <header className="sticky top-0 z-50 bg-white/90 backdrop-blur border-b border-neutral-200">
        <div className="max-w-7xl mx-auto px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xl">🏥</span>
            <span className="font-bold text-primary-600 tracking-tight text-lg">HMS</span>
            <span className="hidden sm:inline text-xs text-neutral-400 ml-1">Clinical Technology</span>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/signup" className="text-sm text-neutral-600 hover:text-primary-600 transition-colors font-medium hidden sm:block">
              Register
            </Link>
            <Link
              href="/login"
              className="flex items-center gap-1.5 bg-primary-600 hover:bg-primary-700 text-white text-sm font-medium px-4 py-2 rounded-md transition-colors"
            >
              <Lock className="h-3.5 w-3.5" /> Staff Login
            </Link>
          </div>
        </div>
      </header>

      {/* ── Hero ────────────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden bg-primary-900 text-white">
        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage: "linear-gradient(#CAE9FF 1px, transparent 1px), linear-gradient(90deg, #CAE9FF 1px, transparent 1px)",
            backgroundSize: "40px 40px",
          }}
        />
        {/* Glow blob */}
        <div className="absolute -top-32 -right-32 h-96 w-96 rounded-full bg-accent-500/10 blur-3xl pointer-events-none" />

        <div className="relative max-w-7xl mx-auto px-6 py-24 md:py-32 flex flex-col md:flex-row items-center gap-14">
          {/* Left */}
          <div className="flex-1 space-y-6">
            <div className="inline-flex items-center gap-2 bg-white/10 border border-white/20 rounded-full px-4 py-1.5 text-xs font-medium text-primary-100">
              <Activity className="h-3.5 w-3.5 text-accent-400" />
              Integrated Hospital Management
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight tracking-tight">
              Modern care,<br />
              <span className="text-accent-400">streamlined</span> operations.
            </h1>
            <p className="text-primary-100 text-lg max-w-xl leading-relaxed">
              A unified platform for hospital staff — from patient registration and ward management to lab results and invoicing.
            </p>
            <div className="flex flex-wrap gap-3 pt-2">
              <Link
                href="/login"
                className="flex items-center gap-2 bg-accent-500 hover:bg-accent-700 text-white font-semibold px-6 py-3 rounded-lg transition-colors"
              >
                Sign In to HMS <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/signup"
                className="flex items-center gap-2 bg-white/10 hover:bg-white/20 border border-white/20 text-white font-medium px-6 py-3 rounded-lg transition-colors"
              >
                Create Account
              </Link>
            </div>
          </div>

          {/* Right — stats card */}
          <div className="w-full md:w-72 shrink-0">
            <div className="bg-white/10 border border-white/20 rounded-2xl p-6 space-y-4 backdrop-blur-sm">
              <p className="text-xs font-semibold text-primary-200 uppercase tracking-widest">System at a glance</p>
              {[
                { label: "Patient Visit Lifecycle",  value: "✓", sub: "Admit → Treat → Discharge" },
                { label: "Role-Based Portals",        value: "4",  sub: "Admin · Doctor · Clerk · Lab" },
                { label: "Invoice Automation",        value: "✓",  sub: "Auto-generated on discharge" },
                { label: "Secure JWT Auth",           value: "✓",  sub: "Per-role endpoint protection" },
              ].map((s) => (
                <div key={s.label} className="flex items-center justify-between border-b border-white/10 pb-3 last:border-0 last:pb-0">
                  <div>
                    <p className="text-xs text-primary-200">{s.label}</p>
                    <p className="text-xs text-primary-300/70 mt-0.5">{s.sub}</p>
                  </div>
                  <span className="text-xl font-bold text-white">{s.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Features ────────────────────────────────────────────────────── */}
      <section className="py-20 bg-neutral-50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-14">
            <p className="text-xs font-semibold text-accent-500 uppercase tracking-widest mb-2">Capabilities</p>
            <h2 className="text-3xl font-bold text-neutral-900">Everything your team needs</h2>
            <p className="text-neutral-500 mt-3 max-w-xl mx-auto">
              Built for every department — from front desk to laboratory — with role-specific tools and a shared patient record.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((f) => {
              const Icon = f.icon
              return (
                <div
                  key={f.title}
                  className="bg-white rounded-xl border border-neutral-200 p-6 hover:shadow-md hover:border-primary-200 transition-all group"
                >
                  <div className="h-11 w-11 rounded-lg bg-primary-50 flex items-center justify-center mb-4 group-hover:bg-primary-100 transition-colors">
                    <Icon className="h-5 w-5 text-primary-600" />
                  </div>
                  <h3 className="font-semibold text-neutral-800 mb-2">{f.title}</h3>
                  <p className="text-sm text-neutral-500 leading-relaxed">{f.description}</p>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* ── Roles ───────────────────────────────────────────────────────── */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-14">
            <p className="text-xs font-semibold text-accent-500 uppercase tracking-widest mb-2">Portals</p>
            <h2 className="text-3xl font-bold text-neutral-900">Tailored for every role</h2>
            <p className="text-neutral-500 mt-3 max-w-xl mx-auto">
              Each staff member logs in to a personalised portal — only the tools relevant to their role.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {roles.map((r) => {
              const Icon = r.icon
              return (
                <div key={r.role} className={`rounded-xl border-2 ${r.ring} ${r.bg} p-6 flex flex-col gap-4`}>
                  <div className="flex items-center gap-3">
                    <div className={`h-10 w-10 rounded-lg ${r.color} flex items-center justify-center shrink-0`}>
                      <Icon className="h-5 w-5 text-white" />
                    </div>
                    <span className={`font-bold text-lg ${r.text}`}>{r.role}</span>
                  </div>
                  <ul className="space-y-2">
                    {r.tasks.map((t) => (
                      <li key={t} className="flex items-start gap-2 text-sm text-neutral-600">
                        <span className={`mt-1.5 h-1.5 w-1.5 rounded-full shrink-0 ${r.dot}`} />
                        {t}
                      </li>
                    ))}
                  </ul>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* ── CTA ─────────────────────────────────────────────────────────── */}
      <section className="py-20 bg-primary-900 text-white">
        <div className="max-w-3xl mx-auto px-6 text-center space-y-6">
          <Heart className="h-10 w-10 text-accent-400 mx-auto" />
          <h2 className="text-3xl md:text-4xl font-bold">Ready to get started?</h2>
          <p className="text-primary-200 text-lg">
            Create your staff account and start managing patient care from day one.
          </p>
          <div className="flex flex-wrap justify-center gap-4 pt-2">
            <Link
              href="/signup"
              className="bg-accent-500 hover:bg-accent-700 text-white font-semibold px-8 py-3 rounded-lg transition-colors flex items-center gap-2"
            >
              <Users className="h-4 w-4" /> Create Account
            </Link>
            <Link
              href="/login"
              className="bg-white/10 hover:bg-white/20 border border-white/20 text-white font-medium px-8 py-3 rounded-lg transition-colors"
            >
              Sign In
            </Link>
          </div>
        </div>
      </section>

      {/* ── Footer ──────────────────────────────────────────────────────── */}
      <footer className="bg-primary-900 border-t border-white/10 py-6">
        <div className="max-w-7xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-primary-300">
          <div className="flex items-center gap-2">
            <span>🏥</span>
            <span className="font-semibold text-white">HMS</span>
            <span>— Clinical Technology Platform</span>
          </div>
          <span>v1.0 · Next.js + Spring Boot</span>
        </div>
      </footer>
    </div>
  )
}
