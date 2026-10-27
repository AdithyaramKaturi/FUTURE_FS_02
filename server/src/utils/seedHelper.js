import { Admin } from '../models/Admin.js';
import { Lead } from '../models/Lead.js';
import { Note } from '../models/Note.js';
import { FollowUp } from '../models/FollowUp.js';
import { config } from '../config/env.js';

export const seedDefaultAdmin = async () => {
  const existing = await Admin.findOne({ email: config.defaultAdmin.email.toLowerCase() });
  if (existing) {
    return existing;
  }

  const passwordHash = await Admin.hashPassword(config.defaultAdmin.password);
  const admin = await Admin.create({
    name: config.defaultAdmin.name,
    email: config.defaultAdmin.email.toLowerCase(),
    passwordHash,
    role: 'superadmin'
  });

  return admin;
};

export const sampleLeadsData = [
  {
    name: 'Sarah Jenkins',
    email: 'sarah.j@apexcreative.co',
    phone: '+1 (555) 234-5678',
    company: 'Apex Creative Studios',
    serviceInterested: 'Full-Stack App',
    message: 'We are expanding our agency and looking for a custom client portal and asset manager. Needed within 8 weeks.',
    source: 'website',
    status: 'new',
    value: 12500,
    daysAgo: 1
  },
  {
    name: 'Marcus Vance',
    email: 'marcus@nexustech.io',
    phone: '+1 (555) 876-5432',
    company: 'Nexus Technologies',
    serviceInterested: 'Web Development',
    message: 'Need a complete redesign and re-architecture of our marketing site with dynamic CMS integration.',
    source: 'referral',
    status: 'contacted',
    value: 8000,
    daysAgo: 4
  },
  {
    name: 'Elena Rostova',
    email: 'elena@luminancehealth.com',
    phone: '+1 (555) 345-6789',
    company: 'Luminance Health',
    serviceInterested: 'UI/UX Design',
    message: 'Looking for a senior product designer to revamp our patient intake mobile and web dashboards.',
    source: 'linkedin',
    status: 'contacted',
    value: 6500,
    daysAgo: 6
  },
  {
    name: 'David Chen',
    email: 'd.chen@novacapital.com',
    phone: '+1 (555) 901-2345',
    company: 'Nova Capital Partners',
    serviceInterested: 'Full-Stack App',
    message: 'Require an enterprise dashboard for internal deal flow tracking and portfolio performance visualization.',
    source: 'referral',
    status: 'converted',
    value: 24000,
    daysAgo: 14
  },
  {
    name: 'Amara Okafor',
    email: 'amara@bloomorganics.store',
    phone: '+1 (555) 432-1098',
    company: 'Bloom Organics',
    serviceInterested: 'Web Development',
    message: 'Migrating from Shopify Basic to custom headless commerce with high-speed storefront.',
    source: 'google',
    status: 'converted',
    value: 11000,
    daysAgo: 18
  },
  {
    name: 'Thomas Wright',
    email: 'twright@gridlinearch.com',
    phone: '+1 (555) 678-9012',
    company: 'Gridline Architecture',
    serviceInterested: 'Web Development',
    message: 'High-end minimalist portfolio showcase with 3D project walk-throughs and inquiry pipeline.',
    source: 'website',
    status: 'new',
    value: 9500,
    daysAgo: 2
  },
  {
    name: 'Priya Sharma',
    email: 'priya@zenithedtech.org',
    phone: '+1 (555) 789-0123',
    company: 'Zenith EdTech',
    serviceInterested: 'Full-Stack App',
    message: 'Online learning platform LMS feature set: video lessons, quizzes, and automated certificate generation.',
    source: 'cold-outreach',
    status: 'contacted',
    value: 18000,
    daysAgo: 8
  },
  {
    name: 'Jordan Miller',
    email: 'jmiller@hyperionlogistics.net',
    phone: '+1 (555) 210-9876',
    company: 'Hyperion Logistics',
    serviceInterested: 'Consulting',
    message: 'Evaluating tech stack migration from legacy monolithic architecture to Node.js microservices.',
    source: 'linkedin',
    status: 'converted',
    value: 15000,
    daysAgo: 22
  },
  {
    name: 'Hannah Abbott',
    email: 'hannah@solarpulse.energy',
    phone: '+1 (555) 543-2109',
    company: 'SolarPulse Energy',
    serviceInterested: 'SEO & Marketing',
    message: 'Commercial solar contractor wanting high-intent organic search funnel optimization.',
    source: 'google',
    status: 'lost',
    value: 4500,
    daysAgo: 12
  },
  {
    name: 'Carlos Mendez',
    email: 'carlos@saborlatinofood.com',
    phone: '+1 (555) 654-3210',
    company: 'Sabor Latino Hospitality',
    serviceInterested: 'Web Development',
    message: 'Multi-location restaurant group website with digital reservations and private event bookings.',
    source: 'website',
    status: 'new',
    value: 7000,
    daysAgo: 3
  }
];

export const seedDemoDatabase = async (adminUser) => {
  // Clear existing demo leads, notes, and followups
  await Promise.all([
    Lead.deleteMany({}),
    Note.deleteMany({}),
    FollowUp.deleteMany({})
  ]);

  const now = new Date();

  for (const item of sampleLeadsData) {
    const createdAt = new Date(now.getTime() - item.daysAgo * 24 * 60 * 60 * 1000);

    const lead = await Lead.create({
      name: item.name,
      email: item.email,
      phone: item.phone,
      company: item.company,
      serviceInterested: item.serviceInterested,
      message: item.message,
      source: item.source,
      status: item.status,
      value: item.value,
      createdAt,
      updatedAt: createdAt
    });

    // Add 1-2 realistic notes
    await Note.create({
      lead: lead._id,
      content: `Initial inquiry reviewed. Client expressed strong interest in ${item.serviceInterested}.`,
      createdBy: adminUser._id,
      createdAt: new Date(createdAt.getTime() + 3600000)
    });

    if (item.status === 'contacted' || item.status === 'converted') {
      await Note.create({
        lead: lead._id,
        content: `Discovery call conducted. Scope confirmed. Budget range ~$${item.value.toLocaleString()}.`,
        createdBy: adminUser._id,
        createdAt: new Date(createdAt.getTime() + 7200000)
      });
    }

    // Add follow-ups
    if (item.status === 'new' || item.status === 'contacted') {
      // Pending follow-up either due today, tomorrow, or overdue
      const offsetDays = item.daysAgo === 1 ? 0 : (item.daysAgo % 2 === 0 ? -1 : 2);
      const scheduledAt = new Date(now.getFullYear(), now.getMonth(), now.getDate() + offsetDays, 14, 0, 0);

      const followUp = await FollowUp.create({
        lead: lead._id,
        description: `Follow up via email regarding proposal feedback and project timeline.`,
        scheduledAt,
        status: 'pending',
        createdBy: adminUser._id,
        createdAt
      });

      lead.nextFollowUpAt = followUp.scheduledAt;
      await lead.save();
    } else if (item.status === 'converted') {
      await FollowUp.create({
        lead: lead._id,
        description: `Kickoff meeting & contract signing.`,
        scheduledAt: new Date(createdAt.getTime() + 86400000 * 3),
        status: 'completed',
        completedAt: new Date(createdAt.getTime() + 86400000 * 3),
        createdBy: adminUser._id,
        createdAt
      });
    }
  }

  return { message: 'Demo data seeded successfully with realistic leads, notes, and follow-ups.' };
};
