import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";

const details = [
  {
    id: "0",
    title: "Student Management",
    desc: "Easily manage student admissions, records, and performance tracking.",
  },
  {
    id: "1",
    title: "Teacher and Course Management",
    desc: "Assign teachers, structure courses, and optimize class schedules.",
  },
  {
    id: "2",
    title: "Accounting Dashboard",
    desc: "Track fees, generate invoices, and manage all financial operations.",
  },
  {
    id: "3",
    title: "Notifications and Alerts",
    desc: "Stay informed with real-time alerts for updates and tasks.",
  },
  {
    id: "4",
    title: "Time Spend Tracker",
    desc: "Monitor how time is spent across students, teachers, and staff.",
  },
  {
    id: "5",
    title: "Database and Backup Recovery",
    desc: "Ensure your data is safe with automated backups and quick recovery.",
  },
  {
    id: "6",
    title: "Role Management System",
    desc: "Custom access control for admins, teachers, staff, and students.",
  },
  {
    id: "7",
    title: "Advanced Customization",
    desc: "Personalize modules, dashboards, and workflows to your needs.",
  },
  {
    id: "8",
    title: "Bill Printing Functionality",
    desc: "Generate and print professional-looking bills and receipts.",
  },
  {
    id: "9",
    title: "Quiz Management",
    desc: "Create, schedule, and evaluate quizzes with automated scoring.",
  },
  {
    id: "10",
    title: "AI Powered Reports",
    desc: "Leverage AI to generate insights from attendance and performance.",
  },
  {
    id: "11",
    title: "Chat Applications",
    desc: "Integrated chat tools for students, teachers, and admins.",
  },
  {
    id: "12",
    title: "Live Classes",
    desc: "Host or join real-time virtual classes with attendance tracking.",
  },
  {
    id: "13",
    title: "Notice Board",
    desc: "Post announcements and updates in a centralized location.",
  },
  {
    id: "14",
    title: "Personalized GPTs",
    desc: "Custom AI tools for learning support and knowledge enhancement.",
  },
  {
    id: "15",
    title: "ID Card Generator",
    desc: "Instantly create and print student and staff ID cards.",
  },
  {
    id: "16",
    title: "Student & Teacher Dashboard",
    desc: "Individual dashboards tailored for each user's role and goals.",
  },
  {
    id: "17",
    title: "24 / 7 Customer support",
    desc: "Dedicated support available round the clock to assist you.",
  },
];

export default function LandingPage() {
  const navigate = useNavigate();

  const handleGetStarted = () => {
    navigate("/login");
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-green-950 via-black to-green-900 text-foreground flex flex-col relative overflow-hidden">
      {/* Logo and Hero Section */}
      <section className="flex-1 flex flex-col items-center justify-center px-6 py-20 relative overflow-hidden">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1 }}
          className="mb-6"
        >
          <img
            src={"logot.png"}
            alt="Logo"
            className="rounded-full"
            width={120}
            height={120}
          />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
          className="text-center max-w-4xl z-10"
        >
          <h1 className="text-4xl md:text-6xl font-bold leading-tight mb-6 bg-gradient-to-r from-green-400 to-green-600 bg-clip-text text-transparent">
            Empower Your Institute with Smarter Management{" "}
            <span className="underline decoration-wavy decoration-yellow-500 text-blue-500">
              FINI
            </span>
          </h1>
          <p className="text-muted-foreground text-lg md:text-xl mb-8">
            With FINI, seamlessly manage students, teachers, billing, courses,
            and more—all in one intuitive platform.
          </p>
          <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}>
            <Button
              onClick={handleGetStarted}
              className="text-lg px-6 py-3 animate-bounce"
            >
              Get Started
            </Button>
          </motion.div>
        </motion.div>

        {/* Galaxy Stars Background */}
        <div className="absolute inset-0 z-0">
          {[...Array(100)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-1 h-1 bg-white rounded-full opacity-30"
              style={{
                top: `${Math.random() * 100}%`,
                left: `${Math.random() * 100}%`,
              }}
              animate={{ y: [0, -10, 0] }}
              transition={{
                repeat: Infinity,
                duration: 4 + Math.random() * 3,
                ease: "easeInOut",
              }}
            />
          ))}
        </div>
      </section>

      {/* Features Section */}
      <section className="bg-secondary py-20 px-6 text-secondary-foreground relative overflow-hidden">
        <div className="absolute -top-10 -left-10 w-72 h-72 bg-green-900/20 rounded-full animate-pulse-slow blur-3xl"></div>
        <div className="absolute -bottom-10 -right-10 w-96 h-96 bg-green-700/10 rounded-full animate-spin-slow blur-2xl"></div>

        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">
            Explore the Features of{" "}
            <span className="underline decoration-wavy decoration-yellow-500 text-blue-500">
              FINI
            </span>
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {details.map((feature, i) => (
              <motion.div
                key={feature.id}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05, duration: 0.5 }}
                viewport={{ once: true }}
              >
                <Card className="p-6 shadow-xl rounded-2xl bg-card text-card-foreground hover:scale-[1.03] transition-transform hover:shadow-2xl backdrop-blur-md">
                  <h3 className="text-xl font-semibold text-center mb-2 text-green-400">
                    {feature.title}
                  </h3>
                  <p className="text-sm text-muted-foreground text-center">
                    {feature.desc}
                  </p>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="text-center py-6 bg-background border-t border-border text-sm z-10">
        &copy; {new Date().getFullYear()} Crown Mantra AGI. All
        rights reserved.
      </footer>
    </main>
  );
}
