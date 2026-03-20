import {
    CreditCard, Building2, Briefcase, GraduationCap,
    Shield, BookOpen, Calendar, Map,
    Clock, Star, Cpu, Laptop
} from 'lucide-react';

export const CATEGORIES = [
    { name: "Fee Structure", icon: CreditCard, color: "from-[#3b82f6] to-[#60a5fa]" },
    { name: "Hostel Facilities", icon: Building2, color: "from-[#2563eb] to-[#3b82f6]" },
    { name: "Placements", icon: Briefcase, color: "from-[#3b82f6] to-[#1d4ed8]" },
    { name: "Scholarships", icon: GraduationCap, color: "from-[#1d4ed8] to-[#60a5fa]" },
    { name: "Anti-Ragging", icon: Shield, color: "from-[#2563eb] to-[#3b82f6]" },
    { name: "SOET Programs", icon: Cpu, color: "from-[#3b82f6] to-[#93c5fd]" },
    { name: "Admissions", icon: BookOpen, color: "from-[#1d4ed8] to-[#3b82f6]" },
    { name: "Campus Life", icon: Map, color: "from-[#3b82f6] to-[#2563eb]" },
];

export const SUGGESTIONS = [
    { text: "What are the hostel facilities and fees?", icon: Building2 },
    { text: "Scholarship eligibility for JEE students", icon: Star },
    { text: "Placement process and highest package", icon: Briefcase },
    { text: "BTech CSE fee structure", icon: CreditCard },
    { text: "BTech CSE specializations available", icon: Laptop },
    { text: "How to apply for admission?", icon: BookOpen },
];

export const FAQ_CARDS = [
    { text: "What is the BTech CSE fee structure?", icon: CreditCard, description: "Semester fees, one-time charges, hostel costs" },
    { text: "How do I apply for scholarships?", icon: GraduationCap, description: "Merit, category, and entrance exam based" },
    { text: "Tell me about campus placements", icon: Briefcase, description: "56.6 LPA highest, 800+ recruiters" },
    { text: "What are the hostel facilities?", icon: Building2, description: "Rooms, sports, Wi-Fi, security" },
];

export const QUICK_ACTIONS = [
    "BTech CSE Fee Structure",
    "Scholarship Eligibility",
    "Hostel Facilities",
    "Placement Process",
];
