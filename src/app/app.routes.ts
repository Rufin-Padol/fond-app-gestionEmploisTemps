import { Routes } from '@angular/router';
import { ListeClasseComponent } from './protected/dashbord/classe/liste-classe/liste-classe.component';
import { NewClasseComponent } from './protected/dashbord/classe/new-classe/new-classe.component';
import { roleGuard } from '../../src/app/core/guards/role.guard';

export const routes: Routes = [
  {
    path: 'dashboard',
    loadComponent: () =>
      import('./protected/dashbord/dashbord.component').then(
        (m) => m.DashbordComponent
      ),
    children: [
      {
        path: '',
        pathMatch: 'full',
        redirectTo: 'main', 
         
      },
      {
        path: 'main',
        loadComponent: () =>
          import('./protected/dashbord/main/main.component').then(
            (m) => m.MainComponent
          ),
               canActivate: [roleGuard],
      data: { roles: ['ADMIN', 'USER', 'SUPER_ADMIN'] }
      },
      {
        path: 'emplois-du-temps',
        loadComponent: () =>
          import(
            './protected/dashbord/emplois-temps/emplois-temps.component'
          ).then((m) => m.EmploisTempsComponent),
                      canActivate: [roleGuard],
      data: { roles: ['ADMIN', 'USER' ] },
        children: [
          {
            path: '',
            loadComponent: () =>
              import(
                './protected/dashbord/emplois-temps/liste-emplois/liste-emplois.component'
              ).then((m) => m.ListeEmploisComponent),
          },
          {
            path: 'new-emploi-classe',
            loadComponent: () =>
              import(
                './protected/dashbord/emplois-temps/new-emplois-classe/new-emplois-classe.component'
              ).then((m) => m.NewEmploisClasseComponent),
          },
          {
            path: 'liste-emplois',
            loadComponent: () =>
              import(
                './protected/dashbord/emplois-temps/liste-emplois/liste-emplois.component'
              ).then((m) => m.ListeEmploisComponent),
          },
          {
            path:'viewEmploisTempSalle',
           loadComponent: () =>
              import(
                './protected/dashbord/emplois-temps/view-emplois-temps-salle/view-emplois-temps-salle.component'
              ).then((m) => m.ViewEmploisTempsSalleComponent),
          },
            {
            path:'viewEmploisTempEnseignant',
           loadComponent: () =>
              import(
                './protected/dashbord/emplois-temps/view-emplois-temps-ensignant/view-emplois-temps-ensignant.component'
              ).then((m) => m.ViewEmploisTempsEnsignantComponent),
          },
          // {
          //   path: 'new-emploi-enseignant',
          //   loadComponent: () =>
          //     import(
          //       './protected/dashbord/emplois-temps/new-emplois-enseignant/new-emplois-enseignant.component'
          //     ).then((m) => m.NewEmploisEnseignantComponent),
          // }
        ],
      },
      {
        path: 'classes',
        loadComponent: () =>
          import('./protected/dashbord/classe/classe.component').then(
            (m) => m.ClasseComponent
          ),
           data: { roles: ['ADMIN,USER '] },
               children:[
            {
              path: '',
              loadComponent: () =>
               import('./protected/dashbord/classe/liste-classe/liste-classe.component').then((m) =>
                  m.ListeClasseComponent
            ),
            },
            {
              path: 'liste-classes',
              loadComponent: () =>
               import('./protected/dashbord/classe/liste-classe/liste-classe.component').then((m) =>
                  m.ListeClasseComponent
            ),
            },
            {
              path: 'new-classe',
             loadComponent: () =>
               import('./protected/dashbord/classe/new-classe/new-classe.component').then((m) =>
                  m.NewClasseComponent
            ),
            }
          ]
      },
      {
        path: 'professeurs',
        loadComponent: () =>
          import('./protected/dashbord/professeur/professeur.component').then(
            (m) => m.ProfesseurComponent
          ),
                canActivate: [roleGuard],
      data: { roles: ['ADMIN', 'USER' ] },
          children:[
            {
              path: '',
               component :ListeClasseComponent
            
            },
            {
              path: 'liste-professeur',
              component :ListeClasseComponent
            },
            {
              path: 'new-professeur',
               component :NewClasseComponent
            }
          ]
      },
      {
        path: 'departements',
        loadComponent: () =>
          import('./protected/dashbord/departement/departement.component').then(
            (m) => m.DepartementComponent
          ),
                   canActivate: [roleGuard],
      data: { roles: ['ADMIN', 'USER' ] },
           children:[
            {
              path: '',
              loadComponent: () =>
               import('./protected/dashbord/departement/liste-departement/liste-departement.component').then((m) =>
                  m.ListeDepartementComponent
            ),
            },
            {
              path: 'new-departement',
              loadComponent: () =>
                import('./protected/dashbord/departement/new-departement/new-departement.component').then((m) =>
                  m.NewDepartementComponent
            ),
            },
            {
              path: 'liste-departement',
             loadComponent: () =>
               import('./protected/dashbord/departement/liste-departement/liste-departement.component').then((m) =>
                  m.ListeDepartementComponent
            ),
            }
          ]
      },
      {
        path: 'filliers',
        loadComponent: () =>
          import('./protected/dashbord/filliers/filliers.component').then(
            (m) => m.FilliersComponent
          ),
             children:[
            {
              path: '',
              loadComponent: () =>
               import('./protected/dashbord/filliers/liste-filliers/liste-filliers.component').then((m) =>
                  m.ListeFilliersComponent
            ),
            },
            {
              path: 'liste-filliers',
             loadComponent: () =>
               import('./protected/dashbord/filliers/liste-filliers/liste-filliers.component').then((m) =>
                  m.ListeFilliersComponent
            ),
            },
            {
              path: 'new-filliers',
             loadComponent: () =>
               import('./protected/dashbord/filliers/new-filliers/new-filliers.component').then((m) =>
                  m.NewFilliersComponent
            ),
            }
          ]
      },
      {
        path: 'salles',
        loadComponent: () =>
          import('./protected/dashbord/classe/classe.component').then(
            (m) => m.ClasseComponent
          ),
          canActivate: [roleGuard],
      data: { roles: ['ADMIN', 'USER'  ] },
      },

      
      {
        path: 'parametres',
        loadComponent: () =>
          import('./protected/dashbord/paramettre/paramettre.component').then(
            (m) => m.ParamettreComponent
          ),                 canActivate: [roleGuard],
      data: { roles: ['ADMIN', 'USER' ] },
            children:[
            {
              path: '',
              loadComponent: () =>
               import('./protected/dashbord/paramettre/profil/profil.component').then((m) =>
                  m.ProfilComponent
            ),
            },
            {
              path: 'profil',
             loadComponent: () =>
               import('./protected/dashbord/paramettre/profil/profil.component').then((m) =>
                  m.ProfilComponent
            ),
            },
            {
              path: 'configuration',
             loadComponent: () =>
               import('./protected/dashbord/paramettre/configuration/configuration.component').then((m) =>
                  m.ConfigurationComponent
            ),
            }
          ]
      },
    ],
  },

  

  {
    path: 'home',
    loadComponent: () =>
      import('./public/home/home.component').then((m) => m.HomeComponent),
  },
  {
    path: 'login',
    loadComponent: () =>
      import('./public/login/login.component').then((m) => m.LoginComponent),
  },
  { path: '', redirectTo: 'home', pathMatch: 'full' },
  // Ajoutez d'autres routes ici
  // Page 404
 {
  path: 'unauthorized',
  loadComponent: () =>
    import('./public/unauthorized/unauthorized.component').then(m => m.UnauthorizedComponent),
},
{
  path: '**',
  loadComponent: () =>
    import('./public/unauthorized/unauthorized.component').then(m => m.UnauthorizedComponent),
},
];
