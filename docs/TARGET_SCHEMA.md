# TARGET_SCHEMA

This specification defines the authoritative relational model for the autism association platform. All constraints are designed to enforce the stated business rules: single group per child/year, single educator per group/year, single active PEI per child/year, unique initial observation per child/year, thread scoping to a child, per-user notifications, and confidentiality controls.

## Table catalog
1. `utilisateurs`
2. `enfants`
3. `fiche_enfant`
4. `parents_fiche`
5. `parents_enfants`
6. `annees_scolaires`
7. `groupes`
8. `groupes_annees`
9. `affectations_educateurs`
10. `inscriptions_enfants`
11. `observation_initiale`
12. `pei_versions`
13. `pei_objectifs`
14. `pei_activites`
15. `pei_evaluations`
16. `pei_history_log`
17. `daily_notes`
18. `threads`
19. `thread_participants`
20. `messages`
21. `message_read_receipts`
22. `attachments`
23. `message_attachments`
24. `notifications`
25. `documents`
26. `document_roles`
27. `document_groupes`
28. `document_enfants`

---

## Table specifications

### 1. `utilisateurs`
- **Columns**
  - `id` BIGINT UNSIGNED, auto-increment
  - `prenom` VARCHAR(120)
  - `nom` VARCHAR(120)
  - `email` VARCHAR(255) NOT NULL
  - `username` VARCHAR(80) NOT NULL
  - `mot_de_passe` VARCHAR(255) NOT NULL
  - `telephone` VARCHAR(40)
  - `role` ENUM('PRESIDENT','DIRECTEUR','EDUCATEUR','PARENT','VISITEUR') NOT NULL
  - `is_active` TINYINT(1) DEFAULT 1
  - `avatar_url` VARCHAR(500)
  - `adresse` VARCHAR(500)
  - `last_login` DATETIME
  - `created_at`, `updated_at` DATETIME NOT NULL
- **Primary key**: `id`
- **Foreign keys**: referenced by many tables (see respective sections)
- **UNIQUE**: `email`, `username`
- **Indexes**: `(role)`, `(is_active, role)`
- **ENUMs**: `role`

### 2. `enfants`
- **Columns**
  - `id` BIGINT UNSIGNED, auto-increment
  - `numero_dossier` VARCHAR(30) NOT NULL
  - `prenom`, `nom` VARCHAR(120) NOT NULL
  - `date_naissance` DATE NOT NULL
  - `genre` ENUM('F','M','AUTRE')
  - `statut` ENUM('ACTIF','INACTIF') DEFAULT 'ACTIF'
  - `date_inscription` DATE
  - `notes_confidentielles` TEXT
  - `created_by` BIGINT UNSIGNED NOT NULL (FK utilisateurs)
  - `created_at`, `updated_at`
- **PK**: `id`
- **FK**: `created_by` → `utilisateurs.id`
- **UNIQUE**: `numero_dossier`
- **Indexes**: `(statut)`, `(date_inscription)`, `(created_by)`
- **ENUMs**: `genre`, `statut`

### 3. `fiche_enfant`
- **Columns**: `enfant_id PK/FK`, medical/social dossier fields (TEXT/VARCHAR), `created_at`, `updated_at`
- **PK**: `enfant_id`
- **FK**: `enfant_id` → `enfants.id`
- **UNIQUE**: inherent via PK
- **Indexes**: none beyond PK

### 4. `parents_fiche`
- **Columns**: `enfant_id PK/FK`, guardian context fields (TEXT), `created_at`, `updated_at`
- **PK**: `enfant_id`
- **FK**: `enfant_id` → `enfants.id`
- **Indexes**: PK only

### 5. `parents_enfants`
- **Columns**
  - `parent_id` BIGINT UNSIGNED NOT NULL
  - `enfant_id` BIGINT UNSIGNED NOT NULL
  - `relation` ENUM('MERE','PERE','TUTEUR','AUTRE')
  - `is_guardian` TINYINT(1) DEFAULT 1
  - `created_at`, `updated_at`
- **PK**: (`parent_id`, `enfant_id`)
- **FK**: `parent_id` → `utilisateurs.id` (role=PARENT enforced at app/trigger); `enfant_id` → `enfants.id`
- **Indexes**: `(enfant_id)` for fast lookups
- **ENUMs**: `relation`

### 6. `annees_scolaires`
- **Columns**: `id` SMALLINT UNSIGNED PK, `label` VARCHAR(9) NOT NULL, `date_debut` DATE, `date_fin` DATE, `est_active` TINYINT(1), timestamps
- **UNIQUE**: `label`, `(date_debut, date_fin)`
- **Indexes**: `(est_active)`

