import {
    CreditCard, Building2, Briefcase, GraduationCap,
    Shield, BookOpen, Calendar, Map,
    Clock, Star, Cpu, Laptop
} from 'lucide-react';

export const CATEGORIES = [
    { name: "Fee Structure", icon: CreditCard, color: "from-[#ff4d00] to-[#ff6a2a]" },
    { name: "Hostel Facilities", icon: Building2, color: "from-[#cc3d00] to-[#ff4d00]" },
    { name: "Placements", icon: Briefcase, color: "from-[#ff4d00] to-[#e64500]" },
    { name: "Scholarships", icon: GraduationCap, color: "from-[#e64500] to-[#ff6a2a]" },
    { name: "Anti-Ragging", icon: Shield, color: "from-[#cc3d00] to-[#ff4d00]" },
    { name: "SOET Programs", icon: Cpu, color: "from-[#ff4d00] to-[#ff8040]" },
    { name: "Admissions", icon: BookOpen, color: "from-[#e64500] to-[#ff4d00]" },
    { name: "Campus Life", icon: Map, color: "from-[#ff4d00] to-[#cc3d00]" },
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
