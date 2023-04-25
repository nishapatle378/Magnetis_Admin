import { NgModule } from "@angular/core";
import { PreloadAllModules, RouterModule, Routes } from "@angular/router";
import { LayoutComponent } from "./layout/layout.component";

// auth guard
import { AuthGuard, LoginAuthGuard } from "./providers/auth/AuthGuard";

const routes: Routes = [
  {
    path: "login",
    // data: { title: "Home" },
    loadChildren: () =>
      import("./pages/authentication/login/login.module").then(
        (m) => m.LoginModule
      ),
    canActivate: [LoginAuthGuard],
  },
  {
    path: "reset-password/:token",
    // data: { title: "Reset Password" },
    loadChildren: () =>
      import(
        "./pages/authentication/forgot-password/forgot-password.module"
      ).then((m) => m.ForgotPasswordModule),
    canActivate: [LoginAuthGuard],
  },
  {
    path: "",
    component: LayoutComponent,
    // data: { title: "Dashboard" },
    canActivate: [AuthGuard],
    children: [
      {
        path: "",
        loadChildren: () =>
          import("./pages/dashboard/dashboard.module").then(
            (m) => m.DashboardModule
          ),
       
      },
    ],
    //pathMatch: 'full',
    // canActivate: [AuthGuard]
  },
  {
    path: "dashboard",
    // data: { title: "Dashboard" },
    component: LayoutComponent,
    canActivate: [AuthGuard],
    children: [
      {
        path: "",
        loadChildren: () =>
          import("./pages/dashboard/dashboard.module").then(
            (m) => m.DashboardModule
          ),
        
      },
    ],
    //pathMatch: 'full',
    // canActivate: [AuthGuard]
  },
  {
    path: "reports",
    // data: { title: "Reports" },
    component: LayoutComponent,
    canActivate: [AuthGuard],
    children: [
      {
        path: "",
        loadChildren: () =>
          import("./pages/reports/reports.module").then((m) => m.ReportsModule),
      },
    ],
  },
  {
    path: "historical-reports",
    // data: { title: "Historical Activity Report" },
    component: LayoutComponent,
    canActivate: [AuthGuard],
    children: [
      {
        path: "",
        loadChildren: () =>
          import(
            "./pages/historical-activity-report/historical-activity-report.module"
          ).then((m) => m.HistoricalActivityReportModule),
      },
    ],
  },
  {
    path: "planner",
    // data: { title: "Planner" },
    component: LayoutComponent,
    canActivate: [AuthGuard],
    children: [
      {
        path: "",
        loadChildren: () =>
          import("./pages/planner/planner.module").then((m) => m.PlannerModule),
      },
    ],
  },
  {
    path: "support-ctm",
    // data: { title: "Support CTM" },
    component: LayoutComponent,
    canActivate: [AuthGuard],
    children: [
      {
        path: "",
        loadChildren: () =>
          import("./pages/support-ctm/support-ctm.module").then(
            (m) => m.SupportCtmModule
          ),
      },
    ],
  },
  {
    path: "users",
    // data: { title: "Users" },
    component: LayoutComponent,
    canActivate: [AuthGuard],
    children: [
      {
        path: "",
        loadChildren: () =>
          import("./pages/users/users.module").then((m) => m.UsersModule),
      },
    ],
  },
  {
    path: "users-menu",
    // data: { title: "User Menu" },
    component: LayoutComponent,
    canActivate: [AuthGuard],
    children: [
      {
        path: "",
        loadChildren: () =>
          import("./pages/users-menu/users-menu.module").then(
            (m) => m.UsersMenuModule
          ),
      },
    ],
  },
  {
    path: "company",
    // data: { title: "Company" },
    component: LayoutComponent,
    canActivate: [AuthGuard],
    children: [
      {
        path: "",
        loadChildren: () =>
          import("./pages/company/company.module").then((m) => m.CompanyModule),
      },
    ],
  },
  {
    path: "vendor",
    // data: { title: "Vendor" },
    component: LayoutComponent,
    canActivate: [AuthGuard],
    children: [
      {
        path: "",
        loadChildren: () =>
          import("./pages/vendor/vendor.module").then((m) => m.VendorModule),
      },
    ],
  },
  {
    path: "support-logistics",

    // data: { title: "Support Logistics" },
    component: LayoutComponent,
    canActivate: [AuthGuard],
    children: [
      {
        path: "",
        loadChildren: () =>
          import("./pages/support-logistics/support-logistics.module").then(
            (m) => m.SupportLogisticsModule
          ),
      },
    ],
  },
  {
    path: "country",
    // data: { title: "Country" },
    component: LayoutComponent,
    canActivate: [AuthGuard],
    children: [
      {
        path: "",
        loadChildren: () =>
          import("./pages/country/country.module").then((m) => m.CountryModule),
      },
    ],
  },
  {
    path: "currency",
    // data: { title: "Currency" },
    component: LayoutComponent,
    canActivate: [AuthGuard],
    children: [
      {
        path: "",
        loadChildren: () =>
          import("./pages/currency/currency.module").then(
            (m) => m.CurrencyModule
          ),
      },
    ],
  },
  {
    path: "vessel",
    // data: { title: "Vessel" },
    component: LayoutComponent,
    canActivate: [AuthGuard],
    children: [
      {
        path: "",
        loadChildren: () =>
          import("./pages/vessel/vessel.module").then((m) => m.VesselModule),
      },
    ],
  },
  {
    path: "port",
    // data: { title: "Port" },
    component: LayoutComponent,
    canActivate: [AuthGuard],
    children: [
      {
        path: "",
        loadChildren: () =>
          import("./pages/port/port.module").then((m) => m.PortModule),
      },
    ],
  },
  {
    path: "followup",
    // data: { title: "Follow-Up" },
    component: LayoutComponent,
    canActivate: [AuthGuard],
    children: [
      {
        path: "",
        loadChildren: () =>
          import("./pages/follow-up/follow-up.module").then(
            (m) => m.FollowUpModule
          ),
      },
    ],
  },
  {
    path: "fda",
    // data: { title: "FDA" },
    component: LayoutComponent,
    canActivate: [AuthGuard],
    children: [
      {
        path: "",
        loadChildren: () =>
          import("./pages/fda/fda.module").then((m) => m.FdaModule),
      },
    ],
  },
  {
    path: "system-parameter",
    // data: { title: "System Parameters" },
    component: LayoutComponent,
    canActivate: [AuthGuard],
    children: [
      {
        path: "",
        loadChildren: () =>
          import("./pages/system-parameter/system-parameter.module").then(
            (m) => m.SystemParameterModule
          ),
      },
    ],
  },
  {
    path: "** ",
    redirectTo: "users/view/all",
  },
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, {
      initialNavigation: "enabled",
      preloadingStrategy: PreloadAllModules,
      scrollPositionRestoration: "enabled",
      anchorScrolling: "enabled",
      relativeLinkResolution: "legacy",
    }),
  ],
  exports: [RouterModule],
})
export class AppRoutingModule {}
