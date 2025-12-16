import { config } from "dotenv";
import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

config();

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL!,
});

const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("🌱 Début du seed des challenges et gages...");

  // Récupérer tous les utilisateurs
  const users = await prisma.user.findMany({
    select: { id: true, name: true },
  });

  if (users.length === 0) {
    console.log("❌ Aucun utilisateur trouvé. Créez d'abord des utilisateurs.");
    return;
  }

  console.log(`📦 ${users.length} utilisateur(s) trouvé(s)`);

  // Nettoyer les données existantes
  console.log("🧹 Nettoyage des challenges et gages existants...");
  await prisma.gage.deleteMany({});
  await prisma.challenge.deleteMany({});

  // Créer des challenges pour chaque utilisateur
  console.log("🎯 Création des challenges...");

  const challengesData = [
    {
      title: "Courir 100km ce mois-ci",
      description: "Atteindre 100 kilomètres de course durant le mois",
      isCompleted: false,
    },
    {
      title: "Battre mon record personnel",
      description: "Améliorer mon meilleur temps sur 10km",
      isCompleted: false,
    },
    {
      title: "Courir 5 fois par semaine",
      description: "Maintenir une régularité de 5 courses par semaine",
      isCompleted: true,
    },
    {
      title: "Participer à une course",
      description: "S'inscrire et participer à un événement sportif",
      isCompleted: false,
    },
  ];

  for (const user of users) {
    // Créer 2-3 challenges par utilisateur
    const numChallenges = Math.floor(Math.random() * 2) + 2;

    for (let i = 0; i < numChallenges; i++) {
      const challengeTemplate = challengesData[i % challengesData.length];

      await prisma.challenge.create({
        data: {
          userId: user.id,
          title: challengeTemplate.title,
          description: challengeTemplate.description,
          isCompleted: challengeTemplate.isCompleted,
        },
      });
    }

    console.log(`  ✅ ${numChallenges} challenge(s) créé(s) pour ${user.name}`);
  }

  // Créer des gages (1 par utilisateur max à cause de @unique)
  console.log("⚠️  Création des gages...");

  const gagesData = [
    {
      title: "Porter un costume ridicule",
      description: "Porter un costume de poulet pendant une course",
    },
    {
      title: "Payer l'apéro",
      description: "Offrir une tournée à tout le groupe",
    },
    {
      title: "Courir en arrière",
      description: "Faire un 5km entièrement en courant à reculons",
    },
    {
      title: "Défi culinaire",
      description: "Préparer un repas pour tout le groupe",
    },
  ];

  // Créer un gage pour quelques utilisateurs
  const usersWithGage = users.slice(0, Math.min(users.length, 3));

  for (let i = 0; i < usersWithGage.length; i++) {
    const user = usersWithGage[i];
    const gageTemplate = gagesData[i % gagesData.length];

    // Date d'expiration : entre 7 et 30 jours
    const daysUntilExpiration = Math.floor(Math.random() * 23) + 7;
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + daysUntilExpiration);

    await prisma.gage.create({
      data: {
        userId: user.id,
        title: gageTemplate.title,
        description: gageTemplate.description,
        expiresAt: expiresAt,
        isCompleted: false,
      },
    });

    console.log(`  ⚠️  Gage créé pour ${user.name} (expire dans ${daysUntilExpiration} jours)`);
  }

  console.log("✨ Seed terminé avec succès !");
}

main()
  .catch((e) => {
    console.error("❌ Erreur lors du seed :", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
