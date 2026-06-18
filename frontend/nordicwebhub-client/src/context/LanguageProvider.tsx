import { useEffect, useMemo, useState, type ReactNode } from 'react'
import {
  LanguageContext,
  type Language,
} from './languageContext'

const storageKey = 'nordicwebhub-language'

const translations: Record<Language, Record<string, string>> = {
  en: {
    'common.account': 'Account',
    'common.admin': 'Admin',
    'common.adminPortal': 'Admin portal',
    'common.allClear': 'All clear',
    'common.cancelled': 'Cancelled',
    'common.closed': 'Closed',
    'common.completed': 'Completed',
    'common.createAccount': 'Create account',
    'common.customer': 'Customer',
    'common.customerPortal': 'Customer portal',
    'common.dashboard': 'Dashboard',
    'common.email': 'Email',
    'common.goHome': 'Go home',
    'common.inProgress': 'In progress',
    'common.loading': 'Loading',
    'common.logIn': 'Log in',
    'common.logOut': 'Log out',
    'common.manage': 'Manage',
    'common.new': 'New',
    'common.open': 'Open',
    'common.openPortal': 'Open portal',
    'common.password': 'Password',
    'common.pending': 'Pending',
    'common.register': 'Register',
    'common.retry': 'Retry',
    'common.secureWorkspace': 'Secure client workspace',
    'common.signIn': 'Sign in',
    'common.tryAgain': 'Try again',
    'common.viewAll': 'View all',
    'common.warning': 'Warning',

    'nav.home': 'Home',
    'nav.services': 'Services',
    'nav.howItWorks': 'How it works',
    'nav.platform': 'Platform',
    'nav.pricing': 'Pricing',
    'nav.navigation': 'Navigation',
    'nav.clientPortal': 'Client portal',
    'nav.portalLogin': 'Portal login',

    'portal.overview': 'Overview',
    'portal.clientWork': 'Client work',
    'portal.company': 'Company',
    'portal.myWork': 'My work',
    'portal.support': 'Support',
    'portal.insights': 'Insights',
    'portal.companies': 'Companies',
    'portal.packages': 'Packages',
    'portal.serviceOrders': 'Service Orders',
    'portal.projectRequests': 'Project Requests',
    'portal.projects': 'Projects',
    'portal.tickets': 'Tickets',
    'portal.maintenanceLogs': 'Maintenance Logs',
    'portal.seoReports': 'SEO Reports',
    'portal.websiteCheck': 'Website Check',
    'portal.myCompany': 'My Company',
    'portal.myRequests': 'My Requests',
    'portal.myProjects': 'My Projects',
    'portal.supportTickets': 'Support Tickets',
    'portal.hostingStatus': 'Hosting Status',
    'portal.aiAssistant': 'AI Service Assistant',

    'home.badge': 'Built for digital services, delivery and support',
    'home.title': 'One portal for websites, SEO, hosting and support.',
    'home.subtitle':
      'NordicWebHub helps Swedish small businesses choose packages, submit requests, track projects, manage support tickets, follow service orders, and get AI-assisted recommendations in one organized workspace.',
    'home.viewPackages': 'View Packages',
    'home.builtFor': 'Built for Swedish SMEs',
    'home.roles': 'Admin and Customer roles',
    'home.secure': 'Secure client access',
    'home.workflowEyebrow': 'Portal workflow',
    'home.workflowTitle': 'What the portal connects from day one.',
    'home.workflowText':
      'Instead of showing fake client logos, this section explains the real workflow NordicWebHub gives a new customer: package, request, delivery, support, and reporting in one place.',
    'home.problemEyebrow': 'Problem / Solution',
    'home.problemTitle':
      'No more messy emails, scattered updates or unclear service status.',
    'home.problemText':
      'NordicWebHub turns digital service delivery into a visible portal workflow where every request, project, ticket, order, and report has a place.',
    'home.servicesEyebrow': 'Services',
    'home.servicesTitle':
      'Practical digital services with a portal workflow behind them.',
    'home.servicesText':
      'Each service is designed as a clear starting point that can become a request, project, ticket, service order, report, or support flow.',
    'home.howEyebrow': 'How it works',
    'home.howTitle':
      'From service choice to support, every step stays visible.',
    'home.howText':
      'The workflow is simple enough for a school MVP, but realistic enough to show how a digital agency can organize client delivery.',
    'home.platformEyebrow': 'Platform preview',
    'home.platformTitle': 'Two portal roles, one connected delivery system.',
    'home.platformText':
      'NordicWebHub is not only a marketing page. It connects the public package flow with a working Admin and Customer portal.',
    'home.explorePortal': 'Explore the portal',
    'home.finalEyebrow': 'Ready to explore the portal?',
    'home.finalTitle':
      'Bring your next digital project into one organized portal.',
    'home.finalText':
      'Create an account or compare packages to see how requests, delivery, service orders, support, reports, and AI assistance can stay connected.',

    'pricing.badge': 'Service packages for a clearer digital workflow',
    'pricing.title':
      'Practical digital services, connected to one client portal',
    'pricing.subtitle':
      'Choose a starting package, send requests from the portal, and keep delivery, support, reports, and service orders organized from day one.',
    'pricing.compare': 'Compare packages',
    'pricing.packages': 'Packages',
    'pricing.choose': 'Choose a service that fits your next step',
    'pricing.monthlyPrice': 'Monthly price',
    'pricing.setupFee': 'Setup fee',
    'pricing.deliveryTime': 'Delivery time',
    'pricing.perMonth': 'per month',
    'pricing.recommended': 'Recommended',
    'pricing.requestPackage': 'Request this package',
    'pricing.questionsTitle': 'Questions before choosing a package',
    'pricing.ctaTitle':
      'Compare services, create an account, and keep the whole workflow in one place.',
    'pricing.seePlatform': 'See platform',

    'auth.loginTitle': 'Log in',
    'auth.loginDescription': 'Access your NordicWebHub client portal account.',
    'auth.signingIn': 'Signing in',
    'auth.newCustomer': 'New customer?',
    'auth.registerTitle': 'Register',
    'auth.registerDescription':
      'Create a customer account for the NordicWebHub portal.',
    'auth.firstName': 'First name',
    'auth.lastName': 'Last name',
    'auth.creatingAccount': 'Creating account',
    'auth.alreadyRegistered': 'Already registered?',
    'auth.accessDenied': 'Access denied',
    'auth.noAccess': 'You cannot access this page.',
    'auth.noAccessText':
      'Your current account does not have permission for that area.',

    'dashboard.adminDescription':
      'Monitor customer activity, delivery work, incoming requests, and support.',
    'dashboard.customerDescription':
      'Review your company, active work, requests, and support in one place.',
    'dashboard.quickActions': 'Quick actions',
    'dashboard.adminQuickText':
      'Manage the most common agency tasks from one workspace.',
    'dashboard.customerQuickText':
      'Start a request, contact support, or review your active workspace.',
    'dashboard.addPackage': 'Add Package',
    'dashboard.viewTickets': 'View Tickets',
    'dashboard.viewRequests': 'View Requests',
    'dashboard.runWebsiteCheck': 'Run Website Check',
    'dashboard.createRequest': 'Create Request',
    'dashboard.openTicket': 'Open Ticket',
    'dashboard.viewProjects': 'View Projects',
    'dashboard.businessOverview': 'Business overview',
    'dashboard.businessOverviewText':
      'Current client activity and delivery workload.',
    'dashboard.workspaceOverview': 'Workspace overview',
    'dashboard.workspaceOverviewText':
      'Current activity, delivery work, and support connected to your company.',
    'dashboard.customers': 'Customers',
    'dashboard.companies': 'Companies',
    'dashboard.pendingRequests': 'Pending Requests',
    'dashboard.activeProjects': 'Active Projects',
    'dashboard.openTickets': 'Open Tickets',
    'dashboard.recentRequests': 'Recent requests',
    'dashboard.recentProjectRequests': 'Recent project requests',
    'dashboard.recentTickets': 'Recent support tickets',
    'dashboard.recentProjects': 'Recent projects',
    'dashboard.companyOverview': 'Company overview',
    'dashboard.activeProjectProgress': 'Active project progress',
    'dashboard.latestMaintenance': 'Latest maintenance activity',
    'dashboard.latestSeo': 'Latest SEO report',
    'dashboard.liveData': 'Live portal data',
    'dashboard.loadingOverview': 'Loading dashboard overview',
    'dashboard.loadingWorkspace': 'Loading your workspace',
    'dashboard.seoReports': 'SEO Reports',
  },
  sv: {
    'common.account': 'Konto',
    'common.admin': 'Admin',
    'common.adminPortal': 'Adminportal',
    'common.allClear': 'Allt klart',
    'common.cancelled': 'Avbruten',
    'common.closed': 'Stängd',
    'common.completed': 'Slutförd',
    'common.createAccount': 'Skapa konto',
    'common.customer': 'Kund',
    'common.customerPortal': 'Kundportal',
    'common.dashboard': 'Översikt',
    'common.email': 'E-post',
    'common.goHome': 'Gå hem',
    'common.inProgress': 'Pågår',
    'common.loading': 'Laddar',
    'common.logIn': 'Logga in',
    'common.logOut': 'Logga ut',
    'common.manage': 'Hantera',
    'common.new': 'Ny',
    'common.open': 'Öppen',
    'common.openPortal': 'Öppna portal',
    'common.password': 'Lösenord',
    'common.pending': 'Väntar',
    'common.register': 'Registrera',
    'common.retry': 'Försök igen',
    'common.secureWorkspace': 'Säker kundarbetsyta',
    'common.signIn': 'Logga in',
    'common.tryAgain': 'Försök igen',
    'common.viewAll': 'Visa alla',
    'common.warning': 'Varning',

    'nav.home': 'Hem',
    'nav.services': 'Tjänster',
    'nav.howItWorks': 'Så fungerar det',
    'nav.platform': 'Plattform',
    'nav.pricing': 'Priser',
    'nav.navigation': 'Navigation',
    'nav.clientPortal': 'Kundportal',
    'nav.portalLogin': 'Portalinloggning',

    'portal.overview': 'Översikt',
    'portal.clientWork': 'Kundarbete',
    'portal.company': 'Företag',
    'portal.myWork': 'Mitt arbete',
    'portal.support': 'Support',
    'portal.insights': 'Insikter',
    'portal.companies': 'Företag',
    'portal.packages': 'Paket',
    'portal.serviceOrders': 'Tjänsteordrar',
    'portal.projectRequests': 'Projektförfrågningar',
    'portal.projects': 'Projekt',
    'portal.tickets': 'Ärenden',
    'portal.maintenanceLogs': 'Underhållsloggar',
    'portal.seoReports': 'SEO-rapporter',
    'portal.websiteCheck': 'Webbplatskontroll',
    'portal.myCompany': 'Mitt företag',
    'portal.myRequests': 'Mina förfrågningar',
    'portal.myProjects': 'Mina projekt',
    'portal.supportTickets': 'Supportärenden',
    'portal.hostingStatus': 'Hostingstatus',
    'portal.aiAssistant': 'AI-tjänsteassistent',

    'home.badge': 'Byggt för digitala tjänster, leverans och support',
    'home.title': 'En portal för webbplatser, SEO, hosting och support.',
    'home.subtitle':
      'NordicWebHub hjälper svenska småföretag att välja paket, skicka förfrågningar, följa projekt, hantera supportärenden, se tjänsteordrar och få AI-stödda rekommendationer i en samlad arbetsyta.',
    'home.viewPackages': 'Visa paket',
    'home.builtFor': 'Byggt för svenska SME-bolag',
    'home.roles': 'Admin- och kundroller',
    'home.secure': 'Säker kundåtkomst',
    'home.workflowEyebrow': 'Portalflöde',
    'home.workflowTitle': 'Det portalen kopplar ihop från dag ett.',
    'home.workflowText':
      'I stället för att visa påhittade kundlogotyper visar detta avsnitt det verkliga arbetsflödet NordicWebHub ger en ny kund: paket, förfrågan, leverans, support och rapportering på ett ställe.',
    'home.problemEyebrow': 'Problem / Lösning',
    'home.problemTitle':
      'Slipp röriga mejltrådar, spridda uppdateringar och otydlig servicestatus.',
    'home.problemText':
      'NordicWebHub gör leveransen synlig i ett portalflöde där varje förfrågan, projekt, ärende, order och rapport har sin plats.',
    'home.servicesEyebrow': 'Tjänster',
    'home.servicesTitle':
      'Praktiska digitala tjänster med ett portalflöde bakom.',
    'home.servicesText':
      'Varje tjänst är en tydlig startpunkt som kan bli en förfrågan, ett projekt, ett ärende, en tjänsteorder, en rapport eller ett supportflöde.',
    'home.howEyebrow': 'Så fungerar det',
    'home.howTitle': 'Från tjänsteval till support, varje steg är synligt.',
    'home.howText':
      'Flödet är tillräckligt enkelt för ett skol-MVP men realistiskt nog för att visa hur en digital byrå kan organisera kundleverans.',
    'home.platformEyebrow': 'Plattformsöversikt',
    'home.platformTitle': 'Två portalroller, ett sammanhängande leveranssystem.',
    'home.platformText':
      'NordicWebHub är inte bara en marknadssida. Den kopplar ihop paketflödet med en fungerande admin- och kundportal.',
    'home.explorePortal': 'Utforska portalen',
    'home.finalEyebrow': 'Redo att utforska portalen?',
    'home.finalTitle': 'Samla nästa digitala projekt i en organiserad portal.',
    'home.finalText':
      'Skapa ett konto eller jämför paket för att se hur förfrågningar, leverans, tjänsteordrar, support, rapporter och AI-stöd kan hållas ihop.',

    'pricing.badge': 'Tjänstepaket för ett tydligare digitalt arbetsflöde',
    'pricing.title': 'Praktiska digitala tjänster kopplade till en kundportal',
    'pricing.subtitle':
      'Välj ett startpaket, skicka förfrågningar från portalen och håll leverans, support, rapporter och tjänsteordrar organiserade från dag ett.',
    'pricing.compare': 'Jämför paket',
    'pricing.packages': 'Paket',
    'pricing.choose': 'Välj en tjänst som passar nästa steg',
    'pricing.monthlyPrice': 'Månadspris',
    'pricing.setupFee': 'Startavgift',
    'pricing.deliveryTime': 'Leveranstid',
    'pricing.perMonth': 'per månad',
    'pricing.recommended': 'Rekommenderad',
    'pricing.requestPackage': 'Begär detta paket',
    'pricing.questionsTitle': 'Frågor innan du väljer paket',
    'pricing.ctaTitle':
      'Jämför tjänster, skapa ett konto och håll hela arbetsflödet på ett ställe.',
    'pricing.seePlatform': 'Se plattformen',

    'auth.loginTitle': 'Logga in',
    'auth.loginDescription': 'Öppna ditt NordicWebHub-kundkonto.',
    'auth.signingIn': 'Loggar in',
    'auth.newCustomer': 'Ny kund?',
    'auth.registerTitle': 'Registrera',
    'auth.registerDescription':
      'Skapa ett kundkonto för NordicWebHub-portalen.',
    'auth.firstName': 'Förnamn',
    'auth.lastName': 'Efternamn',
    'auth.creatingAccount': 'Skapar konto',
    'auth.alreadyRegistered': 'Redan registrerad?',
    'auth.accessDenied': 'Åtkomst nekad',
    'auth.noAccess': 'Du kan inte komma åt den här sidan.',
    'auth.noAccessText':
      'Ditt nuvarande konto har inte behörighet till detta område.',

    'dashboard.adminDescription':
      'Följ kundaktivitet, leveransarbete, inkommande förfrågningar och support.',
    'dashboard.customerDescription':
      'Se ditt företag, aktivt arbete, förfrågningar och support på ett ställe.',
    'dashboard.quickActions': 'Snabbåtgärder',
    'dashboard.adminQuickText':
      'Hantera de vanligaste byråuppgifterna från en arbetsyta.',
    'dashboard.customerQuickText':
      'Starta en förfrågan, kontakta support eller se din aktiva arbetsyta.',
    'dashboard.addPackage': 'Lägg till paket',
    'dashboard.viewTickets': 'Visa ärenden',
    'dashboard.viewRequests': 'Visa förfrågningar',
    'dashboard.runWebsiteCheck': 'Kör webbplatskontroll',
    'dashboard.createRequest': 'Skapa förfrågan',
    'dashboard.openTicket': 'Öppna ärende',
    'dashboard.viewProjects': 'Visa projekt',
    'dashboard.businessOverview': 'Affärsöversikt',
    'dashboard.businessOverviewText':
      'Aktuell kundaktivitet och leveransbelastning.',
    'dashboard.workspaceOverview': 'Arbetsyta',
    'dashboard.workspaceOverviewText':
      'Aktuell aktivitet, leverans och support kopplad till ditt företag.',
    'dashboard.customers': 'Kunder',
    'dashboard.companies': 'Företag',
    'dashboard.pendingRequests': 'Väntande förfrågningar',
    'dashboard.activeProjects': 'Aktiva projekt',
    'dashboard.openTickets': 'Öppna ärenden',
    'dashboard.recentRequests': 'Senaste förfrågningar',
    'dashboard.recentProjectRequests': 'Senaste projektförfrågningar',
    'dashboard.recentTickets': 'Senaste supportärenden',
    'dashboard.recentProjects': 'Senaste projekt',
    'dashboard.companyOverview': 'Företagsöversikt',
    'dashboard.activeProjectProgress': 'Projektstatus',
    'dashboard.latestMaintenance': 'Senaste underhållsaktivitet',
    'dashboard.latestSeo': 'Senaste SEO-rapport',
    'dashboard.liveData': 'Live portaldata',
    'dashboard.loadingOverview': 'Laddar översikt',
    'dashboard.loadingWorkspace': 'Laddar din arbetsyta',
    'dashboard.seoReports': 'SEO-rapporter',
  },
}

