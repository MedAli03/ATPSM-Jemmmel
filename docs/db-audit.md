# Database integrity audit

## Step 1 – Entity map
- **utilisateurs** ←→ `roles` enum; linked to many modules via `user_id` FKs (sessions, affectations, PEI ownership, messaging).【F:server/models/index.js†L40-L121】
- **enfants** ← one optional `parent_user_id`; owns single `fiche_enfant` and `parents_fiche` records; referenced by inscriptions, observations, PEI, activities, daily notes, messages via threads, etc.【F:server/models/index.js†L62-L134】【F:server/models/enfant.js†L3-L41】
- **annees_scolaires** ← year dimension powering `groupes`, `inscriptions_enfants`, `affectations_educateurs`, and PEI.【F:server/models/index.js†L70-L98】
- **groupes** ← contain enfants through `inscriptions_enfants`; assigned to éducateurs via `affectations_educateurs`. Group rows already embed `annee_id`, so the effective junction table for yearly assignments is the pair (`groupes`, `affectations_educateurs`).【F:server/models/index.js†L82-L121】【F:server/models/group.js†L4-L25】
- **inscriptions_enfants** ← tracks which enfant joined which groupe during which school year; maintains historical rows through `est_active` and `date_sortie`.【F:server/models/inscription_enfant.js†L4-L26】
- **affectations_educateurs** ← binds éducateur ↔ groupe ↔ année with `est_active` to keep history.【F:server/models/affectation_educateur.js†L4-L27】
- **observation_initiale** ← links enfant ↔ éducateur but currently lacks `annee_id`; supposed to precede PEI creation.【F:server/models/observation_initiale.js†L3-L37】
- **projet_educatif_individuel (PEI)** ← versioned by `precedent_projet_id`, stores status (`EN_ATTENTE_VALIDATION`, `VALIDE`, etc.) and `est_actif` flag. Related tables: `activite_projet`, `daily_notes`, `evaluation_projet`, `historique_projet`.【F:server/models/index.js†L122-L192】【F:server/models/projet_educatif_individuel.js†L1-L21】
- **messaging** ← `threads` ↔ `thread_participants` ↔ `messages` with attachments/read receipts. Threads currently have no FK to `enfant`.【F:server/models/thread.js†L3-L35】【F:server/models/thread_participant.js†L3-L39】【F:server/models/message.js†L3-L35】
- **notifications** ← `notifications.utilisateur_id` FK ensures each record belongs to one user.【F:server/models/notification.js†L1-L20】
- **documents / evenements / actualites / reglements** ← hierarchical content tables linked to administrative utilisateurs in `models/index.js`.【F:server/models/index.js†L193-L232】

## Step 2 – Business rules vs schema
| Rule | Enforcement today | Gaps |
| --- | --- | --- |
| 1. One groupe per enfant per année | Unique constraint `(enfant_id, annee_id, est_active)` on `inscriptions_enfants` after migration 025; `est_active` flags which row is current.【F:server/migrations/025-inscriptions-enfants-history.js†L5-L34】 | Only enforced when `est_active` is managed correctly. No DB constraint ties `groupe_id` to `annee_id`, so a row could reference mismatched years if data entry is wrong. |
| 2. One éducateur per groupe per année | Unique constraint `(groupe_id, annee_id, est_active)` ensures a groupe cannot have two active éducateurs the same year.【F:server/migrations/026-affectations-educateurs-history.js†L5-L35】 | Additional unique `(educateur_id, annee_id, est_active)` currently blocks an éducateur from handling multiple groupes per year even though the business rule only requires the reverse. |
| 3. One active PEI per enfant per année | Column `est_actif` + unique index `(enfant_id, annee_id, est_actif)` added in migration 034 limits duplicate active rows.【F:server/migrations/034-add-pei-active-flag.js†L3-L42】 | `est_actif` allows NULL, so nothing prevents multiple `NULL` entries per year nor enforces that non-active rows must be `0`. No trigger/constraint auto-toggles the flag when status changes. |
| 4. One observation_initiale per enfant/année | Table lacks `annee_id` and any unique constraint; only indexes on `enfant_id`, `educateur_id`, and `date_observation`.【F:server/migrations/009-observation_initiale.js†L10-L38】 | Cannot enforce uniqueness by year or even store the year reference. |
| 5. Messaging tied to one child, participants limited | Threads table has no `enfant_id`; participants table lacks FK to `enfants`. Authorization relies entirely on app logic, so DB cannot guarantee parent-to-child scoping.【F:server/models/thread.js†L3-L35】【F:server/models/index.js†L205-L255】 | Need explicit `thread.enfant_id`, unique participant constraint per thread+user exists, but no check ensuring that user is linked to that child (parent or staff). |
| 6. Notifications belong to one user | `notifications.utilisateur_id` is `NOT NULL` with FK cascades; index on `(utilisateur_id,type)` exists. 【F:server/migrations/024-notifications.js†L10-L33】 | Consider adding `(utilisateur_id, lu_le)` index for unread lookups. |
| 7. Parents cannot see internal data | Schema stores confidential content (daily notes, observations) but lacks visibility flags. `daily_notes` have no field to mark entries as “interne” vs “partageable”, so filtering must happen in code. 【F:server/models/daily_note.js†L3-L15】 | Need explicit boolean/enum to mark what parents can access. |

