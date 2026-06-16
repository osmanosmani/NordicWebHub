# Project Overview

NordicWebHub is a full-stack client portal for a digital agency that offers website, SEO, hosting, maintenance, support, and service ordering workflows for small and medium-sized businesses.

The project is built as a decoupled application:

- React, TypeScript, Vite, and Tailwind CSS frontend
- ASP.NET Core Web API backend
- Entity Framework Core with SQL Server
- ASP.NET Core Identity with Admin and Customer roles

The application is designed as a realistic B2B SaaS-style portal where an agency can manage customer companies, service packages, project requests, active projects, tickets, maintenance logs, SEO reports, website health checks, service orders, and an AI-style recommendation assistant.

## Problem Statement

Small businesses often communicate with digital agencies through scattered email threads, documents, support messages, and informal updates. This makes it harder to understand project progress, service status, maintenance history, and support priorities.

NordicWebHub centralizes this workflow into one portal:

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

NordicWebHub is a demo-ready MVP. It is suitable for school presentation, portfolio documentation, and private GitHub review. It is not production-ready without additional hardening, deployment configuration, monitoring, and real payment integration.
