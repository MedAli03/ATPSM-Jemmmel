# Espace Éducateur – API recap & contract

This note builds on `docs/api-audit.md` conventions (`/api` prefix, JWT auth per-route, `requireRole` for RBAC) and focuses on educator-facing flows.

## Routes détectées (état actuel)
| Method | Path | Controller | Service | Description | Notes |
| --- | --- | --- | --- | --- | --- |
| GET | /api/pei/:peiId/activites | activite.controller.listByPei | activite.service.listByPei | Liste les activités d’un PEI avec pagination. | Auth+roles via `requireRole` (EDUCATEUR autorisé). 【F:server/routes/activites.routes.js†L14-L33】 |
| POST | /api/pei/:peiId/activites | activite.controller.create | activite.service.create | Crée une activité rattachée à un PEI. | Edu/Dir/Pres. 【F:server/routes/activites.routes.js†L35-L46】 |
| PUT | /api/activites/:id | activite.controller.update | activite.service.update | Met à jour une activité. | Edu/Dir/Pres. 【F:server/routes/activites.routes.js†L47-L55】 |
| GET | /api/pei/:peiId/daily-notes | dailynote.controller.listByPei | dailynote.service.listByPei | Liste des notes quotidiennes pour un PEI. | Edu/Dir/Pres. 【F:server/routes/dailynotes.routes.js†L14-L31】 |
| POST | /api/pei/:peiId/daily-notes | dailynote.controller.create | dailynote.service.create | Ajoute une note quotidienne. | Edu/Dir/Pres. 【F:server/routes/dailynotes.routes.js†L39-L47】 |
| PUT | /api/daily-notes/:id | dailynote.controller.update | dailynote.service.update | Met à jour une note quotidienne. | Edu/Dir/Pres. 【F:server/routes/dailynotes.routes.js†L48-L56】 |
| GET | /api/pei/:peiId/evaluations | evaluation.controller.listByPei | evaluation.service.listByPei | Liste des évaluations d’un PEI. | Edu/Dir/Pres. 【F:server/routes/evaluations.routes.js†L12-L27】 |
| POST | /api/pei/:peiId/evaluations | evaluation.controller.create | evaluation.service.create | Crée une évaluation. | Edu/Dir/Pres. 【F:server/routes/evaluations.routes.js†L34-L42】 |
| GET | /api/observation | observation_initiale.controller.list | observation_initiale.service.list | Recherche/pagination des observations initiales. | Edu/Dir/Pres. 【F:server/routes/observation_initiale.routes.js†L22-L31】 |
| POST | /api/observation | observation_initiale.controller.create | observation_initiale.service.create | Crée une observation initiale. | Edu/Dir/Pres. 【F:server/routes/observation_initiale.routes.js†L40-L48】 |
| GET | /api/pei | pei.controller.list | pei.service.list | Liste / filtre de PEI. | Edu/Dir/Pres. 【F:server/routes/pei.routes.js†L24-L35】 |
| POST | /api/pei | pei.controller.create | pei.service.create | Crée un PEI (educateur auto-renseigné). | Edu/Dir/Pres. 【F:server/routes/pei.routes.js†L48-L60】 |
| PUT | /api/pei/:id | pei.controller.update | pei.service.update | Mise à jour d’un PEI. | Edu/Dir/Pres. 【F:server/routes/pei.routes.js†L71-L80】 |
| GET | /api/enfants | enfants.controller.list | enfant.service.list | Liste des enfants accessible aux rôles, filtrée pour l’éducateur via affectations actives. | Edu/Dir/Pres/Parent. 【F:server/routes/enfants.routes.js†L28-L41】 |
| GET | /api/enfants/:id | enfants.controller.get | enfant.service.get | Dossier enfant (contrôles d’accès parent/éducateur dans le service). | Edu/Dir/Pres/Parent. 【F:server/routes/enfants.routes.js†L43-L51】 |

