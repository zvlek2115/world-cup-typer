import { PrismaClient, Role } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  // Clear all matches and predictions to start fresh with accurate data
  await prisma.prediction.deleteMany({});
  await prisma.match.deleteMany({});

  // Ensure admin user exists
  const adminUsername = 'zylek';
  const adminPassword = 'zylek';
  const hashedPassword = await bcrypt.hash(adminPassword, 10);

  const existingAdmin = await prisma.user.findUnique({
    where: { username: adminUsername }
  });

  if (!existingAdmin) {
    console.log(`Creating admin user: ${adminUsername}`);
    await prisma.user.create({
      data: {
        username: adminUsername,
        passwordHash: hashedPassword,
        role: Role.ADMIN
      }
    });
  } else {
    console.log(`Updating existing user ${adminUsername} to ADMIN role`);
    await prisma.user.update({
      where: { username: adminUsername },
      data: { 
        passwordHash: hashedPassword,
        role: Role.ADMIN 
      }
    });
  }

  const matches = [
    { "homeTeam": "Meksyk", "awayTeam": "RPA", "startTime": new Date("2026-06-11T19:00:00Z") },
    { "homeTeam": "Korea Południowa", "awayTeam": "Czechy", "startTime": new Date("2026-06-12T02:00:00Z") },
    { "homeTeam": "Kanada", "awayTeam": "Bośnia i Hercegowina", "startTime": new Date("2026-06-12T19:00:00Z") },
    { "homeTeam": "USA", "awayTeam": "Paragwaj", "startTime": new Date("2026-06-13T01:00:00Z") },
    { "homeTeam": "Katar", "awayTeam": "Szwajcaria", "startTime": new Date("2026-06-13T19:00:00Z") },
    { "homeTeam": "Brazylia", "awayTeam": "Maroko", "startTime": new Date("2026-06-13T22:00:00Z") },
    { "homeTeam": "Haiti", "awayTeam": "Szkocja", "startTime": new Date("2026-06-14T01:00:00Z") },
    { "homeTeam": "Australia", "awayTeam": "Turcja", "startTime": new Date("2026-06-14T04:00:00Z") },
    { "homeTeam": "Niemcy", "awayTeam": "Curacao", "startTime": new Date("2026-06-14T17:00:00Z") },
    { "homeTeam": "Holandia", "awayTeam": "Japonia", "startTime": new Date("2026-06-14T20:00:00Z") },
    { "homeTeam": "Wybrzeże Kości Słoniowej", "awayTeam": "Ekwador", "startTime": new Date("2026-06-14T23:00:00Z") },
    { "homeTeam": "Szwecja", "awayTeam": "Tunezja", "startTime": new Date("2026-06-15T02:00:00Z") },
    { "homeTeam": "Hiszpania", "awayTeam": "Republika Zielonego Przylądka", "startTime": new Date("2026-06-15T16:00:00Z") },
    { "homeTeam": "Belgia", "awayTeam": "Egipt", "startTime": new Date("2026-06-15T19:00:00Z") },
    { "homeTeam": "Arabia Saudyjska", "awayTeam": "Urugwaj", "startTime": new Date("2026-06-15T22:00:00Z") },
    { "homeTeam": "Iran", "awayTeam": "Nowa Zelandia", "startTime": new Date("2026-06-16T01:00:00Z") },
    { "homeTeam": "Francja", "awayTeam": "Senegal", "startTime": new Date("2026-06-16T19:00:00Z") },
    { "homeTeam": "Irak", "awayTeam": "Norwegia", "startTime": new Date("2026-06-16T22:00:00Z") },
    { "homeTeam": "Argentyna", "awayTeam": "Algieria", "startTime": new Date("2026-06-17T01:00:00Z") },
    { "homeTeam": "Austria", "awayTeam": "Jordania", "startTime": new Date("2026-06-17T04:00:00Z") },
    { "homeTeam": "Portugalia", "awayTeam": "DR Konga", "startTime": new Date("2026-06-17T17:00:00Z") },
    { "homeTeam": "Anglia", "awayTeam": "Chorwacja", "startTime": new Date("2026-06-17T20:00:00Z") },
    { "homeTeam": "Ghana", "awayTeam": "Panama", "startTime": new Date("2026-06-17T23:00:00Z") },
    { "homeTeam": "Uzbekistan", "awayTeam": "Kolumbia", "startTime": new Date("2026-06-18T02:00:00Z") },
    { "homeTeam": "Czechy", "awayTeam": "RPA", "startTime": new Date("2026-06-18T16:00:00Z") },
    { "homeTeam": "Szwajcaria", "awayTeam": "Bośnia i Hercegowina", "startTime": new Date("2026-06-18T19:00:00Z") },
    { "homeTeam": "Kanada", "awayTeam": "Katar", "startTime": new Date("2026-06-18T22:00:00Z") },
    { "homeTeam": "Meksyk", "awayTeam": "Korea Południowa", "startTime": new Date("2026-06-19T01:00:00Z") },
    { "homeTeam": "USA", "awayTeam": "Australia", "startTime": new Date("2026-06-19T19:00:00Z") },
    { "homeTeam": "Szkocja", "awayTeam": "Maroko", "startTime": new Date("2026-06-19T22:00:00Z") },
    { "homeTeam": "Brazylia", "awayTeam": "Haiti", "startTime": new Date("2026-06-20T01:00:00Z") },
    { "homeTeam": "Turcja", "awayTeam": "Paragwaj", "startTime": new Date("2026-06-20T03:00:00Z") },
    { "homeTeam": "Holandia", "awayTeam": "Szwecja", "startTime": new Date("2026-06-20T17:00:00Z") },
    { "homeTeam": "Niemcy", "awayTeam": "Wybrzeże Kości Słoniowej", "startTime": new Date("2026-06-20T20:00:00Z") },
    { "homeTeam": "Ekwador", "awayTeam": "Curacao", "startTime": new Date("2026-06-21T00:00:00Z") },
    { "homeTeam": "Tunezja", "awayTeam": "Japonia", "startTime": new Date("2026-06-21T04:00:00Z") },
    { "homeTeam": "Hiszpania", "awayTeam": "Arabia Saudyjska", "startTime": new Date("2026-06-21T16:00:00Z") },
    { "homeTeam": "Belgia", "awayTeam": "Iran", "startTime": new Date("2026-06-21T19:00:00Z") },
    { "homeTeam": "Urugwaj", "awayTeam": "Republika Zielonego Przylądka", "startTime": new Date("2026-06-21T22:00:00Z") },
    { "homeTeam": "Nowa Zelandia", "awayTeam": "Egipt", "startTime": new Date("2026-06-22T01:00:00Z") },
    { "homeTeam": "Argentyna", "awayTeam": "Austria", "startTime": new Date("2026-06-22T17:00:00Z") },
    { "homeTeam": "Francja", "awayTeam": "Irak", "startTime": new Date("2026-06-22T21:00:00Z") },
    { "homeTeam": "Norwegia", "awayTeam": "Senegal", "startTime": new Date("2026-06-23T00:00:00Z") },
    { "homeTeam": "Jordania", "awayTeam": "Algieria", "startTime": new Date("2026-06-23T03:00:00Z") },
    { "homeTeam": "Portugalia", "awayTeam": "Uzbekistan", "startTime": new Date("2026-06-23T17:00:00Z") },
    { "homeTeam": "Anglia", "awayTeam": "Ghana", "startTime": new Date("2026-06-23T20:00:00Z") },
    { "homeTeam": "Panama", "awayTeam": "Chorwacja", "startTime": new Date("2026-06-23T23:00:00Z") },
    { "homeTeam": "Kolumbia", "awayTeam": "DR Konga", "startTime": new Date("2026-06-24T02:00:00Z") },
    { "homeTeam": "Szwajcaria", "awayTeam": "Kanada", "startTime": new Date("2026-06-24T19:00:00Z") },
    { "homeTeam": "Bośnia i Hercegowina", "awayTeam": "Katar", "startTime": new Date("2026-06-24T19:00:00Z") }
  ];

  console.log('Clearing and seeding matches with real countries...');

  for (const match of matches) {
    await prisma.match.create({
      data: match,
    });
  }

  console.log(`Seed completed: Added ${matches.length} real WC 2026 matches`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
