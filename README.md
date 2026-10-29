# SupportDesk — Support Ticket Management Application

SupportDesk is a support ticket management application built with Angular and RxJS. Agents can manage support tickets, update ticket statuses and priorities, assign tickets, communicate through comments, and track changes through an activity timeline.

## Technologies

- Angular 22
- TypeScript
- RxJS 7
- Angular Router
- Reactive Forms
- HttpClient
- Vitest

## Features

- User registration, login, and logout.
- Protected dashboard routes using authentication guards.
- Overview dashboard with ticket statistics and priority breakdown.
- Ticket list with search and status and priority filters.
- Create, edit, and delete tickets.
- Update ticket status, priority, and assignee.
- View ticket details and related tickets from the same requester.
- Add comments to tickets.
- Activity timeline to track ticket changes.
- Automatic dashboard refresh every 30 seconds.
- Loading states, error handling, retry functionality, and notifications.

## Getting Started

Install dependencies:

```bash
npm install
```

Start the application:

```bash
npm start
```

Open `http://localhost:4200`.

**Demo Accounts**

All accounts use the password `Demo1234`.

| Agent | Email |
|---|---|
| Demo Agent | `demo@supportdesk.dev` |
| Omar Haddad | `omar@supportdesk.dev` |
| Lina Farouk | `lina@supportdesk.dev` |

**Available Commands**

```bash
npm run build
npm test
```

## Project Structure

```text
src/app/
├── core/
│   ├── auth/
│   ├── notifications/
│   └── mock/
├── shared/
│   ├── components/
│   ├── utils/
│   └── validators/
├── features/
│   ├── auth/
│   └── dashboard/
│       ├── dashboard-layout/
│       ├── overview/
│       └── tickets/
│           ├── components/
│           ├── ticket-list/
│           ├── ticket-detail/
│           ├── ticket-form/
│           ├── ticket-api.service.ts
│           └── ticket.service.ts
├── models/
├── app.config.ts
└── app.routes.ts
```

## Mock API

The application uses a mock API to simulate backend functionality. No external backend is required.

## Future Improvements

- Integrate a real backend API.
- Implement role-based access control for agents and administrators.
- Replace polling with WebSockets or server-sent events.
- Expand automated test coverage.
