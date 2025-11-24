#!/bin/bash

# Generate 24 Sequelize migration files with full table definitions
# Usage (Linux/Mac/Git Bash):
#   ./generate-migrations.sh
# Files will be written into ./migrations with timestamp prefixes.

mkdir -p migrations

timestamp=$(date +%Y%m%d%H%M%S)

make_migration() {
  name=$1
  content=$2
  file="migrations/${timestamp}-${name}.js"
  echo "$content" > "$file"
  echo "✅ $file"
  sleep 1
  timestamp=$(date +%Y%m%d%H%M%S)
}

# 1) utilisateurs
make_migration "create-utilisateurs" "$(cat <<'EOF'
'use strict';
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('utilisateurs', {
      id: { type: Sequelize.INTEGER.UNSIGNED, autoIncrement: true, primaryKey: true },
      nom: { type: Sequelize.STRING(100), allowNull: false },
      prenom: { type: Sequelize.STRING(100), allowNull: false },
      email: { type: Sequelize.STRING(150), allowNull: false, unique: true },
      mot_de_passe: { type: Sequelize.STRING(255), allowNull: false },
      telephone: { type: Sequelize.STRING(50) },
      role: { type: Sequelize.ENUM('PRESIDENT','DIRECTEUR','EDUCATEUR','PARENT'), allowNull: false },
      is_active: { type: Sequelize.BOOLEAN, defaultValue: true },
      avatar_url: { type: Sequelize.STRING(255) },
      created_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.NOW },
      updated_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.NOW }
    });
  },
  down: async (queryInterface) => {
    await queryInterface.dropTable('utilisateurs');
  }
};
EOF
)"

# 2) enfants
make_migration "create-enfants" "$(cat <<'EOF'
'use strict';
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('enfants', {
      id: { type: Sequelize.INTEGER.UNSIGNED, autoIncrement: true, primaryKey: true },
      nom: { type: Sequelize.STRING(100), allowNull: false },
      prenom: { type: Sequelize.STRING(100), allowNull: false },
      date_naissance: { type: Sequelize.DATEONLY, allowNull: false },
      parent_user_id: { type: Sequelize.INTEGER.UNSIGNED, allowNull: true, references: { model: 'utilisateurs', key: 'id' }, onUpdate: 'CASCADE', onDelete: 'SET NULL' },
      created_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.NOW },
      updated_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.NOW }
    });
  },
  down: async (queryInterface) => {
    await queryInterface.dropTable('enfants');
  }
};
EOF
)"

# 3) fiche_enfant
make_migration "create-fiche-enfant" "$(cat <<'EOF'
'use strict';
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('fiche_enfant', {
      enfant_id: { type: Sequelize.INTEGER.UNSIGNED, primaryKey: true, references: { model: 'enfants', key: 'id' }, onUpdate: 'CASCADE', onDelete: 'CASCADE' },
      lieu_naissance: Sequelize.STRING(150),
      diagnostic_medical: Sequelize.TEXT,
      nb_freres: Sequelize.INTEGER,
      nb_soeurs: Sequelize.INTEGER,
      rang_enfant: Sequelize.INTEGER,
      situation_familiale: Sequelize.ENUM('deux_parents','pere_seul','mere_seule','autre'),
      diag_auteur_nom: Sequelize.STRING(150),
      diag_auteur_description: Sequelize.TEXT,
      carte_invalidite_numero: Sequelize.STRING(100),
      carte_invalidite_couleur: Sequelize.STRING(50),
      type_handicap: Sequelize.STRING(150),
      troubles_principaux: Sequelize.TEXT,
      created_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.NOW },
      updated_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.NOW }
    });
  },
  down: async (queryInterface) => {
    await queryInterface.dropTable('fiche_enfant');
  }
};
EOF
)"

