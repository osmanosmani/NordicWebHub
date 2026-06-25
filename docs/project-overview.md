# Project Overview

NordicWebHub is a full-stack B2B SaaS-style client portal for digital service delivery. It supports website projects, SEO work, hosting, maintenance, support, service ordering, reporting, and AI-assisted recommendations for companies, organizations, startups, freelancers, and digital service teams in Sweden.

The project is built as a decoupled application:

- React, TypeScript, Vite, and Tailwind CSS frontend
- ASP.NET Core Web API backend
- Entity Framework Core with SQL Server
- ASP.NET Core Identity with Admin and Customer roles

The application is designed as a realistic full-stack MVP where an agency can manage customer companies, service packages, project requests, active projects, tickets, maintenance logs, SEO reports, website health checks, service orders, and an AI-style service assistant from one connected workspace.

## Problem Statement

Digital service delivery often becomes fragmented across email threads, chats, documents, support messages, and informal updates. This makes it harder for customers and agency teams to understand project progress, service status, maintenance history, support priorities, and what has already been agreed.

NordicWebHub centralizes this workflow into one structured portal:

- Customers can request services, track projects, open support tickets, view SEO reports, and check hosting status.
- Admin users can manage companies, packages, requests, projects, tickets, logs, reports, service orders, and website checks.

## Target Users

## Admin Users

Admin users represent the agency team. They manage all customers and all operational data.

Typical Admin tasks:

- Manage service packages
- Manage customer companies
- Review project requests
- Create and update projects
- Reply to support tickets
- Add maintenance logs and SEO reports
- Run website health checks
- Manage service order and payment status

## Customer Users

Customer users represent business clients. The MVP uses a one Customer equals one Company rule.

Typical Customer tasks:

- View their company profile
- Browse service packages
- Create project requests
- Track project progress
- Create and reply to support tickets
- View maintenance logs and SEO reports
- View hosting status
- Create service orders
- Use the AI Service Assistant

## Project Status

NordicWebHub is a demo-ready MVP. It is suitable for technical review, portfolio documentation, and public GitHub presentation. It is not production-ready without additional hardening, monitoring, production secret management, and real payment integration.