### 7. `groupes`
- **Columns**: `id` BIGINT PK, `code` VARCHAR(20) NOT NULL, `nom` VARCHAR(150), `description` TEXT, `capacite` SMALLINT, timestamps
- **UNIQUE**: `code`
- **Indexes**: `(capacite)`

### 8. `groupes_annees`
- **Columns**
  - `id` BIGINT PK
  - `groupe_id` BIGINT NOT NULL
  - `annee_id` SMALLINT NOT NULL
  - `educateur_id` BIGINT NOT NULL
  - `statut` ENUM('OUVERT','FERME') DEFAULT 'OUVERT'
  - `effectif_max` SMALLINT
  - timestamps
- **FK**: `groupe_id` → `groupes.id`; `annee_id` → `annees_scolaires.id`; `educateur_id` → `utilisateurs.id`
- **UNIQUE**: `(groupe_id, annee_id)`
- **Indexes**: `(educateur_id, annee_id)`, `(annee_id, statut)`
- **Business rule**: Unique pair enforces single educator per group/year.

### 9. `affectations_educateurs`
- **Columns**: `id` BIGINT PK, `groupe_annee_id` BIGINT NOT NULL, `educateur_id` BIGINT NOT NULL, `date_debut` DATE, `date_fin` DATE, `is_active` TINYINT(1) DEFAULT 1, timestamps
- **FK**: `groupe_annee_id` → `groupes_annees.id`; `educateur_id` → `utilisateurs.id`
- **UNIQUE**: `(groupe_annee_id, is_active)` (only one active assignment), `(groupe_annee_id, educateur_id)`
- **Indexes**: `(educateur_id, is_active)`

### 10. `inscriptions_enfants`
- **Columns**: `id` BIGINT PK, `enfant_id` BIGINT NOT NULL, `groupe_annee_id` BIGINT NOT NULL, `annee_id` SMALLINT NOT NULL, `date_entree` DATE, `date_sortie` DATE, `statut` ENUM('ACTIVE','SUSPENDU','TERMINE') DEFAULT 'ACTIVE', timestamps
- **FK**: `enfant_id` → `enfants.id`; `groupe_annee_id` → `groupes_annees.id`; `annee_id` → `annees_scolaires.id`
- **UNIQUE**: `(enfant_id, annee_id)` filtered to statut='ACTIVE' (implemented via partial index or trigger)
- **Indexes**: `(groupe_annee_id, statut)`, `(enfant_id, statut)`
- **Business rule**: ensures one group per child per year.

### 11. `observation_initiale`
- **Columns**: `id` BIGINT PK, `enfant_id` BIGINT NOT NULL, `annee_id` SMALLINT NOT NULL, `educateur_id` BIGINT NOT NULL, `statut` ENUM('BROUILLON','SOUMISE','VALIDEE') DEFAULT 'BROUILLON', `date_observation` DATE, `contenu` JSON/TEXT, timestamps
- **FK**: `enfant_id` → `enfants.id`; `annee_id` → `annees_scolaires.id`; `educateur_id` → `utilisateurs.id`
- **UNIQUE**: `(enfant_id, annee_id)`
- **Indexes**: `(educateur_id, annee_id)`

### 12. `pei_versions`
- **Columns**: `id` BIGINT PK, `enfant_id` BIGINT NOT NULL, `annee_id` SMALLINT NOT NULL, `groupe_annee_id` BIGINT NULL, `observation_id` BIGINT NULL, `created_by` BIGINT NOT NULL, `version_number` INT NOT NULL, `status` ENUM('DRAFT','ACTIVE','ARCHIVE') NOT NULL, `effective_start` DATE, `effective_end` DATE, `motivation` TEXT, timestamps
- **FK**: `enfant_id` → `enfants.id`; `annee_id` → `annees_scolaires.id`; `groupe_annee_id` → `groupes_annees.id`; `observation_id` → `observation_initiale.id`; `created_by` → `utilisateurs.id`
- **UNIQUE**: `(enfant_id, annee_id, version_number)`; partial `(enfant_id, annee_id)` where status='ACTIVE' (enforces single active PEI)
- **Indexes**: `(status)`, `(enfant_id, status)`, `(annee_id, status)`

### 13. `pei_objectifs`
- **Columns**: `id` BIGINT PK, `pei_version_id` BIGINT NOT NULL, `titre` VARCHAR(255), `description` TEXT, `priorite` ENUM('BASSE','MOYENNE','ELEVEE'), `source` ENUM('EDUCATEUR','PARENT'), `ordre` INT, timestamps
- **FK**: `pei_version_id` → `pei_versions.id`
- **Indexes**: `(pei_version_id, ordre)`

### 14. `pei_activites`
- **Columns**: `id` BIGINT PK, `objectif_id` BIGINT NOT NULL, `titre` VARCHAR(255), `description` TEXT, `frequence` VARCHAR(120), `lieu` VARCHAR(120), `statut` ENUM('PLANIFIEE','EN_COURS','TERMINEE','ABANDONNEE'), timestamps
- **FK**: `objectif_id` → `pei_objectifs.id`
- **Indexes**: `(objectif_id, statut)`