# 4) parents_fiche
make_migration "create-parents-fiche" "$(cat <<'EOF'
'use strict';
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('parents_fiche', {
      id: { type: Sequelize.INTEGER.UNSIGNED, autoIncrement: true, primaryKey: true },
      enfant_id: { type: Sequelize.INTEGER.UNSIGNED, allowNull: false, unique: true, references: { model: 'enfants', key: 'id' }, onUpdate: 'CASCADE', onDelete: 'CASCADE' },
      pere_user_id: { type: Sequelize.INTEGER.UNSIGNED, allowNull: true, references: { model: 'utilisateurs', key: 'id' }, onUpdate: 'CASCADE', onDelete: 'SET NULL' },
      pere_nom: Sequelize.STRING(100),
      pere_prenom: Sequelize.STRING(100),
      pere_naissance_date: Sequelize.DATEONLY,
      pere_naissance_lieu: Sequelize.STRING(150),
      pere_origine: Sequelize.STRING(150),
      pere_cin_numero: Sequelize.STRING(50),
      pere_cin_delivree_a: Sequelize.STRING(150),
      pere_adresse: Sequelize.STRING(255),
      pere_profession: Sequelize.STRING(120),
      pere_couverture_sociale: Sequelize.STRING(255),
      pere_tel_domicile: Sequelize.STRING(50),
      pere_tel_travail: Sequelize.STRING(50),
      pere_tel_portable: Sequelize.STRING(50),
      mere_user_id: { type: Sequelize.INTEGER.UNSIGNED, allowNull: true, references: { model: 'utilisateurs', key: 'id' }, onUpdate: 'CASCADE', onDelete: 'SET NULL' },
      mere_nom: Sequelize.STRING(100),
      mere_prenom: Sequelize.STRING(100),
      mere_naissance_date: Sequelize.DATEONLY,
      mere_naissance_lieu: Sequelize.STRING(150),
      mere_origine: Sequelize.STRING(150),
      mere_cin_numero: Sequelize.STRING(50),
      mere_cin_delivree_a: Sequelize.STRING(150),
      mere_adresse: Sequelize.STRING(255),
      mere_profession: Sequelize.STRING(120),
      mere_couverture_sociale: Sequelize.STRING(255),
      mere_tel_domicile: Sequelize.STRING(50),
      mere_tel_travail: Sequelize.STRING(50),
      mere_tel_portable: Sequelize.STRING(50),
      created_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.NOW },
      updated_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.NOW }
    });
  },
  down: async (queryInterface) => {
    await queryInterface.dropTable('parents_fiche');
  }
};
EOF
)"

# 5) annees_scolaires
make_migration "create-annees-scolaires" "$(cat <<'EOF'
'use strict';
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('annees_scolaires', {
      id: { type: Sequelize.INTEGER.UNSIGNED, autoIncrement: true, primaryKey: true },
      libelle: { type: Sequelize.STRING(20), allowNull: false, unique: true },
      date_debut: { type: Sequelize.DATEONLY, allowNull: false },
      date_fin: { type: Sequelize.DATEONLY, allowNull: false },
      est_active: { type: Sequelize.BOOLEAN, defaultValue: false },
      created_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.NOW },
      updated_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.NOW }
    });
  },
  down: async (queryInterface) => {
    await queryInterface.dropTable('annees_scolaires');
  }
};
EOF
)"

# 6) groupes
make_migration "create-groupes" "$(cat <<'EOF'
'use strict';
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('groupes', {
      id: { type: Sequelize.INTEGER.UNSIGNED, autoIncrement: true, primaryKey: true },
      annee_id: { type: Sequelize.INTEGER.UNSIGNED, allowNull: false, references: { model: 'annees_scolaires', key: 'id' }, onUpdate: 'CASCADE', onDelete: 'CASCADE' },
      nom: { type: Sequelize.STRING(120), allowNull: false },
      description: Sequelize.TEXT,
      # manager_id: { type: Sequelize.INTEGER.UNSIGNED, allowNull: true, references: { model: 'utilisateurs', key: 'id' }, onUpdate: 'CASCADE', onDelete: 'SET NULL' },
      statut: { type: Sequelize.ENUM('actif','archive'), defaultValue: 'actif' },
      created_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.NOW },
      updated_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.NOW }
    });
  },
  down: async (queryInterface) => {
    await queryInterface.dropTable('groupes');
  }
};
EOF
)"