## Contrat cible (proposé)
| Method | Path | Controller | Service | Models | Roles | Description |
| --- | --- | --- | --- | --- | --- | --- |
| GET | /api/educateurs/me/groupes | (nouveau) educateur.controller.listMyGroups | groupe.service.listByEducateur | AffectationsEducateur, Groupe, AnneeScolaire | EDUCATEUR | Liste des groupes de l’éducateur sur l’année active. |
| GET | /api/educateurs/me/enfants | educateur.controller.listMyChildren | educateur_access.service.listChildrenForEducateurCurrentYear | Enfant, InscriptionEnfant, Groupe, AffectationEducateur | EDUCATEUR | Liste des enfants scoppés aux groupes de l’éducateur (année active). |
| GET | /api/educateurs/enfants/:id | educateur.controller.getChild | enfant.service.get | Enfant (+ relations) | EDUCATEUR | Dossier enfant avec contrôle d’affectation. |
| POST | /api/educateurs/enfants/:id/observations-initiales | observation_initiale.controller.create | observation_initiale.service.create | ObservationInitiale | EDUCATEUR | Créer une observation pour un enfant autorisé. |
| GET | /api/educateurs/enfants/:id/observations-initiales | observation_initiale.controller.list | observation_initiale.service.list | ObservationInitiale | EDUCATEUR | Lister les observations d’un enfant de l’éducateur. |
| PUT | /api/educateurs/observations-initiales/:obsId | observation_initiale.controller.update | observation_initiale.service.update | ObservationInitiale | EDUCATEUR | Mettre à jour une observation appartenant aux enfants accessibles. |
| POST | /api/educateurs/enfants/:id/pei | pei.controller.create | pei.service.create | PEI | EDUCATEUR | Créer le PEI de l’enfant (année active, un seul actif). |
| GET | /api/educateurs/enfants/:id/pei-actif | pei.controller.list → filtre actif | pei.service.list | PEI | EDUCATEUR | Récupérer le PEI actif pour l’enfant. |
| PUT | /api/educateurs/pei/:peiId | pei.controller.update | pei.service.update | PEI | EDUCATEUR | Mettre à jour le PEI si l’enfant est accessible. |
| POST | /api/educateurs/pei/:peiId/activites | activite.controller.create | activite.service.create | ActiviteProjet | EDUCATEUR | Ajouter une activité liée au PEI. |
| GET | /api/educateurs/pei/:peiId/activites | activite.controller.listByPei | activite.service.listByPei | ActiviteProjet | EDUCATEUR | Lister les activités du PEI. |
| POST | /api/educateurs/enfants/:id/daily-notes | dailynote.controller.create | dailynote.service.create | DailyNote | EDUCATEUR | Ajouter une note quotidienne pour l’enfant/PEI actif. |
| GET | /api/educateurs/enfants/:id/daily-notes | dailynote.controller.listByPei (avec pei actif) | dailynote.service.listByPei | DailyNote | EDUCATEUR | Lister les notes quotidiennes du PEI actif de l’enfant. |
| POST | /api/educateurs/pei/:peiId/evaluations | evaluation.controller.create | evaluation.service.create | EvaluationProjet | EDUCATEUR | Créer une évaluation pour le PEI. |
| GET | /api/educateurs/pei/:peiId/evaluations | evaluation.controller.listByPei | evaluation.service.listByPei | EvaluationProjet | EDUCATEUR | Lister les évaluations du PEI. |

## Appels mobile existants (à réaligner)
| Screen / Hook | Method | Path | Notes |
| --- | --- | --- | --- |
| useMyGroups / `getMyGroups` | GET | /api/groupes?anneeId=<active> | Fonctionne mais n’est pas scoppé `/educateurs/me/groupes`; dépend du filtre d’affectation côté service. 【F:mobile/src/features/educateur/api.ts†L335-L374】 |
| useGroupChildren / `getChildrenByGroup` | GET | /api/groupes/:id/inscriptions | Attend les inscriptions filtrées par année; accès refusé si non affecté. 【F:mobile/src/features/educateur/api.ts†L376-L412】 |
| Child dossier / `getChildDetails` | GET | /api/enfants/:id | S’appuie sur le contrôle d’accès dans `enfant.service`. 【F:mobile/src/features/educateur/api.ts†L414-L439】 |
| PEI actif / `getActivePeiForChild` | GET | /api/pei?enfant_id=…&statut=VALIDE | Doit passer à `/educateurs/enfants/:id/pei-actif`. 【F:mobile/src/features/educateur/api.ts†L441-L486】 |
| Création PEI / `createPEI` | POST | /api/pei | L’éducateur est injecté côté route; devrait idéalement être sous `/educateurs/enfants/:id/pei`. 【F:mobile/src/features/educateur/api.ts†L506-L523】 |
| Activités / `addPEIActivity` | POST | /api/pei/:peiId/activites | À basculer vers `/educateurs/pei/:peiId/activites`. 【F:mobile/src/features/educateur/api.ts†L529-L538】 |
| Daily notes / `addDailyNote` | POST | /api/pei/:peiId/daily-notes | À basculer vers `/educateurs/enfants/:id/daily-notes`. 【F:mobile/src/features/educateur/api.ts†L540-L552】 |
| Observations / `createObservationInitiale` | POST | /api/observation | Devrait cibler `/educateurs/enfants/:id/observations-initiales`. 【F:mobile/src/features/educateur/api.ts†L612-L650】 |
| Evaluations / `getPeiEvaluations` | GET | /api/pei/:peiId/evaluations | À repositionner sous `/educateurs/pei/:peiId/evaluations`. 【F:mobile/src/features/educateur/api.ts†L554-L579】 |
| Historique enfant / `getChildHistory` | GET | /api/pei/:peiId/{activites|evaluations|daily-notes} | Devra suivre les nouvelles routes `/educateurs/…`. 【F:mobile/src/features/educateur/api.ts†L682-L724】 |

> Ce contrat cible impose `/api/educateurs/...` pour tous les flux mobile éducateur, en réutilisant le middleware JWT + `requireRole("EDUCATEUR")` et les contrôles d’affectation déjà présents dans `educateur_access.service`.