## Step 3 – Structural improvement opportunities
1. **Normalize parent-child relationships**: replace `enfants.parent_user_id` with a junction table `parents_enfants` so each child can have multiple guardians and each parent can access multiple children. This also makes it easier to enforce messaging eligibility queries. Update `enfants` to drop the single FK and add `parents_enfants` with `(parent_id, enfant_id)` PK + FK to `utilisateurs`.【F:server/models/enfant.js†L3-L41】
2. **Tie inscriptions to consistent years/groups**: add a FK constraint that ensures `inscriptions_enfants.groupe_id` refers to a `groupes` row with the same `annee_id`, or denormalize by storing `groupe_annee_id`. This prevents data-entry mismatches that would bypass the “1 groupe/an” rule even with the unique index. 【F:server/models/inscription_enfant.js†L4-L26】【F:server/models/group.js†L4-L25】
3. **Relax educator uniqueness but strengthen group uniqueness**: keep `(groupe_id, annee_id, est_active)` but drop `(educateur_id, annee_id, est_active)` so one educator can lead multiple groupes the same year. Add a partial index `(educateur_id)` filtered by `est_active = 1` if reporting needs fast lookups without violating requirements.【F:server/models/affectation_educateur.js†L4-L27】
4. **Make `est_actif` deterministic in PEI**: change the column to `NOT NULL DEFAULT 0`, add a check `est_actif IN (0,1)`, and use trigger or application logic to set it to `1` only when `statut = 'VALIDE'`. Enforce a composite unique `(enfant_id, annee_id)` filtered to rows where `est_actif = 1` (MySQL 8 generated column + unique).【F:server/migrations/034-add-pei-active-flag.js†L3-L42】
5. **Add school year to observations**: append `annee_id` (FK to `annees_scolaires`), populate it from the child’s current inscription, and add a unique constraint `(enfant_id, annee_id)` so the “one observation per child per year” rule is enforced. 【F:server/migrations/009-observation_initiale.js†L10-L38】
6. **Anchor messaging threads to enfants**: extend `threads` with `enfant_id` (FK). Add `thread_participants` trigger/constraint to ensure each `user_id` is either the child’s parent (from `parents_enfants`) or staff assigned to the child’s groupe (`affectations_educateurs`). Store a `created_by` FK for auditing. 【F:server/models/thread.js†L3-L35】【F:server/models/thread_participant.js†L3-L39】
7. **Visibility controls on sensitive tables**: add boolean `visible_parents` (default `false`) to `daily_notes`, `activite_projet`, and `observation_initiale` so API filtering is backed by schema. Optionally add check constraints or indexes on `(enfant_id, visible_parents)` for quick queries. 【F:server/models/daily_note.js†L3-L15】【F:server/models/observation_initiale.js†L3-L30】
8. **Notifications index**: add index `(utilisateur_id, lu_le)` or `(utilisateur_id, created_at)` to speed up inbox/unread queries. Add `type` enum or table to avoid inconsistent strings. 【F:server/models/notification.js†L1-L20】
9. **Document/event audience targeting**: consider an association table (document_target_groups/enfants/roles) instead of storing everything in `document`. This keeps RBAC manageable as the platform grows. 【F:server/models/index.js†L193-L214】

## Step 4 – Code examples
### 4.1 Migration: enforce one observation per enfant/year
```js
// migrations/036-add-annee-to-observations.js
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('observation_initiale', 'annee_id', {
      type: Sequelize.INTEGER.UNSIGNED,
      allowNull: false,
      references: { model: 'annees_scolaires', key: 'id' },
      onUpdate: 'CASCADE',
      onDelete: 'RESTRICT',
      after: 'educateur_id',
    });
    await queryInterface.addConstraint('observation_initiale', {
      fields: ['enfant_id', 'annee_id'],
      type: 'unique',
      name: 'uniq_observation_enfant_annee',
    });
    await queryInterface.addIndex('observation_initiale', ['annee_id']);
  },
  async down(queryInterface) {
    await queryInterface.removeIndex('observation_initiale', 'observation_initiale_annee_id');
    await queryInterface.removeConstraint('observation_initiale', 'uniq_observation_enfant_annee');
    await queryInterface.removeColumn('observation_initiale', 'annee_id');
  },
};
```