# 7) inscriptions_enfants
make_migration "create-inscriptions-enfants" "$(cat <<'EOF'
'use strict';
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('inscriptions_enfants', {
      id: { type: Sequelize.INTEGER.UNSIGNED, autoIncrement: true, primaryKey: true },
      annee_id: { type: Sequelize.INTEGER.UNSIGNED, allowNull: false, references: { model: 'annees_scolaires', key: 'id' }, onUpdate: 'CASCADE', onDelete: 'CASCADE' },
      groupe_id: { type: Sequelize.INTEGER.UNSIGNED, allowNull: false, references: { model: 'groupes', key: 'id' }, onUpdate: 'CASCADE', onDelete: 'CASCADE' },
      enfant_id: { type: Sequelize.INTEGER.UNSIGNED, allowNull: false, references: { model: 'enfants', key: 'id' }, onUpdate: 'CASCADE', onDelete: 'CASCADE' },
      date_inscription: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.NOW },
      created_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.NOW },
      updated_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.NOW }
    });
    await queryInterface.addIndex('inscriptions_enfants', ['enfant_id','annee_id'], { unique: true, name: 'uniq_enfant_annee' });
  },
  down: async (queryInterface) => {
    await queryInterface.dropTable('inscriptions_enfants');
  }
};
EOF
)"

# 8) affectations_educateurs
make_migration "create-affectations-educateurs" "$(cat <<'EOF'
'use strict';
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('affectations_educateurs', {
      id: { type: Sequelize.INTEGER.UNSIGNED, autoIncrement: true, primaryKey: true },
      annee_id: { type: Sequelize.INTEGER.UNSIGNED, allowNull: false, references: { model: 'annees_scolaires', key: 'id' }, onUpdate: 'CASCADE', onDelete: 'CASCADE' },
      groupe_id: { type: Sequelize.INTEGER.UNSIGNED, allowNull: false, references: { model: 'groupes', key: 'id' }, onUpdate: 'CASCADE', onDelete: 'CASCADE' },
      educateur_id: { type: Sequelize.INTEGER.UNSIGNED, allowNull: false, references: { model: 'utilisateurs', key: 'id' }, onUpdate: 'CASCADE', onDelete: 'CASCADE' },
      date_affectation: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.NOW },
      created_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.NOW },
      updated_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.NOW }
    });
    await queryInterface.addIndex('affectations_educateurs', ['educateur_id','annee_id'], { unique: true, name: 'uniq_educateur_annee' });
    await queryInterface.addIndex('affectations_educateurs', ['groupe_id','annee_id'], { unique: true, name: 'uniq_groupe_annee' });
  },
  down: async (queryInterface) => {
    await queryInterface.dropTable('affectations_educateurs');
  }
};
EOF
)"

# 9) observation_initiale
make_migration "create-observation-initiale" "$(cat <<'EOF'
'use strict';
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('observation_initiale', {
      id: { type: Sequelize.INTEGER.UNSIGNED, autoIncrement: true, primaryKey: true },
      enfant_id: { type: Sequelize.INTEGER.UNSIGNED, allowNull: false, references: { model: 'enfants', key: 'id' }, onUpdate: 'CASCADE', onDelete: 'CASCADE' },
      educateur_id: { type: Sequelize.INTEGER.UNSIGNED, allowNull: false, references: { model: 'utilisateurs', key: 'id' }, onUpdate: 'CASCADE', onDelete: 'CASCADE' },
      date_observation: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.NOW },
      contenu: { type: Sequelize.TEXT, allowNull: false },
      created_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.NOW },
      updated_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.NOW }
    });
  },
  down: async (queryInterface) => {
    await queryInterface.dropTable('observation_initiale');
  }
};
EOF
)"