### 15. `pei_evaluations`
- **Columns**: `id` BIGINT PK, `pei_version_id` BIGINT NOT NULL, `objectif_id` BIGINT NULL, `educateur_id` BIGINT NOT NULL, `evaluation_date` DATE NOT NULL, `cycle` ENUM('3M','6M','ANNUEL'), `score` TINYINT, `commentaires` TEXT, timestamps
- **FK**: `pei_version_id` → `pei_versions.id`; `objectif_id` → `pei_objectifs.id`; `educateur_id` → `utilisateurs.id`
- **Indexes**: `(pei_version_id, evaluation_date)`, `(educateur_id, evaluation_date)`

### 16. `pei_history_log`
- **Columns**: `id` BIGINT PK, `pei_version_id` BIGINT NOT NULL, `action` ENUM('CREATION','VALIDATION','REVISION','CLOTURE'), `performed_by` BIGINT NOT NULL, `details_json` JSON, `created_at` DATETIME
- **FK**: `pei_version_id` → `pei_versions.id`; `performed_by` → `utilisateurs.id`
- **Indexes**: `(pei_version_id)`

### 17. `daily_notes`
- **Columns**: `id` BIGINT PK, `enfant_id` BIGINT NOT NULL, `educateur_id` BIGINT NOT NULL, `pei_version_id` BIGINT NULL, `pei_objectif_id` BIGINT NULL, `note_date` DATE NOT NULL, `contenu` TEXT NOT NULL, `type` ENUM('OBSERVATION','INCIDENT','PROGRES'), `visibility` ENUM('INTERNE','PARTAGE_PARENT') DEFAULT 'INTERNE', timestamps
- **FK**: `enfant_id` → `enfants.id`; `educateur_id` → `utilisateurs.id`; `pei_version_id` → `pei_versions.id`; `pei_objectif_id` → `pei_objectifs.id`
- **UNIQUE**: `(enfant_id, note_date, educateur_id)` (optional, ensures single note per educator/day)
- **Indexes**: `(enfant_id, note_date)`, `(visibility)`

### 18. `threads`
- **Columns**: `id` BIGINT PK, `enfant_id` BIGINT NOT NULL, `created_by` BIGINT NOT NULL, `sujet` VARCHAR(255), `is_group` TINYINT(1) DEFAULT 0, `archived_at` DATETIME NULL, `last_message_id` BIGINT NULL, timestamps
- **FK**: `enfant_id` → `enfants.id`; `created_by` → `utilisateurs.id`; `last_message_id` → `messages.id`
- **Indexes**: `(enfant_id, archived_at)`, `(created_by)`
- **Business rule**: FK ensures every thread ties to a child.

### 19. `thread_participants`
- **Columns**: `id` BIGINT PK, `thread_id` BIGINT NOT NULL, `user_id` BIGINT NOT NULL, `role` ENUM('PARENT','EDUCATEUR','DIRECTEUR','PRESIDENT'), `joined_at` DATETIME, `left_at` DATETIME NULL
- **FK**: `thread_id` → `threads.id`; `user_id` → `utilisateurs.id`
- **UNIQUE**: `(thread_id, user_id)`
- **Indexes**: `(user_id)`
- **Business rule**: database trigger should assert each participant matches the child (parent via `parents_enfants`, staff via assignments).

### 20. `messages`
- **Columns**: `id` BIGINT PK, `thread_id` BIGINT NOT NULL, `sender_id` BIGINT NOT NULL, `contenu` TEXT NOT NULL, `kind` ENUM('TEXTE','MEDIA','SYSTEME') DEFAULT 'TEXTE', `metadata` JSON, `created_at`, `updated_at`
- **FK**: `thread_id` → `threads.id`; `sender_id` → `utilisateurs.id`
- **Indexes**: `(thread_id, created_at DESC)`

### 21. `message_read_receipts`
- **Columns**: `id` BIGINT PK, `message_id` BIGINT NOT NULL, `user_id` BIGINT NOT NULL, `read_at` DATETIME NOT NULL
- **FK**: `message_id` → `messages.id`; `user_id` → `utilisateurs.id`
- **UNIQUE**: `(message_id, user_id)`
- **Indexes**: `(user_id, read_at)`

### 22. `attachments`
- **Columns**: `id` BIGINT PK, `uploader_id` BIGINT NOT NULL, `filename` VARCHAR(255), `mime_type` VARCHAR(120), `url` VARCHAR(500), `size_bytes` BIGINT, `created_at`
- **FK**: `uploader_id` → `utilisateurs.id`
- **Indexes**: `(uploader_id)`

