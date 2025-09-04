const bcrypt = require("bcryptjs");
const db = require("../models");

(async () => {
  try {
    await db.sequelize.sync({ alter: true });

    const now = new Date();
    const roles = ["directeur", "president", "educateur", "parent"];
    for (const name of roles) {
      await db.Role.findOrCreate({ where: { name }, defaults: { name } });
    }

    const pass = await bcrypt.hash("test1234", 10);
    const parentRole = await db.Role.findOne({ where: { name: "parent" } });
    const educRole = await db.Role.findOne({ where: { name: "educateur" } });

    const [parent] = await db.User.findOrCreate({
      where: { email: "parent@example.com" },
      defaults: {
        nom: "Nadia",
        prenom: "Salah",
        email: "parent@example.com",
        motDePasse: pass,
        roleId: parentRole.id,
      },
    });

    const [educ] = await db.User.findOrCreate({
      where: { email: "educateur@example.com" },
      defaults: {
        nom: "Sami",
        prenom: "Amal",
        email: "educateur@example.com",
        motDePasse: pass,
        roleId: educRole.id,
      },
    });

    const [child] = await db.Child.findOrCreate({
      where: { nom: "Yassine", guardianId: parent.id },
      defaults: {
        nom: "Yassine",
        guardianId: parent.id,
        dateNaissance: "2019-03-20",
        diagnosisSummary: "TSA niveau 1",
      },
    });

    await db.ChildRecord.findOrCreate({
      where: { childId: child.id },
      defaults: {
        childId: child.id,
        medicalNotes: "OK",
        strengths: "Curieux",
        needs: "Routines claires",
      },
    });

    console.log("Seed fast DONE");
    process.exit(0);
  } catch (e) {
    console.error(e);
    process.exit(1);
  }
})();