# 10) projet_educatif_individuel (PEI)
make_migration "create-projet-educatif-individuel" "$(cat <<'EOF'
'use strict';
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('projet_educatif_individuel', {
      id: { type: Sequelize.INTEGER.UNSIGNED, autoIncrement: true, primaryKey: true },
      enfant_id: { type: Sequelize.INTEGER.UNSIGNED, allowNull: false, references: { model: 'enfants', key: 'id' }, onUpdate: 'CASCADE', onDelete: 'CASCADE' },
      educateur_id: { type: Sequelize.INTEGER.UNSIGNED, allowNull: false, references: { model: 'utilisateurs', key: 'id' }, onUpdate: 'CASCADE', onDelete: 'CASCADE' },
      annee_id: { type: Sequelize.INTEGER.UNSIGNED, allowNull: false, references: { model: 'annees_scolaires', key: 'id' }, onUpdate: 'CASCADE', onDelete: 'CASCADE' },
      date_creation: { type: Sequelize.DATEONLY, allowNull: false },
      objectifs: { type: Sequelize.TEXT },
      statut: { type: Sequelize.ENUM('brouillon','actif','clos'), defaultValue: 'brouillon' },
      precedent_projet_id: { type: Sequelize.INTEGER.UNSIGNED, allowNull: true, references: { model: 'projet_educatif_individuel', key: 'id' }, onUpdate: 'CASCADE', onDelete: 'SET NULL' },
      date_derniere_maj: { type: Sequelize.DATE },
      created_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.NOW },
      updated_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.NOW }
    });
  },
  down: async (queryInterface) => {
    await queryInterface.dropTable('projet_educatif_individuel');
  }
};
EOF
)"

# 11) activite_projet
make_migration "create-activite-projet" "$(cat <<'EOF'
'use strict';
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('activite_projet', {
      id: { type: Sequelize.INTEGER.UNSIGNED, autoIncrement: true, primaryKey: true },
      projet_id: { type: Sequelize.INTEGER.UNSIGNED, allowNull: false, references: { model: 'projet_educatif_individuel', key: 'id' }, onUpdate: 'CASCADE', onDelete: 'CASCADE' },
      educateur_id: { type: Sequelize.INTEGER.UNSIGNED, allowNull: false, references: { model: 'utilisateurs', key: 'id' }, onUpdate: 'CASCADE', onDelete: 'CASCADE' },
      enfant_id: { type: Sequelize.INTEGER.UNSIGNED, allowNull: false, references: { model: 'enfants', key: 'id' }, onUpdate: 'CASCADE', onDelete: 'CASCADE' },
      date_activite: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.NOW },
      titre: { type: Sequelize.STRING(150) },
      description: { type: Sequelize.TEXT },
      objectifs: { type: Sequelize.TEXT },
      type: { type: Sequelize.ENUM('atelier','jeu','autre'), defaultValue: 'autre' },
      created_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.NOW },
      updated_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.NOW }
    });
  },
  down: async (queryInterface) => {
    await queryInterface.dropTable('activite_projet');
  }
};
EOF
)"

# 12) daily_notes
make_migration "create-daily-notes" "$(cat <<'EOF'
'use strict';
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('daily_notes', {
      id: { type: Sequelize.INTEGER.UNSIGNED, autoIncrement: true, primaryKey: true },
      projet_id: { type: Sequelize.INTEGER.UNSIGNED, allowNull: false, references: { model: 'projet_educatif_individuel', key: 'id' }, onUpdate: 'CASCADE', onDelete: 'CASCADE' },
      educateur_id: { type: Sequelize.INTEGER.UNSIGNED, allowNull: false, references: { model: 'utilisateurs', key: 'id' }, onUpdate: 'CASCADE', onDelete: 'CASCADE' },
      enfant_id: { type: Sequelize.INTEGER.UNSIGNED, allowNull: false, references: { model: 'enfants', key: 'id' }, onUpdate: 'CASCADE', onDelete: 'CASCADE' },
      date_note: { type: Sequelize.DATEONLY, allowNull: false },
      contenu: { type: Sequelize.TEXT },
      type: { type: Sequelize.STRING(50) },
      pieces_jointes: { type: Sequelize.TEXT },
      created_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.NOW },
      updated_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.NOW }
    });
  },
  down: async (queryInterface) => {
    await queryInterface.dropTable('daily_notes');
  }
};
EOF
)"