### 4.2 Migration: tie threads to enfants and authorized participants
```js
// migrations/037-thread-child-link.js
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('threads', 'enfant_id', {
      type: Sequelize.INTEGER.UNSIGNED,
      allowNull: false,
      references: { model: 'enfants', key: 'id' },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE',
      after: 'id',
    });
    await queryInterface.addColumn('threads', 'created_by', {
      type: Sequelize.INTEGER.UNSIGNED,
      allowNull: false,
      references: { model: 'utilisateurs', key: 'id' },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE',
      after: 'enfant_id',
    });
    await queryInterface.addIndex('threads', ['enfant_id', 'updated_at']);

    // optional: enforce participants belong to enfant via stored procedure trigger
    await queryInterface.sequelize.query(`
      CREATE TRIGGER trg_thread_participant_child
      BEFORE INSERT ON thread_participants
      FOR EACH ROW
      BEGIN
        IF NOT EXISTS (
          SELECT 1 FROM parents_enfants pe
          WHERE pe.parent_id = NEW.user_id AND pe.enfant_id = (SELECT enfant_id FROM threads WHERE id = NEW.thread_id)
        ) AND NOT EXISTS (
          SELECT 1 FROM affectations_educateurs ae
          JOIN inscriptions_enfants ie ON ie.groupe_id = ae.groupe_id AND ie.est_active = 1
          WHERE ae.educateur_id = NEW.user_id AND ae.est_active = 1 AND ie.enfant_id = (SELECT enfant_id FROM threads WHERE id = NEW.thread_id)
        ) THEN
          SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'User not authorized for this enfant';
        END IF;
      END;`);
  },
  async down(queryInterface) {
    await queryInterface.removeColumn('threads', 'created_by');
    await queryInterface.removeColumn('threads', 'enfant_id');
    await queryInterface.sequelize.query('DROP TRIGGER IF EXISTS trg_thread_participant_child');
  },
};
```

### 4.3 Model updates (excerpt)
```js
// models/thread.js
module.exports = (sequelize, DataTypes) =>
  sequelize.define('Thread', {
    id: { type: DataTypes.INTEGER.UNSIGNED, autoIncrement: true, primaryKey: true },
    enfant_id: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false },
    created_by: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false },
    title: DataTypes.STRING,
    is_group: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
    archived: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
    last_message_id: { type: DataTypes.BIGINT.UNSIGNED },
  }, { tableName: 'threads', underscored: true, timestamps: true });
```
```js
// models/daily_note.js visibility flag
visible_parents: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
```
```js
// models/parents_enfants.js junction
module.exports = (sequelize, DataTypes) =>
  sequelize.define('ParentEnfant', {
    parent_id: { type: DataTypes.INTEGER.UNSIGNED, primaryKey: true },
    enfant_id: { type: DataTypes.INTEGER.UNSIGNED, primaryKey: true },
    relation: { type: DataTypes.ENUM('MERE','PERE','TUTEUR','AUTRE'), allowNull: false },
  }, { tableName: 'parents_enfants', timestamps: true });
```
Update associations in `models/index.js` accordingly (parents belongToMany enfants via this join table, threads belongTo enfants, etc.).

### 4.4 SQL quality gate examples
```sql
-- Detect enfants assigned to >1 active groupe in the same year
SELECT enfant_id, annee_id, COUNT(*) AS active_rows
FROM inscriptions_enfants
WHERE est_active = 1
GROUP BY enfant_id, annee_id
HAVING COUNT(*) > 1;
```
```sql
-- Find threads without enfant linkage (should return 0 once migration runs)
SELECT id FROM threads WHERE enfant_id IS NULL;
```
```sql
-- Validate each observation has a school year
SELECT id FROM observation_initiale WHERE annee_id IS NULL;
```

## Step 5 – Checklist
- [ ] Add migrations 036/037 (or equivalent) to enforce observation uniqueness and child-linked threads.
- [ ] Introduce `parents_enfants` table and update API logic to consume it.
- [ ] Harden PEI `est_actif` handling (NOT NULL + filtered unique) and backfill values.
- [ ] Add visibility flags on `daily_notes`/`activite_projet`/`observation_initiale` and update queries to filter for parents.
- [ ] Review indexes on `notifications`, `inscriptions_enfants`, and `threads` for the new columns.
- [ ] Retest key flows: enroll child, assign groupe/educateur, create observation + PEI, post notes, send thread messages, and verify notifications.