const statusTranslations: Record<Language, Record<string, string>> = {
  en: {
    Approved: 'Approved',
    Cancelled: 'Cancelled',
    Closed: 'Closed',
    Completed: 'Completed',
    Design: 'Design',
    Development: 'Development',
    High: 'High',
    InProgress: 'In progress',
    Live: 'Live',
    Low: 'Low',
    Medium: 'Medium',
    New: 'New',
    Offline: 'Offline',
    Online: 'Online',
    Open: 'Open',
    Paid: 'Paid',
    Pending: 'Pending',
    Planning: 'Planning',
    Rejected: 'Rejected',
    Review: 'Review',
    Reviewed: 'Reviewed',
    Urgent: 'Urgent',
    WaitingForCustomer: 'Waiting for customer',
    Warning: 'Warning',
  },
  sv: {
    Approved: 'Godkänd',
    Cancelled: 'Avbruten',
    Closed: 'Stängd',
    Completed: 'Slutförd',
    Design: 'Design',
    Development: 'Utveckling',
    High: 'Hög',
    InProgress: 'Pågår',
    Live: 'Live',
    Low: 'Låg',
    Medium: 'Medium',
    New: 'Ny',
    Offline: 'Offline',
    Online: 'Online',
    Open: 'Öppen',
    Paid: 'Betald',
    Pending: 'Väntar',
    Planning: 'Planering',
    Rejected: 'Avvisad',
    Review: 'Granskning',
    Reviewed: 'Granskad',
    Urgent: 'Akut',
    WaitingForCustomer: 'Väntar på kund',
    Warning: 'Varning',
  },
}

function getInitialLanguage(): Language {
  if (typeof window === 'undefined') {
    return 'en'
  }

  return window.localStorage.getItem(storageKey) === 'sv' ? 'sv' : 'en'
}

type LanguageProviderProps = {
  children: ReactNode
}

export function LanguageProvider({ children }: LanguageProviderProps) {
  const [language, setLanguageState] = useState<Language>(getInitialLanguage)

  useEffect(() => {
    document.documentElement.lang = language
  }, [language])

  const value = useMemo(
    () => ({
      language,
      setLanguage(nextLanguage: Language) {
        setLanguageState(nextLanguage)
        window.localStorage.setItem(storageKey, nextLanguage)
        document.documentElement.lang = nextLanguage
      },
      t(key: string) {
        return translations[language][key] ?? translations.en[key] ?? key
      },
      translateStatus(label: string) {
        return statusTranslations[language][label] ?? label
      },
    }),
    [language],
  )

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  )
}