# 13) evaluation_projet
make_migration "create-evaluation-projet" "$(cat <<'EOF'
'use strict';
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('evaluation_projet', {
      id: { type: Sequelize.INTEGER.UNSIGNED, autoIncrement: true, primaryKey: true },
      projet_id: { type: Sequelize.INTEGER.UNSIGNED, allowNull: false, references: { model: 'projet_educatif_individuel', key: 'id' }, onUpdate: 'CASCADE', onDelete: 'CASCADE' },
      educateur_id: { type: Sequelize.INTEGER.UNSIGNED, allowNull: false, references: { model: 'utilisateurs', key: 'id' }, onUpdate: 'CASCADE', onDelete: 'CASCADE' },
      date_evaluation: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.NOW },
      score: { type: Sequelize.INTEGER },
      grille: { type: Sequelize.JSON },
      notes: { type: Sequelize.TEXT },
      created_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.NOW },
      updated_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.NOW }
    });
  },
  down: async (queryInterface) => {
    await queryInterface.dropTable('evaluation_projet');
  }
};
EOF
)"

# 14) historique_projet
make_migration "create-historique-projet" "$(cat <<'EOF'
'use strict';
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('historique_projet', {
      id: { type: Sequelize.INTEGER.UNSIGNED, autoIncrement: true, primaryKey: true },
      projet_id: { type: Sequelize.INTEGER.UNSIGNED, allowNull: false, references: { model: 'projet_educatif_individuel', key: 'id' }, onUpdate: 'CASCADE', onDelete: 'CASCADE' },
      educateur_id: { type: Sequelize.INTEGER.UNSIGNED, allowNull: false, references: { model: 'utilisateurs', key: 'id' }, onUpdate: 'CASCADE', onDelete: 'CASCADE' },
      date_modification: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.NOW },
      ancien_objectifs: { type: Sequelize.TEXT },
      ancien_statut: { type: Sequelize.STRING(30) },
      raison_modification: { type: Sequelize.TEXT },
      created_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.NOW },
      updated_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.NOW }
    });
  },
  down: async (queryInterface) => {
    await queryInterface.dropTable('historique_projet');
  }
};
EOF
)"

# 18) documents
make_migration "create-documents" "$(cat <<'EOF'
'use strict';
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('documents', {
      id: { type: Sequelize.INTEGER.UNSIGNED, autoIncrement: true, primaryKey: true },
      admin_id: { type: Sequelize.INTEGER.UNSIGNED, allowNull: false, references: { model: 'utilisateurs', key: 'id' }, onUpdate: 'CASCADE', onDelete: 'CASCADE' },
      type: { type: Sequelize.ENUM('reglement','autre'), defaultValue: 'autre' },
      titre: { type: Sequelize.STRING(200) },
      url: { type: Sequelize.STRING(255) },
      statut: { type: Sequelize.ENUM('brouillon','publie'), defaultValue: 'publie' },
      created_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.NOW },
      updated_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.NOW }
    });
  },
  down: async (queryInterface) => {
    await queryInterface.dropTable('documents');
  }
};
EOF
)"

# 19) reglements
make_migration "create-reglements" "$(cat <<'EOF'
'use strict';
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('reglements', {
      id: { type: Sequelize.INTEGER.UNSIGNED, autoIncrement: true, primaryKey: true },
      document_id: { type: Sequelize.INTEGER.UNSIGNED, allowNull: false, references: { model: 'documents', key: 'id' }, onUpdate: 'CASCADE', onDelete: 'CASCADE' },
      version: { type: Sequelize.STRING(30) },
      date_effet: { type: Sequelize.DATEONLY },
      created_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.NOW },
      updated_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.NOW }
    });
  },
  down: async (queryInterface) => {
    await queryInterface.dropTable('reglements');
  }
};
EOF
)"