### 23. `message_attachments`
- **Columns**: `id` BIGINT PK, `message_id` BIGINT NOT NULL, `attachment_id` BIGINT NOT NULL
- **FK**: `message_id` → `messages.id`; `attachment_id` → `attachments.id`
- **UNIQUE**: `(message_id, attachment_id)`
- **Indexes**: `(attachment_id)`

### 24. `notifications`
- **Columns**: `id` BIGINT PK, `utilisateur_id` BIGINT NOT NULL, `type` VARCHAR(80) NOT NULL, `titre` VARCHAR(255), `corps` TEXT, `payload` JSON, `source_type` VARCHAR(80), `source_id` BIGINT, `icon` VARCHAR(120), `action_url` VARCHAR(500), `lu_le` DATETIME NULL, timestamps
- **FK**: `utilisateur_id` → `utilisateurs.id`
- **Indexes**: `(utilisateur_id, lu_le)` for unread queries

### 25. `documents`
- **Columns**: `id` BIGINT PK, `titre` VARCHAR(255) NOT NULL, `contenu` TEXT, `fichier_url` VARCHAR(500), `type` ENUM('DOCUMENT','REGLEMENT','EVENEMENT','ACTUALITE'), `audience_scope` ENUM('TOUS','ROLE','GROUPE','ENFANT'), `visible_from` DATETIME, `visible_to` DATETIME, `created_by` BIGINT NOT NULL, `is_archived` TINYINT(1) DEFAULT 0, timestamps
- **FK**: `created_by` → `utilisateurs.id`
- **Indexes**: `(type, audience_scope)`, `(visible_from, visible_to)`

### 26. `document_roles`
- **Columns**: `id` BIGINT PK, `document_id` BIGINT NOT NULL, `role` ENUM('PRESIDENT','DIRECTEUR','EDUCATEUR','PARENT','VISITEUR')
- **FK**: `document_id` → `documents.id`
- **UNIQUE**: `(document_id, role)`
- **Indexes**: `(role)`

### 27. `document_groupes`
- **Columns**: `id` BIGINT PK, `document_id` BIGINT NOT NULL, `groupe_id` BIGINT NOT NULL
- **FK**: `document_id` → `documents.id`; `groupe_id` → `groupes.id`
- **UNIQUE**: `(document_id, groupe_id)`
- **Indexes**: `(groupe_id)`

### 28. `document_enfants`
- **Columns**: `id` BIGINT PK, `document_id` BIGINT NOT NULL, `enfant_id` BIGINT NOT NULL
- **FK**: `document_id` → `documents.id`; `enfant_id` → `enfants.id`
- **UNIQUE**: `(document_id, enfant_id)`
- **Indexes**: `(enfant_id)`

---

## ERD-style relationship map

- `utilisateurs` 1‑N `enfants` (creator), 1‑N `groupes_annees` (educateur), 1‑N `affectations_educateurs`, 1‑N `daily_notes`, 1‑N `threads` (creator), 1‑N `messages`, 1‑N `notifications`, 1‑N `documents`, and N‑N `enfants` through `parents_enfants`.
- `enfants` 1‑1 `fiche_enfant`, 1‑1 `parents_fiche`, N‑N `utilisateurs` via `parents_enfants`, 1‑N `inscriptions_enfants`, 1‑N `observation_initiale`, 1‑N `pei_versions`, 1‑N `daily_notes`, 1‑N `threads`, and N‑N `documents` via `document_enfants`.
- `annees_scolaires` 1‑N `groupes_annees`, `inscriptions_enfants`, `observation_initiale`, and `pei_versions` ensuring yearly scoping.
- `groupes` 1‑N `groupes_annees`; each `groupes_annees` row ties to exactly one `annee_scolaire` and one educateur, feeding `affectations_educateurs` (history) and `inscriptions_enfants` (child membership).
- `observation_initiale` links `enfant` + `annee_scolaire` + `educateur`, feeding `pei_versions` via `observation_id`.
- `pei_versions` 1‑N `pei_objectifs`, which 1‑N `pei_activites`; `pei_versions` also 1‑N `pei_evaluations` and `pei_history_log`.
- `daily_notes` optionally link to `pei_versions` and `pei_objectifs` to provide traceability and respect visibility scopes.
- Messaging stack: `threads` (scoped to `enfant`) 1‑N `messages` and 1‑N `thread_participants`; `messages` 1‑N `message_read_receipts` and N‑N `attachments` via `message_attachments`.
- `documents` can target audiences via `document_roles`, `document_groupes`, and `document_enfants` tables.
- `notifications` always point to a single `utilisateur` with optional polymorphic source references.

This TARGET_SCHEMA removes all AI-related tables and expresses every business rule as a database-level constraint or enforceable trigger, ensuring long-term integrity, privacy, and performance.
