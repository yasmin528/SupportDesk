import { Activity, Ticket, TicketPriority, TicketStatus } from '../../models/ticket.model';
import { StoredUser } from './mock-db';

const DEMO_SALT = 'seed-supportdesk';
const DEMO_HASH = 'fbbd8cfb2b452f436f415d59bd08cc67dcf429b0a85590aacb19b280c8b41e13';

export function seedUsers(): StoredUser[] {
  return [
    { id: 'agent-1', name: 'Demo Agent', email: 'demo@supportdesk.dev', salt: DEMO_SALT, passwordHash: DEMO_HASH },
    { id: 'agent-2', name: 'Omar Haddad', email: 'omar@supportdesk.dev', salt: DEMO_SALT, passwordHash: DEMO_HASH },
    { id: 'agent-3', name: 'Lina Farouk', email: 'lina@supportdesk.dev', salt: DEMO_SALT, passwordHash: DEMO_HASH },
  ];
}

function hoursAgo(hours: number): string {
  return new Date(Date.now() - hours * 3_600_000).toISOString();
}

interface SeedTicket {
  title: string;
  description: string;
  status: TicketStatus;
  priority: TicketPriority;
  requesterName: string;
  requesterEmail: string;
  assigneeId: string | null;
  ageHours: number;
}

const SEED: SeedTicket[] = [
  {
    title: 'Cannot reset my password',
    description: 'The reset email never arrives. I have checked the spam folder and tried twice today.',
    status: 'open',
    priority: 'high',
    requesterName: 'Sara Mostafa',
    requesterEmail: 'sara@example.com',
    assigneeId: null,
    ageHours: 2,
  },
  {
    title: 'Invoice shows the wrong company name',
    description: 'Our March invoice lists our old company name. Please update it and resend the PDF.',
    status: 'in_progress',
    priority: 'medium',
    requesterName: 'Karim Adel',
    requesterEmail: 'karim@acme.io',
    assigneeId: 'agent-2',
    ageHours: 20,
  },
  {
    title: 'Dashboard loads very slowly',
    description: 'Since yesterday the reports dashboard takes more than 30 seconds to load for our whole team.',
    status: 'open',
    priority: 'high',
    requesterName: 'Nour Ibrahim',
    requesterEmail: 'nour@globex.com',
    assigneeId: 'agent-1',
    ageHours: 5,
  },
  {
    title: 'Export to CSV is missing columns',
    description: 'The exported CSV does not include the "Region" and "Owner" columns that we see in the table.',
    status: 'in_progress',
    priority: 'medium',
    requesterName: 'Sara Mostafa',
    requesterEmail: 'sara@example.com',
    assigneeId: 'agent-1',
    ageHours: 30,
  },
  {
    title: 'Request: dark mode',
    description: 'Several people on our team would love a dark theme for late shifts.',
    status: 'open',
    priority: 'low',
    requesterName: 'Youssef Nabil',
    requesterEmail: 'youssef@initech.com',
    assigneeId: null,
    ageHours: 48,
  },
  {
    title: 'Two-factor codes rejected',
    description: 'Authenticator codes are rejected every time. The phone clock is set automatically.',
    status: 'resolved',
    priority: 'high',
    requesterName: 'Karim Adel',
    requesterEmail: 'karim@acme.io',
    assigneeId: 'agent-3',
    ageHours: 70,
  },
  {
    title: 'Add a new user to our workspace',
    description: 'Please add mona@acme.io as an editor on the Acme workspace.',
    status: 'resolved',
    priority: 'low',
    requesterName: 'Karim Adel',
    requesterEmail: 'karim@acme.io',
    assigneeId: 'agent-2',
    ageHours: 96,
  },
  {
    title: 'Webhook deliveries failing',
    description: 'Our endpoint returns 200 but the webhook log shows timeouts for every delivery since Monday.',
    status: 'open',
    priority: 'medium',
    requesterName: 'Nour Ibrahim',
    requesterEmail: 'nour@globex.com',
    assigneeId: 'agent-3',
    ageHours: 10,
  },
  {
    title: 'Typo on the pricing page',
    description: 'The word "monthly" is misspelled in the Business plan description.',
    status: 'resolved',
    priority: 'low',
    requesterName: 'Youssef Nabil',
    requesterEmail: 'youssef@initech.com',
    assigneeId: 'agent-1',
    ageHours: 120,
  },
  {
    title: 'Mobile app crashes on launch',
    description: 'After updating to the latest version the Android app closes immediately on a Pixel 7.',
    status: 'in_progress',
    priority: 'high',
    requesterName: 'Hana Samir',
    requesterEmail: 'hana@umbrella.co',
    assigneeId: 'agent-3',
    ageHours: 8,
  },
  {
    title: 'Change billing email',
    description: 'Please send future invoices to finance@umbrella.co instead of my personal address.',
    status: 'open',
    priority: 'low',
    requesterName: 'Hana Samir',
    requesterEmail: 'hana@umbrella.co',
    assigneeId: null,
    ageHours: 26,
  },
  {
    title: 'API rate limit too strict',
    description: 'We hit the rate limit during our nightly sync. Can the limit be raised for our account?',
    status: 'open',
    priority: 'medium',
    requesterName: 'Nour Ibrahim',
    requesterEmail: 'nour@globex.com',
    assigneeId: null,
    ageHours: 14,
  },
];

const AGENT_NAMES: Record<string, string> = {
  'agent-1': 'Demo Agent',
  'agent-2': 'Omar Haddad',
  'agent-3': 'Lina Farouk',
};

const STATUS_LABELS: Record<TicketStatus, string> = {
  open: 'Open',
  in_progress: 'In progress',
  resolved: 'Resolved',
};

export function seedTickets(): Ticket[] {
  return SEED.map((seed, index) => {
    const { ageHours, ...rest } = seed;
    const createdAt = hoursAgo(ageHours);
    return {
      ...rest,
      id: `SD-${1001 + index}`,
      createdBy: 'agent-1',
      createdAt,
      updatedAt: seed.status === 'open' ? createdAt : hoursAgo(Math.max(ageHours - 1, 0.5)),
    };
  });
}

export function seedActivity(): Activity[] {
  const activity: Activity[] = [];
  SEED.forEach((seed, index) => {
    const ticketId = `SD-${1001 + index}`;
    activity.push({
      id: `act-${ticketId}-created`,
      ticketId,
      ticketTitle: seed.title,
      type: 'created',
      message: 'opened the ticket',
      actorName: seed.requesterName,
      createdAt: hoursAgo(seed.ageHours),
    });
    if (seed.status !== 'open' && seed.assigneeId) {
      activity.push({
        id: `act-${ticketId}-status`,
        ticketId,
        ticketTitle: seed.title,
        type: 'status',
        message: `changed status from Open to ${STATUS_LABELS[seed.status]}`,
        actorName: AGENT_NAMES[seed.assigneeId],
        createdAt: hoursAgo(Math.max(seed.ageHours - 1, 0.5)),
      });
    }
  });
  return activity;
}