# 20) evenements
make_migration "create-evenements" "$(cat <<'EOF'
'use strict';
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('evenements', {
      id: { type: Sequelize.INTEGER.UNSIGNED, autoIncrement: true, primaryKey: true },
      document_id: { type: Sequelize.INTEGER.UNSIGNED, allowNull: true, references: { model: 'documents', key: 'id' }, onUpdate: 'CASCADE', onDelete: 'SET NULL' },
      admin_id: { type: Sequelize.INTEGER.UNSIGNED, allowNull: false, references: { model: 'utilisateurs', key: 'id' }, onUpdate: 'CASCADE', onDelete: 'CASCADE' },
      titre: { type: Sequelize.STRING(200), allowNull: false },
      description: { type: Sequelize.TEXT },
      debut: { type: Sequelize.DATE },
      fin: { type: Sequelize.DATE },
      audience: { type: Sequelize.ENUM('parents','educateurs','tous'), defaultValue: 'tous' },
      lieu: { type: Sequelize.STRING(200) },
      created_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.NOW },
      updated_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.NOW }
    });
  },
  down: async (queryInterface) => {
    await queryInterface.dropTable('evenements');
  }
};
EOF
)"

# 21) actualites
make_migration "create-actualites" "$(cat <<'EOF'
'use strict';
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('actualites', {
      id: { type: Sequelize.INTEGER.UNSIGNED, autoIncrement: true, primaryKey: true },
      admin_id: { type: Sequelize.INTEGER.UNSIGNED, allowNull: false, references: { model: 'utilisateurs', key: 'id' }, onUpdate: 'CASCADE', onDelete: 'CASCADE' },
      titre: { type: Sequelize.STRING(200), allowNull: false },
      contenu: { type: Sequelize.TEXT },
      publie_le: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.NOW },
      created_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.NOW },
      updated_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.NOW }
    });
  },
  down: async (queryInterface) => {
    await queryInterface.dropTable('actualites');
  }
};
EOF
)"

# 22) threads
make_migration "create-threads" "$(cat <<'EOF'
'use strict';
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('threads', {
      id: { type: Sequelize.INTEGER.UNSIGNED, autoIncrement: true, primaryKey: true },
      created_by: { type: Sequelize.INTEGER.UNSIGNED, allowNull: false, references: { model: 'utilisateurs', key: 'id' }, onUpdate: 'CASCADE', onDelete: 'CASCADE' },
      enfant_id: { type: Sequelize.INTEGER.UNSIGNED, allowNull: true, references: { model: 'enfants', key: 'id' }, onUpdate: 'CASCADE', onDelete: 'SET NULL' },
      sujet: { type: Sequelize.STRING(200), allowNull: false },
      created_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.NOW },
      updated_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.NOW }
    });
  },
  down: async (queryInterface) => {
    await queryInterface.dropTable('threads');
  }
};
EOF
)"

# 23) messages
make_migration "create-messages" "$(cat <<'EOF'
'use strict';
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('messages', {
      id: { type: Sequelize.INTEGER.UNSIGNED, autoIncrement: true, primaryKey: true },
      thread_id: { type: Sequelize.INTEGER.UNSIGNED, allowNull: false, references: { model: 'threads', key: 'id' }, onUpdate: 'CASCADE', onDelete: 'CASCADE' },
      expediteur_id: { type: Sequelize.INTEGER.UNSIGNED, allowNull: false, references: { model: 'utilisateurs', key: 'id' }, onUpdate: 'CASCADE', onDelete: 'CASCADE' },
      texte: { type: Sequelize.TEXT, allowNull: false },
      pieces_jointes: { type: Sequelize.JSON },
      created_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.NOW },
      updated_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.NOW }
    });
  },
  down: async (queryInterface) => {
    await queryInterface.dropTable('messages');
  }
};
EOF
)"

# 24) notifications
make_migration "create-notifications" "$(cat <<'EOF'
'use strict';
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('notifications', {
      id: { type: Sequelize.INTEGER.UNSIGNED, autoIncrement: true, primaryKey: true },
      utilisateur_id: { type: Sequelize.INTEGER.UNSIGNED, allowNull: false, references: { model: 'utilisateurs', key: 'id' }, onUpdate: 'CASCADE', onDelete: 'CASCADE' },
      type: { type: Sequelize.STRING(50) },
      titre: { type: Sequelize.STRING(200) },
      corps: { type: Sequelize.TEXT },
      lu_le: { type: Sequelize.DATE },
      created_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.NOW },
      updated_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.NOW }
    });
  },
  down: async (queryInterface) => {
    await queryInterface.dropTable('notifications');
  }
};
EOF
)"
