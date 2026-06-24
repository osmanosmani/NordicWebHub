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
    'footer.webDevelopment': 'Web Development',
    'footer.seo': 'SEO',
    'footer.hostingMaintenance': 'Hosting & Maintenance',
    'footer.supportTickets': 'Support Tickets',
    'footer.demoNote': 'Portfolio demo with fictional Swedish business data.',

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

    'home.badge': 'Client portal for digital services and delivery',
    'home.title': 'Digital service delivery, organized in one client portal.',
    'home.subtitle':
      'NordicWebHub gives Swedish companies and digital service teams a secure workspace to choose services, send requests, track projects, manage support, follow service orders, review reports, and use AI-assisted recommendations.',
    'home.viewPackages': 'View Packages',
    'home.builtFor': 'Built for Swedish companies and service teams',
    'home.roles': 'Admin and Customer roles',
    'home.secure': 'Secure client access',
    'home.workflowEyebrow': 'Portal workflow',
    'home.workflowTitle': 'A clearer workflow from first request to long-term support.',
    'home.workflowText':
      'From package selection to project delivery, service orders, support, and reporting, NordicWebHub keeps customers and agency teams aligned around the same source of truth.',
    'home.problemEyebrow': 'Problem / Solution',
    'home.problemTitle':
      'Replace scattered communication with a clear digital service workflow.',
    'home.problemText':
      'NordicWebHub turns client delivery into a structured portal where every request, project, ticket, order, report, and recommendation has a clear place.',
    'home.servicesEyebrow': 'Services',
    'home.servicesTitle':
      'Practical digital services connected to real delivery workflows.',
    'home.servicesText':
      'Each service is designed as a clear starting point that can become a request, project, ticket, service order, report, or support flow.',
    'home.howEyebrow': 'How it works',
    'home.howTitle':
      'From service choice to support, every step stays visible.',
    'home.howText':
      'The workflow is simple to understand, but realistic enough to show how a digital agency can manage client delivery with structure and visibility.',
    'home.platformEyebrow': 'Platform preview',
    'home.platformTitle': 'Two portal roles, one connected delivery system.',
    'home.platformText':
      'NordicWebHub connects the public package flow with a working Admin and Customer portal for requests, projects, support, reports, and service orders.',
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
    'auth.loginFailed': 'Login failed. Please try again.',
    'auth.signingIn': 'Signing in',
    'auth.newCustomer': 'New customer?',
    'auth.registerTitle': 'Register',
    'auth.registerDescription':
      'Create a customer account for the NordicWebHub portal.',
    'auth.registrationFailed': 'Registration failed. Please try again.',
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
    'footer.webDevelopment': 'Webbutveckling',
    'footer.seo': 'SEO',
    'footer.hostingMaintenance': 'Hosting och underhåll',
    'footer.supportTickets': 'Supportärenden',
    'footer.demoNote': 'Portfoliodemo med fiktiv svensk företagsdata.',

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

    'home.badge': 'Kundportal för digitala tjänster och leverans',
    'home.title': 'Digital tjänsteleverans, samlad i en kundportal.',
    'home.subtitle':
      'NordicWebHub ger svenska företag och digitala serviceteam en säker arbetsyta för att välja tjänster, skicka förfrågningar, följa projekt, hantera support, se tjänsteordrar, granska rapporter och använda AI-stödda rekommendationer.',
    'home.viewPackages': 'Visa paket',
    'home.builtFor': 'Byggt för svenska företag och serviceteam',
    'home.roles': 'Admin- och kundroller',
    'home.secure': 'Säker kundåtkomst',
    'home.workflowEyebrow': 'Portalflöde',
    'home.workflowTitle': 'Ett tydligare flöde från första förfrågan till långsiktig support.',
    'home.workflowText':
      'Från paketval till projektleverans, tjänsteordrar, support och rapportering hjälper NordicWebHub kunder och byråteam att arbeta utifrån samma tydliga information.',
    'home.problemEyebrow': 'Problem / Lösning',
    'home.problemTitle':
      'Ersätt spridd kommunikation med ett tydligt digitalt serviceflöde.',
    'home.problemText':
      'NordicWebHub gör kundleveransen mer strukturerad genom en portal där varje förfrågan, projekt, ärende, order, rapport och rekommendation har sin plats.',
    'home.servicesEyebrow': 'Tjänster',
    'home.servicesTitle':
      'Praktiska digitala tjänster kopplade till verkliga leveransflöden.',
    'home.servicesText':
      'Varje tjänst är en tydlig startpunkt som kan bli en förfrågan, ett projekt, ett ärende, en tjänsteorder, en rapport eller ett supportflöde.',
    'home.howEyebrow': 'Så fungerar det',
    'home.howTitle': 'Från tjänsteval till support, varje steg är synligt.',
    'home.howText':
      'Flödet är enkelt att förstå men realistiskt nog för att visa hur en digital byrå kan hantera kundleverans med struktur och överblick.',
    'home.platformEyebrow': 'Plattformsöversikt',
    'home.platformTitle': 'Två portalroller, ett sammanhängande leveranssystem.',
    'home.platformText':
      'NordicWebHub kopplar ihop paketflödet med en fungerande admin- och kundportal för förfrågningar, projekt, support, rapporter och tjänsteordrar.',
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
    'auth.loginFailed': 'Inloggningen misslyckades. Försök igen.',
    'auth.signingIn': 'Loggar in',
    'auth.newCustomer': 'Ny kund?',
    'auth.registerTitle': 'Registrera',
    'auth.registerDescription':
      'Skapa ett kundkonto för NordicWebHub-portalen.',
    'auth.registrationFailed': 'Registreringen misslyckades. Försök igen.',
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
